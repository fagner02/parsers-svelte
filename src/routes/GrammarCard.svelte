<script>
	import { wait } from '$lib/utils';
	import { onMount } from 'svelte';

	/** @type {import("svelte/store").Writable<Array.<import('./typedefs').GrammarItem>>} */
	export let rules;
	const grammar = 'S -> A Bb\nA -> a a\nBb -> b m\nS -> Bb';
	/**@type {number}*/
	export let lineHeight;
	/**@type {number}*/
	export let fontSize;

	function loadGrammar() {
		rules.update(() => []);
		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				$rules.push({
					left: s[0].replaceAll(' ', ''),
					right: s[1].trim().split(' '),
					index: $rules.length
				});
			}
		});
	}

	/**
	 * @param {HTMLElement} grammarCard
	 */
	async function setGrammarCard(grammarCard) {
		loadGrammar();

		grammarCard.style.maxWidth = '0px';
		rules.update((x) => x);
		await wait(50);
		grammarCard.style.height = `${lineHeight * $rules.length}px`;
		grammarCard.style.maxWidth = `${grammarCard.scrollWidth}px`;
	}

	onMount(async () => {
		await setGrammarCard(/**@type {HTMLElement}*/ (document.querySelector('#grammar')));
	});
</script>

<div class="card" id="grammar">
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

<style>
	#grammar > p > span {
		margin: 0px 4px;
	}

	#grammar > p > span:nth-child(2) {
		margin: 0px;
	}

	#grammar > p > span:first-child {
		padding-right: 5px;
	}
</style>
