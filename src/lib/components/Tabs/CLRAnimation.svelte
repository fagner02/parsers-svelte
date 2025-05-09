<script>
	import { getAugGrammar, isGrammarLoaded } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillSize from '@/Layout/FillSize.svelte';
	import LR1AutomatonAlgorithm from '@/Algorithms/LR1AutomatonAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { first, mergedFirst } from '$lib/first';
	import { writable } from 'svelte/store';
	import { swapAlgorithm } from '$lib/flowControl';
	import CLRTableAlgorithm from '@/Algorithms/CLRTableAlgorithm.svelte';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import ClrParse from '@/Algorithms/CLRParse.svelte';
	import { lr1Automaton } from '$lib/lr1automaton';
	import { clrTable } from '$lib/clrTable';
	import { setUpTooltip } from '$lib/tooltip';

	let code = '';
	let { augRules, nt, t } = getAugGrammar();

	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	let table = writable(new Map());

	/**@type {import('@/types').LR1Automaton}*/
	let automaton;

	(() => {
		if (!isGrammarLoaded()) return;
		const _first = first(augRules, nt);
		const _mergedFirst = mergedFirst(_first, augRules);

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

		automaton = lr1Automaton(augRules, nt, t, _mergedFirst);

		const _table = clrTable(automaton, augRules, nt, t);

		table.set(
			/**@type {Map<string, import('@/types').tableCol<string>>}*/ (
				new Map(
					[..._table].map(([rowKey, cols]) => [
						`s${rowKey}`,
						new Map(
							[...cols].map(([colKey, cell]) => [
								colKey,
								/**@type {import('@/types').tableItem<string>}*/ ({
									data: cell,
									opacity: 1,
									pos: 0,
									text: cell,
									width: 1
								})
							])
						)
					])
				)
			)
		);
	})();

	const algos = [
		{ name: 'Autômato', desc: 'Construção de autômato LR(1)' },
		{ name: 'Tabela', desc: 'Construção da tabela LR(1)' }
	];
	let selectedAlgorithm = algos[0].name;
</script>

<AlgorithmTab {code}>
	<FillSize slot="steps" style="max-width: inherit; width: 100%;">
		<div class="algo-buttons">
			{#each algos as algo}
				<button
					use:setUpTooltip={algo.desc}
					disabled={selectedAlgorithm === algo.name}
					on:click={() => {
						swapAlgorithm();
						resetSelectionFunctions();
						selectedAlgorithm = algo.name;
					}}>{algo.name}</button
				>
			{/each}
		</div>
		<FillSize class="grid">
			{#if selectedAlgorithm === algos[0].name}
				<LR1AutomatonAlgorithm {firstSet}></LR1AutomatonAlgorithm>
			{:else}
				<CLRTableAlgorithm {automaton}></CLRTableAlgorithm>
			{/if}
		</FillSize>
	</FillSize>
	<SyntaxTree slot="tree" floating={true}></SyntaxTree>
	<div slot="parse" class="grid" style="place-items: center;">
		<ClrParse stateList={automaton.states.map((x) => `s${x.index}`)} {table}></ClrParse>
	</div>
</AlgorithmTab>
