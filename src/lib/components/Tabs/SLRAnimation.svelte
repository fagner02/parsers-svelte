<script>
	import { swapAlgorithm } from '$lib/flowControl';
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
	let code = '';

	const algos = [
		{ name: 'Autômato', desc: 'Construção do autômato LR(0)' },
		{ name: 'Tabela', desc: 'Construção da tabela SLR' }
	];

	swapAlgorithm(`slralgo${algos[0].name}`);
	let selectedAlgorithm = algos[0].name;
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	let table = writable(new Map());
	/**@type {import('@/types').LR0Automaton}*/
	let automaton;

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
	})();
</script>

<AlgorithmTab id="slralgo{algos[0].name}" {code}>
	<FillSize slot="steps" style="max-width: inherit; width: 100%;">
		<div class="algo-buttons">
			{#each algos as algo}
				<button
					use:setUpTooltip={algo.desc}
					disabled={selectedAlgorithm === algo.name}
					on:click={() => {
						swapAlgorithm(`slr${algo.name}`);
						resetSelectionFunctions();
						selectedAlgorithm = algo.name;
					}}>{algo.name}</button
				>
			{/each}
		</div>
		<FillSize class="grid">
			{#if selectedAlgorithm === algos[0].name}
				<LR0AutomatonAlgorithm id="slralgo{algos[0].name}"></LR0AutomatonAlgorithm>
			{:else}
				<SLRTableAlgorithm id="slralgo{algos[1].name}" {automaton} {followSet}></SLRTableAlgorithm>
			{/if}
		</FillSize>
	</FillSize>
	<SyntaxTree slot="tree" floating={true}></SyntaxTree>
	<div slot="parse" class="grid" style="place-items: center;">
		<SlrParse
			id="slralgo{algos[0].name}Parser"
			stateList={automaton.states.map((x) => `s${x.index}`)}
			{table}
		></SlrParse>
	</div>
</AlgorithmTab>
