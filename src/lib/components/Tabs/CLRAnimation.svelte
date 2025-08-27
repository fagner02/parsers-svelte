<script>
	import { augRules, isGrammarLoaded, nt } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillSize from '@/Layout/FillSize.svelte';
	import LR1AutomatonAlgorithm from '@/Algorithms/LR1AutomatonAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { firstDataOnly, mergedFirst } from '$lib/stepCalc/first';
	import { writable } from 'svelte/store';
	import { swapAlgorithm } from '$lib/flowControl';
	import CLRTableAlgorithm from '@/Algorithms/CLRTableAlgorithm.svelte';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import ClrParse from '@/Algorithms/CLRParse.svelte';
	import { lr1Automaton } from '$lib/stepCalc/lr1automaton';
	import { setUpTooltip } from '@/Layout/tooltip.svelte';
	import { onMount } from 'svelte';
	import { automatonToString, followToString, tableToString } from './dataToString';
	import { appendData } from '$lib/log';
	import { id as parseId } from '$lib/stepCalc/clrparse';
	import LR1AutomatonInfo from '@/Info/LR1AutomatonInfo.svelte';
	import CLRTableInfo from '@/Info/CLRTableInfo.svelte';
	import ClrParsingInfo from '@/Info/CLRParsingInfo.svelte';
	import { clrTable } from '$lib/stepCalc/clr_table';
	import { inputString } from '@/Layout/parseString';

	let code = '';
	/**@type {{tabId: string}}*/
	let { tabId } = $props();
	let tableData = $state(new Map());
	let id = $state('');

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

	const initialize = () => {
		if (!isGrammarLoaded()) return;
		const _first = firstDataOnly(augRules, nt);
		const _mergedFirst = mergedFirst(_first, augRules);
		const _automaton = lr1Automaton(_mergedFirst);
		const _table = clrTable(_automaton.automaton);

		tableData = _table.table;
		automaton = _automaton.automaton;

		algos[0].id = _automaton.id;
		algos[1].id = _table.id;
		results = [];
		results.push({
			title: 'Conjunto First',
			content: followToString(_mergedFirst)
		});
		results.push({
			title: 'Autômato LR(1)',
			content: automatonToString(automaton.states)
		});
		results.push({
			title: 'Tabela CLR(1)',
			content: tableToString(_table.table, 'estados', { key: (a) => `s${a}` })
		});
		results.push({
			title: "Passos da análise da string ''",
			content: ''
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
	};

	initialize();

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
		<div class="algo-buttons">
			{#each algos as algo}
				<button
					use:setUpTooltip={{ id: 0, text: algo.desc }}
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
		<FillSize class="grid maxWidth">
			{#each algos as algo}
				{#if algo.loaded}
					<div class="unit grid {selectedAlgorithm === algo.name ? 'not-hidden' : 'hidden'}">
						<algo.comp {automaton} {firstSet} />
					</div>
				{/if}
			{/each}
		</FillSize>
	{/snippet}
	{#snippet tree()}
		<SyntaxTree id={parseId} floating={true}></SyntaxTree>
	{/snippet}
	{#snippet parse()}
		<ClrParse
			setParseResult={(content, input) => {
				const result = results[results.length - 1];
				result.title = `Passo a passo da análise da string '${input}'`;
				result.content = content;
			}}
			{tableData}
			stateList={automaton.states.map((x) => `s${x.index}`)}
			{table}
		></ClrParse>
	{/snippet}
</AlgorithmTab>
