<script>
	import { swapAlgorithm } from '$lib/flowControl';
	import { getGrammar, loadGrammar } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillHeight from '@/Layout/FillHeight.svelte';
	import LR0AutomatonAlgorithm from '@/Algorithms/LR0AutomatonAlgorithm.svelte';
	import SLRTableAlgorithm from '@/Algorithms/SLRTableAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { writable } from 'svelte/store';
	import { follow } from '$lib/follow';
	import { first } from '$lib/first';
	import { lr0Automaton } from '$lib/lr0automaton';
	let code = '';
	let inputString = '';

	const grammar = 'S -> A Bb\nA -> a a\nA -> Bb\nBb -> b m\nBb -> m\nBb -> ';
	loadGrammar(grammar);

	const algos = ['autômato', 'tabela'];
	let selectedAlgorithm = algos[0];
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable([]);
	/**@type {import('@/types').LR0Automaton}*/
	let automaton;

	(() => {
		const { rules, nt, t } = getGrammar();
		const _follow = follow(rules, nt, first(rules, nt));
		followSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[..._follow.entries()].map((x) => {
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

		automaton = lr0Automaton(rules, nt, t);
	})();
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
				<LR0AutomatonAlgorithm></LR0AutomatonAlgorithm>
			{:else}
				<SLRTableAlgorithm {automaton} {followSet}></SLRTableAlgorithm>
			{/if}
		</FillHeight>
	</FillHeight>
</AlgorithmTab>
