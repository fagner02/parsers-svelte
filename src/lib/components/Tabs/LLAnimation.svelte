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
	import { getGrammar, loadGrammar } from '$lib/utils';
	import { resetSelectionFunctions } from '@/Cards/selectionFunction';
	import { swapAlgorithm } from '$lib/flowControl';

	// ========== Components ====================
	/**@type {string}*/
	let instruction;
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	let table = writable();

	// ========== Components ====================

	const grammar = 'S -> A Bb\nA -> a a\nA -> Bb\nBb -> b m\nBb -> m\nBb -> ';
	loadGrammar(grammar);
	/**@type {string}*/
	let inputString;

	let code = '';
	onMount(async () => {
		code = await (await fetch('./first.js')).text();
		let { rules, nt, t } = getGrammar();
		const _first = first(rules, nt);
		const _follow = follow(rules, nt, _first);
		const _table = lltable(rules, nt, t, _first, _follow);

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
			/**@type {Map<string, import('../types').tableCol>}*/ (
				new Map(
					[..._table].map(([rowKey, cols]) => [
						rowKey,
						new Map(
							[...cols].map(([colKey, cell]) => [
								colKey,
								/**@type {import('../types').tableItem}*/ ({
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

	const algos = ['first', 'follow', 'tabela'];
	let selectedAlgorithm = algos[0];
</script>

<AlgorithmTab bind:instruction bind:inputString {code}>
	<div slot="steps" style="max-width: inherit; width: 100%;">
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
		<div class="grid">
			{#if selectedAlgorithm === algos[0]}
				<FirstAlgorithm bind:instruction></FirstAlgorithm>
			{:else if selectedAlgorithm === algos[1]}
				<FollowAlgorithm {firstSet} bind:instruction></FollowAlgorithm>
			{:else}
				<LlAlgorithm {firstSet} {followSet} bind:instruction></LlAlgorithm>
			{/if}
		</div>
	</div>
	<SyntaxTree slot="tree"></SyntaxTree>
	<div slot="parse" class="grid" style="place-items: center;">
		<LlParse bind:input={inputString} {table}></LlParse>
	</div>
</AlgorithmTab>
