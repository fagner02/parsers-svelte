<script>
	import { wait } from '$lib/utils';
	import CardBox from './CardBox.svelte';

	/** @type {import("svelte/store").Writable<Array.<import('./typedefs').GrammarItem>>} */
	export let rules;
	const grammar = 'S -> A Bb\nA -> a a\nBb -> b m';
	/**@type {number}*/
	export let lineHeight;
	/**@type {number}*/
	export let charWidth;
	/**@type {number}*/
	export let subCharWidth;
	/**@type {number}*/
	export let fontSize;
	let opacity = 0;
	let maxWidth = 0;
	let maxHeight = 0;
	let sizeForward = `max-width 0.5s,
			max-height 0.5s`;
	let opacityForward = `opacity 0.5s`;
	let transitionBack = `none`;
	let transition = sizeForward;
	let opacityTransition = opacityForward;

	export async function loadGrammar() {
		transition = transitionBack;
		opacityTransition = transitionBack;
		await wait(50);
		opacity = 0;
		maxWidth = 0;
		maxHeight = 0;
		await wait(50);
		transition = sizeForward;
		opacityTransition = opacityForward;
		await wait(50);
		/**
		 * @type {{ left: string; right: string[]; index: number; }[]}
		 */
		let aux = [];
		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				aux.push({
					left: s[0].replaceAll(' ', ''),
					right: s[1].trim().split(' '),
					index: aux.length
				});
			}
		});
		let max = aux
			.map(
				(x) =>
					x.index.toString().length * subCharWidth +
					x.left.length * charWidth +
					x.right.length * (charWidth + 10) +
					3 * charWidth
			)
			.toSorted();

		rules.update(() => [...aux]);
		maxWidth = max[max.length - 1];
		maxHeight = lineHeight * aux.length;
		await wait(200);
		opacity = 1;
	}
	/**@type {string}*/
	export let animation;
</script>

<CardBox
	class="card"
	id={'grammar'}
	minHeight={lineHeight}
	minWidth={charWidth}
	{maxWidth}
	{maxHeight}
	label={'grammar'}
	color={'blue'}
	{transition}
	{animation}
>
	<div style="opacity: {opacity}; transition: {opacityTransition};">
		{#each $rules as rule, rulesIndex}
			<p
				style="line-height: {lineHeight}px; font-size: {fontSize}px; padding: 0px; width: fit-content"
			>
				<span id="gl{rulesIndex}"
					>{rule.left}<span style="font-size: 10px; position: absolute;translate: 0px 5px"
						>{rule.index}</span
					></span
				>
				<span>{'->'}</span>
				{#each rule.right as symbol, si}
					<span id="gr{rulesIndex}-{si}">{symbol}</span>
				{/each}
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
