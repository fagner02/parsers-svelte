<script>
	import { swapAlgorithm } from '$lib/flowControl';
	import { getGrammar } from '$lib/utils';
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
	let code = '';
	/**@type {string} */
	let inputString;

	const algos = ['autômato', 'tabela'];
	let selectedAlgorithm = algos[0];
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	let table = writable(new Map());
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

		const _table = slrTable(automaton, rules, nt, t, _follow);

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

<AlgorithmTab {inputString} {code}>
	<FillSize slot="steps" style="max-width: inherit; width: 100%;">
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
		<FillSize class="grid">
			{#if selectedAlgorithm === algos[0]}
				<LR0AutomatonAlgorithm></LR0AutomatonAlgorithm>
			{:else}
				<SLRTableAlgorithm {automaton} {followSet}></SLRTableAlgorithm>
			{/if}
		</FillSize>
	</FillSize>
	<SyntaxTree slot="tree"></SyntaxTree>
	<div slot="parse" class="grid" style="place-items: center;">
		<SlrParse
			bind:input={inputString}
			stateList={automaton.states.map((x) => `s${x.index}`)}
			{table}
		></SlrParse>
	</div>
</AlgorithmTab>
