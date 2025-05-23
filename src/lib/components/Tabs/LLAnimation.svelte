<script>
	import { onMount } from 'svelte';
	import AlgorithmTab from './AlgorithmTab.svelte';
	import FirstAlgorithm from '@/Algorithms/FirstAlgorithm.svelte';
	import FollowAlgorithm from '@/Algorithms/FollowAlgorithm.svelte';
	import LlAlgorithm from '@/Algorithms/LLTableAlgorithm.svelte';
	import LlParse from '@/Algorithms/LLParse.svelte';
	import { first } from '$lib/first';
	import { follow } from '$lib/follow';
	import { lltable } from '$lib/lltable';
	import { writable } from 'svelte/store';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import { getGrammar, isGrammarLoaded } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import { swapAlgorithm } from '$lib/flowControl';
	import { setUpTooltip } from '$lib/tooltip';
	import { firstToString, followToString, tableToString } from './dataToString';
	import { appendData } from '$lib/log';
	import { id as parseId } from '$lib/llparse';
	import FirstInfo from '@/Info/FirstInfo.svelte';
	import FollowInfo from '@/Info/FollowInfo.svelte';
	import Ll1TableInfo from '@/Info/LL1TableInfo.svelte';
	import LlParsingInfo from '@/Info/LL1ParsingInfo.svelte';

	// ========== Components ====================
	let instruction = /**@type {string}*/ ($state());
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<any>>>} */
	let table = writable();
	// ========== Components ====================

	/**@type {{tabId: string}}*/
	let { tabId } = $props();

	/**@type {Map<string, Map<string, number>>}*/
	let tableData = $state(new Map());
	let id = $state('');
	let limit = $state();
	/**@type {import('@/types').ResultsTabItem[]} */
	let results = $state([]);
	let code = '';
	onMount(async () => {
		if (!isGrammarLoaded()) return;
		let { rules, nt, t } = getGrammar();
		const _first = first(rules, nt);
		const _follow = follow(rules, nt, _first.firstSet);
		const _table = lltable(rules, nt, t, _first.firstSet, _follow.followSet);
		tableData = _table.table;

		results.push({
			title: 'Conjunto First',
			content: firstToString(_first.firstSet, rules)
		});

		results.push({
			title: 'Conjunto Follow',
			content: followToString(_follow.followSet)
		});

		results.push({
			title: 'Tabela LL(1)',
			content: tableToString(_table.table, ' ', {
				cell: (a) => {
					if (a === -1) return ' ';
					return `${rules[a].left} -> ${rules[a].right[0] === '' ? 'ε' : rules[a].right.join(' ')}`;
				}
			})
		});

		firstSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[..._first.firstSet.entries()].map((x) => {
					return {
						left: x[0],
						right: [...x[1]]
					};
				})
			)
		);

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
			/**@type {Map<string, import('@/types').tableCol<any>>}*/ (
				new Map(
					[..._table.table].map(([rowKey, cols]) => [
						rowKey,
						new Map(
							[...cols].map(([colKey, cell]) => [
								colKey,
								/**@type {import('../types').tableItem<any>}*/ ({
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
		algos[0].id = _first.id;
		algos[1].id = _follow.id;
		algos[2].id = _table.id;
	});

	const algos = $state([
		{
			comp: FirstAlgorithm,
			name: 'First',
			desc: 'Construção do conjunto first',
			loaded: false,
			id: '',
			infoComp: FirstInfo
		},
		{
			comp: FollowAlgorithm,
			name: 'Follow',
			desc: 'Construção do conjunto follow',
			loaded: false,
			id: '',
			infoComp: FollowInfo
		},
		{
			comp: LlAlgorithm,
			name: 'Tabela',
			desc: 'Construção da tabela LL(1)',
			loaded: false,
			id: '',
			infoComp: Ll1TableInfo
		}
	]);

	let currentInfo = $state(algos[0].infoComp);

	onMount(() => {
		id = algos[0].id;
		swapAlgorithm(id, algos[0].infoComp, tabId);
		algos[0].loaded = true;
	});
	let selectedAlgorithm = $state(algos[0].name);
</script>

<AlgorithmTab
	{tabId}
	{currentInfo}
	parseInfo={LlParsingInfo}
	{parseId}
	{results}
	bind:limit
	bind:id
	bind:instruction
	{code}
>
	{#snippet steps()}
		<div style="max-width: inherit; width: 100%;">
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
			<div class="grid">
				{#each algos as algo}
					{#if algo.loaded}<div
							class="unit grid {selectedAlgorithm === algo.name ? 'not-hidden' : 'hidden'}"
						>
							<algo.comp bind:instruction {firstSet} {followSet} />
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/snippet}
	{#snippet tree()}
		<SyntaxTree id={parseId}></SyntaxTree>
	{/snippet}
	{#snippet parse()}
		<div class="grid" style="place-items: center;">
			<LlParse {tableData} {table}></LlParse>
		</div>
	{/snippet}
</AlgorithmTab>
