<script>
	import { swapAlgorithm } from '$lib/flowControl';
	import { augRules, isGrammarLoaded, nt } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillSize from '@/Layout/FillSize.svelte';
	import LR0AutomatonAlgorithm from '@/Algorithms/LR0AutomatonAlgorithm.svelte';
	import SLRTableAlgorithm from '@/Algorithms/SLRTableAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import SlrParse from '@/Algorithms/SLRParse.svelte';
	import { writable } from 'svelte/store';
	import { followDataOnly } from '$lib/stepCalc/follow';
	import { firstDataOnly } from '$lib/stepCalc/first';
	import { lr0Automaton } from '$lib/stepCalc/lr0automaton';
	import { slrTable } from '$lib/stepCalc/slrtable';
	import { setUpTooltip } from '@/Layout/tooltip.svelte';
	import { onMount } from 'svelte';
	import { automatonToString, followToString, tableToString } from './dataToString';
	import { appendData } from '$lib/log';
	import { id as parseId } from '$lib/stepCalc/slrparse';
	import LR0AutomatonInfo from '@/Info/LR0AutomatonInfo.svelte';
	import SLRTableInfo from '@/Info/SLRTableInfo.svelte';
	import SlrParsingInfo from '@/Info/SLRParsingInfo.svelte';

	/**@type {{tabId: string}}*/
	let { tabId } = $props();

	let code = '';
	let tableData = $state(new Map());
	let algos = $state([
		{
			comp: LR0AutomatonAlgorithm,
			name: 'Autômato',
			desc: 'Construção do autômato LR(0)',
			loaded: false,
			id: '',
			infoComp: LR0AutomatonInfo
		},
		{
			comp: SLRTableAlgorithm,
			name: 'Tabela',
			desc: 'Construção da tabela SLR',
			loaded: false,
			id: '',
			infoComp: SLRTableInfo
		}
	]);

	let id = $state('');
	let currentInfo = $state(algos[0].infoComp);
	let limit = $state();
	/**@type {import('@/types').ResultsTabItem[]} */
	let results = $state([]);

	let selectedAlgorithm = $state(algos[0].name);
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	let table = writable(new Map());

	let automaton = /**@type {import('@/types').LR0Automaton}*/ ($state());

	(() => {
		if (!isGrammarLoaded()) return;
		const _follow = followDataOnly(firstDataOnly(augRules, nt), augRules, nt);
		const _automaton = lr0Automaton();
		const _table = slrTable(_automaton.automaton, _follow.followSet);

		tableData = _table.table;
		automaton = _automaton.automaton;

		algos[0].id = _automaton.id;
		algos[1].id = _table.id;

		results.push({
			title: 'Conjunto Follow',
			content: followToString(_follow.followSet)
		});
		results.push({
			title: 'Autômato LR(0)',
			content: automatonToString(_automaton.automaton.states)
		});
		results.push({
			title: 'Tabela SLR(1)',
			content: tableToString(_table.table, 'estados', { key: (a) => `s${a}` })
		});

		followSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[..._follow.followSet.entries()].map((x) => {
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
		swapAlgorithm(id, currentInfo, tabId);
		algos[0].loaded = true;
	});
</script>

<AlgorithmTab
	{tabId}
	{currentInfo}
	parseInfo={SlrParsingInfo}
	{parseId}
	{results}
	bind:limit
	bind:id
	{code}
>
	{#snippet steps()}
		<FillSize style="max-width: inherit; width: 100%;">
			{#snippet content()}
				<div class="algo-buttons">
					{#each algos as algo}
						<button
							use:setUpTooltip={{ id: 0, text: algo.desc }}
							disabled={selectedAlgorithm === algo.name}
							onclick={() => {
								id = algo.id;
								swapAlgorithm(id, algo.infoComp, tabId);
								algo.loaded = true;
								resetSelectionFunctions();
								appendData(`algorithm change,from ${selectedAlgorithm} to ${algo.name}`);
								selectedAlgorithm = algo.name;
							}}>{algo.name}</button
						>
					{/each}
				</div>
				<FillSize class="grid">
					{#snippet content()}
						{#each algos as algo}
							{#if algo.loaded}<div
									class="unit grid {selectedAlgorithm === algo.name ? 'not-hidden' : 'hidden'}"
								>
									<algo.comp {automaton} {followSet} />
								</div>
							{/if}
						{/each}
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
			<SlrParse {tableData} stateList={automaton.states.map((x) => `s${x.index}`)} {table}
			></SlrParse>
		</div>
	{/snippet}
</AlgorithmTab>
