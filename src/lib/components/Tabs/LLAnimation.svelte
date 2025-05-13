<script>
	import { onMount } from 'svelte';
	import AlgorithmTab from './AlgorithmTab.svelte';
	import FirstAlgorithm from '@/Algorithms/FirstAlgorithm.svelte';
	import FollowAlgorithm from '@/Algorithms/FollowAlgorithm.svelte';
	import LlAlgorithm from '@/Algorithms/LLAlgorithm.svelte';
	import LlParse from '@/Algorithms/LLParse.svelte';
	import { first } from '$lib/first';
	import { follow } from '$lib/follow';
	import { lltable } from '$lib/lltable';
	import { writable } from 'svelte/store';
	import SyntaxTree from '@/Structures/SyntaxTree.svelte';
	import { getGrammar, isGrammarLoaded } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import { getLimitHit, setLimitHitCallback, swapAlgorithm } from '$lib/flowControl';
	import { setUpTooltip } from '$lib/tooltip';
	import { firstToString, followToString, tableToString } from './dataToString';
	import { appendData } from '$lib/log';

	// ========== Components ====================
	let instruction = /**@type {string}*/ ($state());
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<any>>>} */
	let table = writable();
	// ========== Components ====================

	let id = $state('');
	let limit = $state();
	/**@type {import('@/types').ResultsTabItem[]} */
	let results = $state([]);
	let code = '';
	onMount(async () => {
		if (!isGrammarLoaded()) return;
		let { rules, nt, t } = getGrammar();
		const _first = first(rules, nt);
		const _follow = follow(rules, nt, _first);
		const _table = lltable(rules, nt, t, _first, _follow);

		results.push({
			title: 'Conjunto First',
			content: firstToString(_first, rules)
		});

		results.push({
			title: 'Conjunto Follow',
			content: followToString(_follow)
		});

		results.push({
			title: 'Tabela LL(1)',
			content: tableToString(_table, ' ', {
				cell: (a) => {
					if (a === -1) return ' ';
					return `${rules[a].left} -> ${rules[a].right[0] === '' ? 'ε' : rules[a].right.join(' ')}`;
				}
			})
		});

		firstSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[..._first.entries()].map((x) => {
					/**@type {string[]}*/
					let values = [];
					for (let value of x[1].values()) {
						values.push(value);
						if (values.length < x[1].size * 2 - 1) {
							values.push(',');
						}
					}

					return {
						left: rules[x[0]].left,
						right: [...x[1]],
						showRight: true,
						rightProps: values.map((s) => {
							return { value: s, opacity: 1, hide: false, note: '' };
						}),
						note: x[0].toString()
					};
				})
			)
		);

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

		table.set(
			/**@type {Map<string, import('@/types').tableCol<any>>}*/ (
				new Map(
					[..._table].map(([rowKey, cols]) => [
						rowKey,
						new Map(
							[...cols].map(([colKey, cell]) => [
								colKey,
								/**@type {import('../types').tableItem<any>}*/ ({
									data: cell,
									opacity: 1,
									pos: 0,
									text:
										cell > -1
											? `${rules[cell].left} -> ${rules[cell].right[0] === '' ? 'ε' : rules[cell].right.join(' ')}`
											: '',
									width: 1
								})
							])
						)
					])
				)
			)
		);
	});

	const algos = $state([
		{ comp: FirstAlgorithm, name: 'First', desc: 'Construção do conjunto first', loaded: false },
		{ comp: FollowAlgorithm, name: 'Follow', desc: 'Construção do conjunto follow', loaded: false },
		{ comp: LlAlgorithm, name: 'Tabela', desc: 'Construção da tabela LL(1)', loaded: false }
	]);
	const limitHitCallback = () => {
		limit = getLimitHit(id);
	};
	onMount(() => {
		id = `llalgo${algos[0].name}`;
		swapAlgorithm(id);
		setLimitHitCallback(limitHitCallback, id);
		algos[0].loaded = true;
	});
	let selectedAlgorithm = $state(algos[0].name);
</script>

<AlgorithmTab {results} bind:limit bind:id bind:instruction {code}>
	{#snippet steps()}
		<div style="max-width: inherit; width: 100%;">
			<div class="algo-buttons">
				{#each algos as algo}
					<button
						use:setUpTooltip={algo.desc}
						disabled={selectedAlgorithm === algo.name}
						onclick={() => {
							id = `llalgo${algo.name}`;
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
			<div class="grid">
				{#if algos[0].loaded}
					<div
						class="unit grid {selectedAlgorithm === algos[0].name ? 'not-hidden' : 'hidden'}"
						style="height: inherit;"
					>
						<FirstAlgorithm id="llalgo{algos[0].name}" bind:instruction></FirstAlgorithm>
					</div>
				{/if}
				{#if algos[1].loaded}
					<div
						class="unit grid {selectedAlgorithm === algos[1].name ? 'not-hidden' : 'hidden'}"
						style="height: inherit;"
					>
						<FollowAlgorithm id="llalgo{algos[1].name}" {firstSet} bind:instruction
						></FollowAlgorithm>
					</div>
				{/if}
				{#if algos[2].loaded}
					<div
						class="unit grid {selectedAlgorithm === algos[2].name ? 'not-hidden' : 'hidden'}"
						style="height: inherit;"
					>
						<LlAlgorithm id="llalgo{algos[2].name}" {firstSet} {followSet} bind:instruction
						></LlAlgorithm>
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet tree()}
		<SyntaxTree id="llalgo{algos[0].name}Parser"></SyntaxTree>
	{/snippet}
	{#snippet parse()}
		<div class="grid" style="place-items: center;">
			<LlParse id="llalgo{algos[0].name}Parser" {table}></LlParse>
		</div>
	{/snippet}
</AlgorithmTab>
