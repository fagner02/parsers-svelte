<script>
	import { swapAlgorithm } from '$lib/flowControl';
	import { loadGrammar } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillHeight from '@/Layout/FillHeight.svelte';
	import SLRAlgorithm from '@/SLRAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';

	let code = '';
	let inputString = '';

	const grammar = 'S -> A Bb\nA -> a a\nA -> Bb\nBb -> b m\nBb -> m\nBb -> ';
	loadGrammar(grammar);

	const algos = ['autômato', 'tabela'];
	let selectedAlgorithm = algos[0];
</script>

<AlgorithmTab {inputString} {code}>
	<FillHeight slot="steps" style="max-width: inherit; width: 100%;">
		<div class="algo-buttons">
			{#each algos as algo}
				<button
					disabled={selectedAlgorithm === algo}
					on:click={() => {
						swapAlgorithm();
						resetSelectionFunctions();
						selectedAlgorithm = algo;
					}}>{algo}</button
				>
			{/each}
		</div>
		<FillHeight class="grid">
			{#if selectedAlgorithm === algos[0]}
				<SLRAlgorithm></SLRAlgorithm>
			{/if}
		</FillHeight>
	</FillHeight>
</AlgorithmTab>
