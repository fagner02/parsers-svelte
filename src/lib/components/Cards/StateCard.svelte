<script>
	import { onMount } from 'svelte';
	import CardWrapper from './CardWrapper.svelte';
	import { getGrammar } from '$lib/utils';
	import { charWidth, fontSize, lineHeight, subCharWidth, subFontSize } from '$lib/globalStyle';
	import { wait } from '$lib/flowControl';

	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>}*/
	export let state;
	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = getGrammar().rules;
	/**@type {HTMLElement}*/
	let container;
	let maxHeight = -1;
	let maxWidth = -1;

	export let hue;
	export let label;
	export let stateId;

	/**
	 * @param {number} ruleIndex
	 * @param {number} pos
	 */
	export async function addItem(ruleIndex, pos) {
		state.update((x) => [...x, { ruleIndex: ruleIndex, pos: pos, hide: true }]);
		await wait(0);
		state.update((x) => {
			x[x.length - 1].hide = false;
			return x;
		});
		await wait(500);
	}

	export async function loadState(/**@type {import('@/types').State}*/ stateToLoad) {
		state.update(() =>
			stateToLoad.items.map((x) => {
				return { ruleIndex: x.ruleIndex, pos: x.pos, hide: true };
			})
		);
		await wait(0);
		state.update((x) => {
			x[x.length - 1].hide = false;
			return x;
		});
		await wait(500);
	}

	export async function resetState() {
		console.log(container);
		maxHeight = container.scrollHeight;
		maxWidth = container.scrollWidth;
		await wait(0);
		maxHeight = 0;
		maxWidth = 0;

		await wait(500);
		state.update(() => []);
		maxHeight = -1;
		maxWidth = -1;
	}

	onMount(() => {
		container = /**@type {HTMLElement}*/ (document.querySelector(`#s-container-${stateId}`));
	});
</script>

<CardWrapper minWidth={charWidth} minHeight={lineHeight} {hue} {label} cardId={stateId}>
	<div
		id="s-container-{stateId}"
		style="max-height: {maxHeight}px; max-width: {maxWidth};transition: max-height 0.5s;"
	>
		{#each $state as item}
			<p
				style="opacity: {item.hide ? 0 : 1};font-size: {fontSize}rem; width: {item.hide
					? 0
					: subCharWidth +
						0.2 * (rules[item.ruleIndex].right.length + 1) +
						charWidth *
							(rules[item.ruleIndex].right.join('').length +
								4 +
								rules[item.ruleIndex].left.length)}rem; height: {item.hide ? 0 : lineHeight}rem"
			>
				<span style="font-size: {subFontSize}rem;margin: 0; padding: 0">{item.ruleIndex}</span
				>{rules[item.ruleIndex].left}
				-&gt;
				{#each rules[item.ruleIndex].right as symbol, index}
					{#if item.pos === index}
						<span style="padding-right: 0px;color: hsl(300,60%,45%)">&bull;</span>{/if}<span
						>{symbol}</span
					>
				{/each}
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
	}
	p > span {
		padding-right: 0.2rem;
	}
</style>
