<script>
	import { loadGrammar } from '$lib/utils';
	import FillHeight from '@/Layout/FillHeight.svelte';
	import SLRAlgorithm from '@/SLRAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';

	let code = '';
	let inputString = '';
	let selectedAlgorithm = 'automato';

	const grammar = 'S -> A Bb\nA -> a a\nA -> Bb\nBb -> b m\nBb -> m\nBb -> ';
	loadGrammar(grammar);
</script>

<div></div>

<AlgorithmTab {inputString} {code}>
	<FillHeight slot="steps" style="max-width: inherit; width: 100%;">
		<div class="algo-buttons">
			<button
				on:click={() => {
					selectedAlgorithm = 'automato';
				}}>autômato</button
			>
			<button
				on:click={() => {
					selectedAlgorithm = 'tabela';
				}}>tabela</button
			>
		</div>
		<FillHeight class="grid">
			{#if selectedAlgorithm === 'automato'}
				<SLRAlgorithm></SLRAlgorithm>
			{/if}
		</FillHeight>
	</FillHeight>
</AlgorithmTab>
