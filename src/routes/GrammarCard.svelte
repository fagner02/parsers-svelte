<script>
	import { wait } from '$lib/utils';

	/** @type {import("svelte/store").Writable<Array.<import('./typedefs').GrammarItem>>} */
	export let rules;
	const grammar = 'S -> A Bb\nA -> a a\nBb -> b m';
	/**@type {number}*/
	export let lineHeight;
	export let charWidth;
	/**@type {number}*/
	export let fontSize;
	let opacity = 0;
	export async function loadGrammar() {
		rules.update(() => []);
		opacity = 0;

		let grammarCard = /**@type {HTMLElement}*/ (document.querySelector('#grammar'));
		grammarCard.style.maxWidth = '0px';
		grammarCard.style.maxHeight = '0px';
		await wait(1000);
		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				rules.update((x) => [
					...x,
					{
						left: s[0].replaceAll(' ', ''),
						right: s[1].trim().split(' '),
						index: $rules.length
					}
				]);
			}
		});

		await wait(500);

		grammarCard.style.maxHeight = `${lineHeight * $rules.length}px`;
		grammarCard.style.maxWidth = `${grammarCard.scrollWidth}px`;
		opacity = 1;
		await wait(1000);
	}
</script>

<div class="card" id="grammar" style="min-height: {lineHeight}px; min-width:{charWidth}px">
	<div style="opacity: {opacity}; transition: opacity 0.5s 0.2s;">
		{#each $rules as rule, i}
			<p
				style="line-height: {lineHeight}px; font-size: {fontSize}px; padding: 0px; width: fit-content"
			>
				<span id="gl{i}"
					>{rule.left}<span style="font-size: 10px; position: absolute;translate: 0px 5px"
						>{rule.index}</span
					></span
				>
				<span>{'->'}</span>
				{#each rule.right as symbol, si}
					<span id="gr{i}-{si}">{symbol}</span>
				{/each}
			</p>
		{/each}
	</div>
</div>

<style>
	#grammar {
		height: fit-content;
		transition:
			max-width 0.5s,
			max-height 0.5s;
		overflow: hidden;
	}
	#grammar > div > p > span {
		margin: 0px 4px;
	}

	#grammar > div > p > span:nth-child(2) {
		margin: 0px;
	}

	#grammar > div > p > span:first-child {
		padding-right: 5px;
	}
</style>
