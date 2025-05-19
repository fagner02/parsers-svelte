<script>
	import { charWidth, fontSize, lineHeight, subFontSize } from '$lib/globalStyle';
	import { getAugGrammar } from '$lib/utils';
	import { onMount } from 'svelte';
	import { wait } from '$lib/flowControl';
	import CardWrapper from './CardWrapper.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';

	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = getAugGrammar().augRules;
	/**@type {HTMLElement}*/
	let container;

	let dotIndex = $state(-1);
	/** @type {import('@/Cards/selectionFunction').SelectionFunctions|undefined} */
	let selectionFunctions = $state();

	/** @type {{
	 * id: string,
	 * state: import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>,
	 * hue: number,
	 * label: string,
	 * stateId: string,
	 * svgLines: SvgLines | undefined,
	 * stateName: string}} */
	let { id, state: cardState, hue, label, stateId, svgLines = $bindable(), ...props } = $props();

	/**
	 * @param {number} ruleIndex
	 * @param {number} pos
	 * @param {Set<string>?} lookahead
	 * @param {string?} srcId
	 */
	export async function addItem(ruleIndex, pos, lookahead = null, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				cardState.update((x) => [
					...x,
					{
						ruleIndex: ruleIndex,
						pos: pos,
						hide: true,
						lookahead: lookahead ? new Set(lookahead) : null
					}
				]);
				await wait(id, 0);
				let index = $cardState.length - 1;
				let elem = /**@type {HTMLElement}*/ (document.querySelector(`#state-${stateId}-${index}`));
				elem.style.maxWidth = '0px';
				elem.style.height = '0px';
				let elemWidth = elem.scrollWidth;
				for (let i = 0; i < (lookahead?.size ?? 0); i++) {
					let look = /**@type {HTMLElement}*/ (
						document.querySelector(`#look-${stateId}-${index}-${i}`)
					);
					look.style.maxWidth = `${look.scrollWidth}px`;
					look.style.opacity = '1';
					elemWidth += look.scrollWidth;
				}

				if (srcId) await svgLines?.showLine(srcId, `#state-${stateId}-${index}`, id);

				elem.style.opacity = '1';
				elem.style.maxWidth = `${elemWidth}px`;
				elem.style.height = `${elem.scrollHeight}px`;

				await wait(id, 1500);
				elem.style.maxWidth = `fit-content`;
				elem.style.height = `fit-content`;
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
	 * @param {boolean} updateSelection
	 */
	export async function updateLookahead(lookahead, existent, updateSelection = false) {
		return new Promise(async (resolve, reject) => {
			try {
				let elem = /**@type {HTMLElement}*/ (
					document.querySelector(`#state-${stateId}-${existent}`)
				);
				cardState.update((x) => {
					x[existent].lookahead = new Set([
						.../**@type {Set<string>}*/ (x[existent].lookahead),
						...lookahead.values()
					]);
					return x;
				});
				await wait(id, 0);

				for (let i = 0; i < ($cardState[existent].lookahead?.size ?? 0); i++) {
					let look = /**@type {HTMLElement}*/ (
						document.querySelector(`#look-${stateId}-${existent}-${i}`)
					);
					look.style.maxWidth = `${look.scrollWidth}px`;
					look.style.opacity = '1';
				}
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
	 * @param {import('@/types').LR0StateItem[]} stateToLoad
	 * @param {boolean} shouldWait
	 */
	export async function loadState(stateToLoad, shouldWait = true) {
		return new Promise(async (resolve, reject) => {
			try {
				cardState.update(() =>
					stateToLoad.map((x) => {
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
					elem.style.maxWidth = `${elem.scrollWidth}px`;
					elem.style.height = `${elem.scrollHeight}px`;
					elem.style.opacity = '1';

					elem = /**@type {HTMLElement}*/ (elem.nextElementSibling);
				}

				if (shouldWait) await wait(id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export async function resetState(shouldWait = true) {
		return new Promise(async (resolve, reject) => {
			try {
				if ($cardState.length === 0) {
					return resolve(null);
				}

				container.style.maxHeight = `${container.scrollHeight}px`;
				container.style.maxWidth = `${container.scrollWidth}px`;

				if (shouldWait) await wait(id, 100);
				container.style.maxHeight = '0px';
				container.style.maxWidth = '0px';
				container.style.opacity = '0';

				if (shouldWait) await wait(id, 600);
				cardState.update(() => []);

				container.style.maxHeight = 'unset';
				container.style.maxWidth = 'unset';

				container.style.opacity = '1';
				await wait(id, 100);
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

<CardWrapper
	bind:selectionFunctions
	{id}
	minWidth={charWidth}
	minHeight={lineHeight}
	{hue}
	{label}
	cardId={stateId}
>
	<div
		id="s-container-{stateId}"
		style="transition: max-height 0.5s, max-width 0.5s, opacity 0.5s;"
	>
		{#if $cardState.length > 0}
			<p id="state-{stateId}-title" class="block" style="--block-hue: {hue};">
				{props.stateName}
			</p>
		{/if}
		{#each $cardState as item, rindex}
			<p
				id="state-{stateId}-{rindex}"
				style="opacity: 0;font-size: {fontSize}rem;min-width: {charWidth}rem;max-width: 0px; height: 0px"
			>
				<span style="font-size: {subFontSize}rem;">{item.ruleIndex}</span>
				<span>{rules[item.ruleIndex].left} -&gt;&nbsp;</span>
				{#each rules[item.ruleIndex].right as symbol, index}
					{#if item.pos === index}
						<span
							style="transform: {dotIndex === rindex
								? 'translate(5px, 0) scale(2)'
								: 'translate(0,0) scale(1)'};color: hsl({hue}, 65%,45%)">&bull;</span
						>
					{/if}
					<span style="margin: 0px 3px" id="state-{stateId}-{rindex}-{index}">{symbol}</span>
				{/each}
				{#if item.pos === rules[item.ruleIndex].right.length}
					<span
						style="transform: {dotIndex === rindex
							? 'translate(5px, 0) scale(2)'
							: 'translate(0,0) scale(1)'};color: hsl({hue},65%,45%);">&bull;</span
					>
				{/if}
				{#if item.lookahead != null}
					<span>,&lcub;</span>

					{#each item.lookahead as l, index (l)}
						<span class="look-item" id="look-{stateId}-{rindex}-{index}">
							{l}{#if index < item.lookahead.size - 1},{/if}
						</span>
					{/each}
					<span>&rcub;</span>
				{/if}
			</p>
		{/each}
	</div>
</CardWrapper>

<style>
	p {
		transition:
			width 0.5s,
			height 0.5s,
			max-width 0.5s,
			opacity 0.5s 0.3s;
		white-space: pre;
		display: flex;
		place-items: baseline;
		width: fit-content;
	}
	p > span {
		margin: 0;
		transition: transform 0.2s;
	}
	.look-item {
		transition:
			max-width 0.5s,
			opacity 0.5s;
		max-width: 0px;
		opacity: 0;
	}
</style>
