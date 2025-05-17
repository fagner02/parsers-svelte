<script>
	import { getAugGrammar, isGrammarLoaded } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillSize from '@/Layout/FillSize.svelte';
	import LR1AutomatonAlgorithm from '@/Algorithms/LR1AutomatonAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { first, firstDataOnly, mergedFirst } from '$lib/first';
	import { writable } from 'svelte/store';
	import { getLimitHit, setLimitHitCallback, swapAlgorithm } from '$lib/flowControl';
	import CLRTableAlgorithm from '@/Algorithms/CLRTableAlgorithm.svelte';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import ClrParse from '@/Algorithms/CLRParse.svelte';
	import { lr1Automaton } from '$lib/lr1automaton';
	import { clrTable } from '$lib/clrtable';
	import { setUpTooltip } from '$lib/tooltip';
	import { onMount } from 'svelte';
	import { automatonToString, firstToString, tableToString } from './dataToString';
	import { appendData } from '$lib/log';

	let code = '';
	let { augRules, nt, t } = getAugGrammar();

	let id = $state('');
	let limit = $state();
	/**@type {import('@/types').ResultsTabItem[]} */
	let results = $state([]);

	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	let table = writable(new Map());

	/**@type {import('svelte/store').Writable<import('@/types').LR1Automaton> }*/
	let _automaton = writable({ states: [], transitions: new Map() });

	let algos = $state([
		{
			comp: LR1AutomatonAlgorithm,
			name: 'Autômato',
			desc: 'Construção de autômato LR(1)',
			loaded: false,
			saves: [],
			/**@type {{name:string, args: any[]}[]}*/
			functionCalls: [],
			id: '',
			elemIds: {}
		},
		{
			comp: CLRTableAlgorithm,
			name: 'Tabela',
			desc: 'Construção da tabela LR(1)',
			loaded: false,
			saves: [],
			/**@type {{name:string, args: any[]}[]}*/
			functionCalls: [],
			id: '',
			elemIds: {}
		}
	]);
	(() => {
		if (!isGrammarLoaded()) return;
		const _first = firstDataOnly(augRules, nt);
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

		results.push({
			title: 'Conjunto First',
			content: firstToString(_first, augRules)
		});

		let { automaton, functionCalls, saves, id, elemIds } = lr1Automaton(
			augRules,
			nt,
			t,
			_mergedFirst
		);
		algos[0].saves = saves;
		algos[0].functionCalls = functionCalls;
		algos[0].id = id;
		algos[0].elemIds = elemIds;
		_automaton.set(automaton);

		let _table = clrTable($_automaton, augRules, nt, t);

		algos[1].saves = _table.saves;
		algos[1].functionCalls = _table.functionCalls;
		algos[1].id = _table.id;
		algos[1].elemIds = _table.elemIds;
		results.push({
			title: 'Autômato LR(1)',
			content: automatonToString(automaton.states, augRules)
		});
		results.push({
			title: 'Tabela CLR(1)',
			content: tableToString(_table.table, 'estados', { key: (a) => `s${a}` })
		});
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
	const limitHitCallback = () => {
		limit = getLimitHit(id);
	};
	onMount(() => {
		id = algos[0].id === '' ? `clralgo${algos[0].name}` : algos[0].id;
		setLimitHitCallback(limitHitCallback, id);
		swapAlgorithm(id);
		algos[0].loaded = true;
	});
	let selectedAlgorithm = $state(algos[0].name);
</script>

<AlgorithmTab {results} bind:limit {code} bind:id>
	{#snippet steps()}
		<FillSize style="max-width: inherit; width: 100%;">
			{#snippet content()}
				<div class="algo-buttons">
					{#each algos as algo}
						<button
							use:setUpTooltip={{ text: algo.desc }}
							disabled={selectedAlgorithm === algo.name}
							onclick={() => {
								id = algo.id === '' ? `clralgo${algo.name}` : algo.id;

								algo.loaded = true;
								setLimitHitCallback(limitHitCallback, id);
								swapAlgorithm(id);
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
								<LR1AutomatonAlgorithm
									saves={algos[0].saves}
									functionCalls={algos[0].functionCalls}
									elemIds={algos[0].elemIds}
									id={algos[0].id}
									{firstSet}
									bind:results
								></LR1AutomatonAlgorithm>
							</div>
						{/if}
						{#if algos[1].loaded}
							<div
								class="unit grid {selectedAlgorithm === algos[1].name ? 'not-hidden' : 'hidden'}"
							>
								<CLRTableAlgorithm automaton={$_automaton}></CLRTableAlgorithm>
							</div>
						{/if}
					{/snippet}
				</FillSize>
			{/snippet}
		</FillSize>
	{/snippet}
	{#snippet tree()}
		<SyntaxTree id="clralgo{algos[0].name}Parser" floating={true}></SyntaxTree>
	{/snippet}
	{#snippet parse()}
		<div class="grid" style="place-items: center;">
			<ClrParse
				id="clralgo{algos[0].name}Parser"
				stateList={$_automaton.states.map((x) => `s${x.index}`)}
				{table}
			></ClrParse>
		</div>
	{/snippet}
</AlgorithmTab>
