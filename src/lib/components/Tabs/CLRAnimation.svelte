<script>
	import { getGrammar } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillHeight from '@/Layout/FillHeight.svelte';
	import LR1AutomatonAlgorithm from '@/Algorithms/LR1AutomatonAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { first, mergedFirst } from '$lib/first';
	import { writable } from 'svelte/store';
	import { swapAlgorithm } from '$lib/flowControl';
	import CLRTableAlgorithm from '@/Algorithms/CLRTableAlgorithm.svelte';
	import { lr1Automaton } from '$lib/lr1automaton';

	let code = '';
	let inputString = '';
	let { rules, nt, t } = getGrammar();

	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();

	/**@type {import('@/types').LR1Automaton}*/
	let automaton;

	(() => {
		const _first = first(rules, nt);
		const _mergedFirst = mergedFirst(_first, rules);

		firstSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[..._mergedFirst.entries()].map((x) => {
					/**@type {string[]}*/
					let values = [];
					for (let value of x[1].values()) {
						values.push(value);
						if (values.length < x[1].size * 2 - 1) {
							values.push(',');
						}
					}

					return {
						left: x[0],
						right: [...x[1]],
						showRight: true,
						rightProps: values.map((s) => {
							return { value: s, opacity: 1, hide: false, note: '' };
						}),
						note: ''
					};
				})
			)
		);

		automaton = lr1Automaton(rules, nt, t, _mergedFirst);
	})();

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
				<LR1AutomatonAlgorithm {firstSet}></LR1AutomatonAlgorithm>
			{:else}
				<CLRTableAlgorithm {automaton}></CLRTableAlgorithm>
			{/if}
		</FillHeight>
	</FillHeight>
</AlgorithmTab>
