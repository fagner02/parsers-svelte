<script>
	import { charWidth, fontSize, lineHeight, subFontSize } from '$lib/globalStyle';
	import { getAugGrammar } from '$lib/utils';
	import { onMount } from 'svelte';
	import { wait } from '$lib/flowControl';
	import CardWrapper from './CardWrapper.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';

	/**
	 * @type {string}
	 */
	export let id;
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>}*/
	export let state;
	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = getAugGrammar().augRules;
	/**@type {HTMLElement}*/
	let container;

	let dotIndex = -1;
	export let hue;
	export let label;
	/** @type {string}*/
	export let stateId;
	/**@type {SvgLines | undefined}*/
	export let svgLines;

	/**
	 * @param {number} ruleIndex
	 * @param {number} pos
	 * @param {Set<string>?} lookahead
	 * @param {string?} srcId
	 */
	export async function addItem(ruleIndex, pos, lookahead = null, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				state.update((x) => [
					...x,
					{
						ruleIndex: ruleIndex,
						pos: pos,
						hide: true,
						lookahead: lookahead ? new Set(lookahead) : null
					}
				]);
				await wait(id, 0);
				let elem = /**@type {HTMLElement}*/ (
					document.querySelector(`#state-${stateId}-${$state.length - 1}`)
				);
				if (srcId) await svgLines?.showLine(srcId, `#state-${stateId}-${$state.length - 1}`, id);

				elem.style.width = `${elem.scrollWidth}px`;
				elem.style.height = `${elem.scrollHeight}px`;
				elem.style.opacity = '1';

				await wait(id, 1500);
				await svgLines?.hideLine(false, id);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {Set<string>} lookahead
	 * @param {number} existent
	 */
	export async function updateLookahead(lookahead, existent) {
		return new Promise(async (resolve, reject) => {
			try {
				state.update((x) => {
					x[existent].lookahead = new Set([
						.../**@type {Set<string>}*/ (x[existent].lookahead),
						...lookahead.values()
					]);
					return x;
				});
				await wait(id, 0);
				let elem = /**@type {HTMLElement}*/ (
					document.querySelector(`#state-${stateId}-${existent}`)
				);

				elem.style.width = `${elem.scrollWidth}px`;
				await wait(id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}
	/**
	 * @param {number} index
	 */
	export async function highlightDot(index) {
		return new Promise(async (resolve, reject) => {
			try {
				dotIndex = index;
				await wait(id, 200);
				dotIndex = -1;
				await wait(id, 200);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {import('@/types').LR0State} stateToLoad
	 */
	export async function loadState(stateToLoad) {
		return new Promise(async (resolve, reject) => {
			try {
				state.update(() =>
					stateToLoad.items.map((x) => {
						return /**@type {import('@/types').LR0StateItem}*/ ({
							ruleIndex: x.ruleIndex,
							pos: x.pos,
							lookahead: x.lookahead
						});
					})
				);
				await wait(id, 0);
				let elem = /**@type {HTMLElement}*/ (document.querySelector(`#state-${stateId}-0`));
				while (elem !== null) {
					elem.style.width = `${elem.scrollWidth}px`;
					elem.style.height = `${elem.scrollHeight}px`;
					elem.style.opacity = '1';

					elem = /**@type {HTMLElement}*/ (elem.nextElementSibling);
				}

				await wait(id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export async function resetState(shouldWait = true) {
		return new Promise(async (resolve, reject) => {
			try {
				if ($state.length === 0) {
					return resolve(null);
				}
				container.style.maxHeight = `${container.scrollHeight}px`;
				container.style.maxWidth = `${container.scrollWidth}px`;

				if (shouldWait) await wait(id, 0);
				container.style.maxHeight = '0px';
				container.style.maxWidth = '0px';
				container.style.opacity = '0';

				if (shouldWait) await wait(id, 500);
				state.update(() => []);

				container.style.maxHeight = 'unset';
				container.style.maxWidth = 'unset';

				container.style.opacity = '1';
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export function getId() {
		return stateId;
	}

	onMount(() => {
		container = /**@type {HTMLElement}*/ (document.querySelector(`#s-container-${stateId}`));
	});
</script>

<CardWrapper {id} minWidth={charWidth} minHeight={lineHeight} {hue} {label} cardId={stateId}>
	<div
		id="s-container-{stateId}"
		style="transition: max-height 0.5s, max-width 0.5s, opacity 0.5s;"
	>
		{#each $state as item, rindex}
			<p
				id="state-{stateId}-{rindex}"
				style="opacity: 0;font-size: {fontSize}rem;width: {charWidth}rem; height: 0px"
			>
				<span style="font-size: {subFontSize}rem;margin: 0; padding: 0">{item.ruleIndex}</span
				>{rules[item.ruleIndex].left} -&gt; {#each rules[item.ruleIndex].right as symbol, index}{#if item.pos === index}<span
							style="margin: 0;transform: {dotIndex === rindex
								? 'translate(5px, 0) scale(2)'
								: 'translate(0,0) scale(1)'};color: hsl(300,60%,45%)">&bull;</span
						>{/if}<span id="state-{stateId}-{rindex}-{index}">{symbol}</span
					>{/each}{#if item.pos === rules[item.ruleIndex].right.length}<span
						style="padding-right: 0px; transform: {dotIndex === rindex
							? 'translate(5px, 0) scale(2)'
							: 'translate(0,0) scale(1)'};color: hsl(300,60%,45%)">&bull;</span
					>{/if}{#if item.lookahead != null}<span style="letter-spacing: 0px;">,</span
					>&lcub;{#each item.lookahead as l, index}{l}{#if index < item.lookahead.size - 1},{/if}{/each}&rcub;{/if}
			</p>
		{/each}
	</div>
</CardWrapper>

<style>
	p {
		transition:
			width 0.5s,
			height 0.5s,
			opacity 0.5s 0.3s;
		white-space: pre;
		display: flex;
		place-items: baseline;
	}
	p > span {
		margin: 0 0.2rem;
		transition: transform 0.2s;
	}
</style>
