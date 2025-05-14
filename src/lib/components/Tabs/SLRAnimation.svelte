<script>
	import { getLimitHit, setLimitHitCallback, swapAlgorithm } from '$lib/flowControl';
	import { getAugGrammar, isGrammarLoaded } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import FillSize from '@/Layout/FillSize.svelte';
	import LR0AutomatonAlgorithm from '@/Algorithms/LR0AutomatonAlgorithm.svelte';
	import SLRTableAlgorithm from '@/Algorithms/SLRTableAlgorithm.svelte';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import SlrParse from '@/Algorithms/SLRParse.svelte';
	import { writable } from 'svelte/store';
	import { follow } from '$lib/follow';
	import { first } from '$lib/first';
	import { lr0Automaton } from '$lib/lr0automaton';
	import { slrTable } from '$lib/slrtable';
	import { setUpTooltip } from '$lib/tooltip';
	import { onMount } from 'svelte';
	import { automatonToString, followToString, tableToString } from './dataToString';
	import { appendData } from '$lib/log';
	let code = '';

	let algos = $state([
		{
			comp: LR0AutomatonAlgorithm,
			name: 'Autômato',
			desc: 'Construção do autômato LR(0)',
			loaded: false
		},
		{ comp: SLRTableAlgorithm, name: 'Tabela', desc: 'Construção da tabela SLR', loaded: false }
	]);

	let id = $state('');
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
		const { augRules, nt, t } = getAugGrammar();
		const _follow = follow(augRules, nt, first(augRules, nt));
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

		automaton = lr0Automaton(augRules, nt, t);

		const _table = slrTable(automaton, augRules, nt, t, _follow);

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

		results.push({
			title: 'Conjunto Follow',
			content: followToString(_follow)
		});

		results.push({
			title: 'Autômato LR(0)',
			content: automatonToString(automaton.states, augRules)
		});

		results.push({
			title: 'Tabela SLR(1)',
			content: tableToString(_table, 'estados', { key: (a) => `s${a}` })
		});
	})();
	const limitHitCallback = () => {
		limit = getLimitHit(id);
	};
	onMount(() => {
		id = `slralgo${algos[0].name}`;
		setLimitHitCallback(limitHitCallback, id);
		swapAlgorithm(id);
		algos[0].loaded = true;
	});
</script>

<AlgorithmTab {results} bind:limit bind:id {code}>
	{#snippet steps()}
		<FillSize style="max-width: inherit; width: 100%;">
			{#snippet content()}
				<div class="algo-buttons">
					{#each algos as algo}
						<button
							use:setUpTooltip={{ text: algo.desc }}
							disabled={selectedAlgorithm === algo.name}
							onclick={() => {
								id = `slralgo${algo.name}`;
								setLimitHitCallback(limitHitCallback, id);
								swapAlgorithm(id);
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
						{#if algos[0].loaded}
							<div
								class="unit grid {selectedAlgorithm === algos[0].name ? 'not-hidden' : 'hidden'}"
							>
								<LR0AutomatonAlgorithm id="slralgo{algos[0].name}"></LR0AutomatonAlgorithm>
							</div>
						{/if}
						{#if algos[1].loaded}
							<div
								class="unit grid {selectedAlgorithm === algos[1].name ? 'not-hidden' : 'hidden'}"
							>
								<SLRTableAlgorithm id="slralgo{algos[1].name}" {automaton} {followSet}
								></SLRTableAlgorithm>
							</div>
						{/if}
					{/snippet}
				</FillSize>
			{/snippet}
		</FillSize>
	{/snippet}
	{#snippet tree()}
		<SyntaxTree id="slralgo{algos[0].name}Parser" floating={true}></SyntaxTree>
	{/snippet}
	{#snippet parse()}
		<div class="grid" style="place-items: center;">
			<SlrParse
				id="slralgo{algos[0].name}Parser"
				stateList={automaton.states.map((x) => `s${x.index}`)}
				{table}
			></SlrParse>
		</div>
	{/snippet}
</AlgorithmTab>
