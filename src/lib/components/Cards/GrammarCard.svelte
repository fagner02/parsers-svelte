<script>
	import { wait } from '$lib/flowControl';
	import { charWidth, fontSize, lineHeight, subCharWidth, subFontSize } from '$lib/globalStyle';
	import CardBox from './CardWrapper.svelte';

	/** @type {Array<import('@/types').GrammarItem>} */
	export let rules;
	let opacity = 0;
	let maxHeight = 0;
	let sizeForward = `max-width 0.5s, max-height 0.5s`;
	let opacityForward = `opacity 0.5s`;
	let transitionBack = `none`;
	let transition = sizeForward;
	let opacityTransition = opacityForward;

	export const loadGrammar = async function () {
		try {
			for (let p of document.querySelector('#rules')?.children ?? []) {
				for (let s of p.children) {
					s.classList.remove('block', 'empty');
				}
			}
			transition = transitionBack;
			opacityTransition = transitionBack;
			await wait(0);
			opacity = 0;
			maxHeight = 0;
			await wait(0);
			transition = sizeForward;
			opacityTransition = opacityForward;
			await wait(0);

			maxHeight = lineHeight * rules.length;
			await wait(200);
			opacity = 1;
		} catch {}
	};
</script>

<CardBox
	class="card"
	id={'grammar'}
	minHeight={lineHeight}
	minWidth={charWidth}
	{maxHeight}
	label={'grammar'}
	color={'blue'}
	{transition}
>
	<div style="opacity: {opacity}; transition: {opacityTransition};" id="rules">
		{#each rules as rule, rulesIndex}
			<p
				style="line-height: {lineHeight}px; font-size: {fontSize}px; padding: 0px; width: fit-content"
			>
				<span id="gl{rulesIndex}"
					>{rule.left}<span
						style="font-size: {subFontSize}px; position: absolute;transform: translate(0px, {0.3 *
							fontSize}px)">{rule.index}</span
					></span
				>
				<span>{'->'}</span>
				{#if rule.right[0] === ''}
					<span id="gr{rulesIndex}-{0}">&#x03B5;</span>
				{:else}
					{#each rule.right as symbol, si}
						<span id="gr{rulesIndex}-{si}">{symbol}</span>
					{/each}
				{/if}
			</p>
		{/each}
	</div>
</CardBox>

<style>
	#grammar {
		height: fit-content;
		transition:
			max-width 0.5s,
			max-height 0.5s;
		overflow: hidden;
	}
	div > p > span {
		margin: 0px 4px;
	}

	div > p > span:nth-child(2) {
		margin: 0px;
	}

	div > p > span:first-child {
		padding-right: 5px;
	}
</style>
