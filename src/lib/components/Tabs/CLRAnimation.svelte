<script>
	import { getAugGrammar, isGrammarLoaded } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillSize from '@/Layout/FillSize.svelte';
	import LR1AutomatonAlgorithm from '@/Algorithms/LR1AutomatonAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import { first, mergedFirst } from '$lib/first';
	import { writable } from 'svelte/store';
	import { getLimitHit, setLimitHitCallback, swapAlgorithm } from '$lib/flowControl';
	import CLRTableAlgorithm from '@/Algorithms/CLRTableAlgorithm.svelte';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import ClrParse from '@/Algorithms/CLRParse.svelte';
	import { lr1Automaton } from '$lib/lr1automaton';
	import { clrTable } from '$lib/clrTable';
	import { setUpTooltip } from '$lib/tooltip';
	import { onMount } from 'svelte';

	let code = '';
	let { augRules, nt, t } = getAugGrammar();

	let id = $state('');
	let limit = $state();

	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	let table = writable(new Map());

	/**@type {import('svelte/store').Writable<import('@/types').LR1Automaton> }*/
	let automaton = writable({ states: [], transitions: new Map() });

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

		automaton.set(lr1Automaton(augRules, nt, t, _mergedFirst));

		const _table = clrTable($automaton, augRules, nt, t);

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

	let algos = $state([
		{
			comp: LR1AutomatonAlgorithm,
			name: 'Autômato',
			desc: 'Construção de autômato LR(1)',
			loaded: false
		},
		{
			comp: CLRTableAlgorithm,
			name: 'Tabela',
			desc: 'Construção da tabela LR(1)',
			loaded: false
		}
	]);
	const limitHitCallback = () => {
		limit = getLimitHit(id);
	};
	onMount(() => {
		id = `clralgo${algos[0].name}`;
		setLimitHitCallback(limitHitCallback, id);
		swapAlgorithm(id);
		algos[0].loaded = true;
	});
	let selectedAlgorithm = $state(algos[0].name);
</script>

<AlgorithmTab {code} bind:id>
	{#snippet steps()}
		<FillSize style="max-width: inherit; width: 100%;">
			{#snippet content()}
				<div class="algo-buttons">
					{#each algos as algo}
						<button
							use:setUpTooltip={algo.desc}
							disabled={selectedAlgorithm === algo.name}
							onclick={() => {
								id = `clralgo${algo.name}`;
								algo.loaded = true;
								setLimitHitCallback(limitHitCallback, id);
								swapAlgorithm(id);
								resetSelectionFunctions();
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
								<LR1AutomatonAlgorithm id="clralgo{algos[0].name}" {firstSet}
								></LR1AutomatonAlgorithm>
							</div>
						{/if}
						{#if algos[1].loaded}
							<div
								class="unit grid {selectedAlgorithm === algos[1].name ? 'not-hidden' : 'hidden'}"
							>
								<CLRTableAlgorithm automaton={$automaton} id="clralgo{algos[1].name}"
								></CLRTableAlgorithm>
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
				stateList={$automaton.states.map((x) => `s${x.index}`)}
				{table}
			></ClrParse>
		</div>
	{/snippet}
</AlgorithmTab>
