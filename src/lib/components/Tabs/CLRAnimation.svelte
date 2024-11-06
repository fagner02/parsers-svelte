<script>
	import { getGrammar, loadGrammar } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillHeight from '@/Layout/FillHeight.svelte';
	import CLRAlgorithm from '@/CLRAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { first } from '$lib/first';
	import { writable } from 'svelte/store';
	import { swapAlgorithm } from '$lib/flowControl';

	let code = '';
	let inputString = '';

	const grammar = 'S -> A Bb\nA -> a a\nA -> Bb\nBb -> b m\nBb -> m\nBb -> ';
	loadGrammar(grammar);
	let { rules, nt } = getGrammar();

	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();

	const _first = first(rules, nt);

	(() => {
		/**@type {Map<string, Set<string>>}*/
		let mergedFirst = new Map();

		for (let [k, v] of _first) {
			if (!mergedFirst.has(rules[k].left)) {
				mergedFirst.set(rules[k].left, new Set());
			}
			mergedFirst.set(
				rules[k].left,
				new Set([
					.../**@type {Set<string>}*/ (mergedFirst.get(rules[k].left)).values(),
					...v.values()
				])
			);
		}
		console.log('first', mergedFirst, _first);
		firstSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[...mergedFirst.entries()].map((x) => {
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
				<CLRAlgorithm {firstSet}></CLRAlgorithm>
			{/if}
		</FillHeight>
	</FillHeight>
</AlgorithmTab>
