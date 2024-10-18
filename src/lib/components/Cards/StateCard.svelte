<script>
	import { onMount } from 'svelte';
	import CardWrapper from './CardWrapper.svelte';
	import { getGrammar } from '$lib/utils';
	import { charWidth, fontSize, lineHeight } from '$lib/globalStyle';
	import { wait } from '$lib/flowControl';

	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>}*/
	export let state;
	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = getGrammar().rules;

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
</script>

<CardWrapper minWidth={charWidth} minHeight={lineHeight} {hue} {label} cardId={stateId}>
	{#each $state as item}
		<p
			style="opacity: {item.hide ? 0 : 1};font-size: {fontSize}rem; width: {item.hide
				? 0
				: 0.2 * (rules[item.ruleIndex].right.length + 2) +
					charWidth *
						(rules[item.ruleIndex].right.join('').length +
							4 +
							rules[item.ruleIndex].left.length)}rem; height: {item.hide ? 0 : lineHeight}rem"
		>
			{rules[item.ruleIndex].left} -&gt;
			{#each rules[item.ruleIndex].right as symbol, index}
				{#if item.pos === index}
					<span>&bull;</span>{/if}<span>{symbol} </span>
			{/each}
		</p>
	{/each}
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
