<script>
	import { loadGrammar } from '$lib/utils';
	import SLRAlgorithm from '@/SLRAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { onMount } from 'svelte';

	let code = '';
	let inputString = '';
	let selectedAlgorithm = 'automato';

	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = [];
	/** @type {Array<string>}*/
	let nt = [];
	/** @type {Array<string>}*/
	let t = [];
	const grammar = 'S -> A Bb\nA -> a a\nA -> \nBb -> b m\nBb -> m\nBb -> ';

	onMount(() => {
		let g = loadGrammar(grammar);
		nt = g.nt;
		t = g.t;
		rules = g.rules;
	});
</script>

<div></div>

<AlgorithmTab {inputString} {code}>
	<div slot="steps" style="max-width: inherit; width: 100%;">
		<div class="algo-buttons">
			<button
				on:click={() => {
					selectedAlgorithm = 'automato';
				}}>autômato</button
			>
		</div>
		<div class="grid">
			{#if selectedAlgorithm === 'automato'}
				<SLRAlgorithm {rules}></SLRAlgorithm>
			{/if}
		</div>
	</div>
</AlgorithmTab>
