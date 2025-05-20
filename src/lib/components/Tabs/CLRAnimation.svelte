<script>
	import { getAugGrammar, isGrammarLoaded } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillSize from '@/Layout/FillSize.svelte';
	import LR1AutomatonAlgorithm from '@/Algorithms/LR1AutomatonAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { firstDataOnly, mergedFirst } from '$lib/first';
	import { writable } from 'svelte/store';
	import { swapAlgorithm } from '$lib/flowControl';
	import CLRTableAlgorithm from '@/Algorithms/CLRTableAlgorithm.svelte';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import ClrParse from '@/Algorithms/CLRParse.svelte';
	import { lr1Automaton } from '$lib/lr1automaton';
	import { clrTable } from '$lib/clrtable';
	import { setUpTooltip } from '$lib/tooltip';
	import { onMount } from 'svelte';
	import { automatonToString, firstToString, tableToString } from './dataToString';
	import { appendData } from '$lib/log';
	import { id as parseId } from '$lib/clrparse';
	import LR1AutomatonInfo from '@/Info/LR1AutomatonInfo.svelte';
	import CLRTableInfo from '@/Info/CLRTableInfo.svelte';
	import ClrParsingInfo from '@/Info/CLRParsingInfo.svelte';

	let code = '';
	let { augRules, nt, t } = getAugGrammar();

	let tableData = $state(new Map());
	let id = $state('');
	const tabId = 'clr';
	let limit = $state();
	/**@type {import('@/types').ResultsTabItem[]} */
	let results = $state([]);

	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	let table = writable(new Map());

	/**@type {import('@/types').LR1Automaton}*/
	let automaton = $state({ states: [], transitions: new Map() });

	let algos = $state([
		{
			comp: LR1AutomatonAlgorithm,
			name: 'Autômato',
			desc: 'Construção de autômato LR(1)',
			loaded: false,
			id: '',
			infoComp: LR1AutomatonInfo
		},
		{
			comp: CLRTableAlgorithm,
			name: 'Tabela',
			desc: 'Construção da tabela LR(1)',
			loaded: false,
			id: '',
			infoComp: CLRTableInfo
		}
	]);

	let currentInfo = $state(algos[0].infoComp);

	(() => {
		if (!isGrammarLoaded()) return;
		const _first = firstDataOnly(augRules, nt);
		const _mergedFirst = mergedFirst(_first, augRules);
		const _automaton = lr1Automaton(augRules, nt, t, _mergedFirst);
		const _table = clrTable(_automaton.automaton, augRules, nt, t);

		tableData = _table.table;
		automaton = _automaton.automaton;

		algos[0].id = _automaton.id;
		algos[1].id = _table.id;

		results.push({
			title: 'Conjunto First',
			content: firstToString(_first, augRules)
		});
		results.push({
			title: 'Autômato LR(1)',
			content: automatonToString(automaton.states, augRules)
		});
		results.push({
			title: 'Tabela CLR(1)',
			content: tableToString(_table.table, 'estados', { key: (a) => `s${a}` })
		});

		firstSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[..._mergedFirst.entries()].map((x) => {
					return {
						left: x[0],
						right: [...x[1]]
					};
				})
			)
		);
		table.set(
			/**@type {Map<string, import('@/types').tableCol<string>>}*/ (
				new Map(
					[..._table.table].map(([rowKey, cols]) => [
						`s${rowKey}`,
						new Map(
							[...cols].map(([colKey, cell]) => [
								colKey,
								/**@type {import('@/types').tableItem<string>}*/ ({
									data: cell,
									opacity: 1,
									pos: 0,
									width: 1
								})
							])
						)
					])
				)
			)
		);
	})();

	onMount(() => {
		id = algos[0].id;
		algos[0].loaded = true;
		swapAlgorithm(id, currentInfo, tabId);
	});
	let selectedAlgorithm = $state(algos[0].name);
</script>

<AlgorithmTab
	{tabId}
	{currentInfo}
	parseInfo={ClrParsingInfo}
	{parseId}
	{results}
	bind:limit
	{code}
	bind:id
>
	{#snippet steps()}
		<FillSize style="max-width: inherit; width: 100%;">
			{#snippet content()}
				<div class="algo-buttons">
					{#each algos as algo}
						<button
							use:setUpTooltip={{ text: algo.desc }}
							disabled={selectedAlgorithm === algo.name}
							onclick={() => {
								id = algo.id;
								algo.loaded = true;
								swapAlgorithm(id, algo.infoComp, tabId);
								resetSelectionFunctions();
								appendData(`algorithm change,from ${selectedAlgorithm} to ${algo.name}`);
								selectedAlgorithm = algo.name;
							}}>{algo.name}</button
						>
					{/each}
				</div>
				<FillSize class="grid">
					{#snippet content()}
						{#if algos[0].loaded}
							<div
								class="unit grid {selectedAlgorithm === algos[0].name ? 'not-hidden' : 'hidden'}"
							>
								<LR1AutomatonAlgorithm {firstSet} bind:results></LR1AutomatonAlgorithm>
							</div>
						{/if}
						{#if algos[1].loaded}
							<div
								class="unit grid {selectedAlgorithm === algos[1].name ? 'not-hidden' : 'hidden'}"
							>
								<CLRTableAlgorithm {automaton}></CLRTableAlgorithm>
							</div>
						{/if}
					{/snippet}
				</FillSize>
			{/snippet}
		</FillSize>
	{/snippet}
	{#snippet tree()}
		<SyntaxTree id={parseId} floating={true}></SyntaxTree>
	{/snippet}
	{#snippet parse()}
		<div class="grid" style="place-items: center;">
			<ClrParse {tableData} stateList={automaton.states.map((x) => `s${x.index}`)} {table}
			></ClrParse>
		</div>
	{/snippet}
</AlgorithmTab>
