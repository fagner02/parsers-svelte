<script>
	import { onMount } from 'svelte';
	import AlgorithmTab from './AlgorithmTab.svelte';
	import FirstAlgorithm from '../FirstAlgorithm.svelte';
	import FollowAlgorithm from '../FollowAlgorithm.svelte';
	import LlAlgorithm from '../LLAlgorithm.svelte';
	import LlParse from '../LLParse.svelte';
	import { first } from '$lib/first';
	import { follow } from '$lib/follow';
	import { lltable } from '$lib/lltable';
	import { writable } from 'svelte/store';
	import SyntaxTree from '../SyntaxTree.svelte';
	import { loadGrammar } from '$lib/utils';

	// ========== Components ====================
	/**@type {string}*/
	let instruction;
	/**@type {string}*/
	let selectedAlgorithm = 'first';
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<import('../types').SetRow[]>}*/
	let followSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	let table = writable();
	/** @type {Array<import('@/types').GrammarItem>} */
	let rules = [];
	/** @type {Array<string>}*/
	let nt = [];
	/** @type {Array<string>}*/
	let t = [];

	// ========== Components ====================

	const grammar = 'S -> A Bb\nA -> a a\nA -> \nBb -> b m\nBb -> m\nBb -> ';

	/**@type {string}*/
	let inputString;

	let code = '';
	onMount(async () => {
		code = await (await fetch('src/lib/first.js')).text();
		let g = loadGrammar(grammar);
		nt = g.nt;
		t = g.t;
		rules = g.rules;

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
</script>

<AlgorithmTab bind:instruction bind:inputString {code}>
	<div slot="steps" style="max-width: inherit; width: 100%;">
		<div class="algo-buttons">
			<button
				on:click={() => {
					selectedAlgorithm = 'first';
				}}>first</button
			>
			<button
				on:click={async () => {
					selectedAlgorithm = 'follow';
				}}>follow</button
			>
			<button
				on:click={() => {
					selectedAlgorithm = 'table';
				}}>table</button
			>
		</div>
		<div class="grid">
			{#if selectedAlgorithm === 'first'}
				<FirstAlgorithm {rules} {nt} bind:instruction></FirstAlgorithm>
			{:else if selectedAlgorithm === 'follow'}
				<FollowAlgorithm {rules} {nt} {firstSet} bind:instruction></FollowAlgorithm>
			{:else}
				<LlAlgorithm {rules} {nt} {t} {firstSet} {followSet} bind:instruction></LlAlgorithm>
			{/if}
		</div>
	</div>
	<SyntaxTree slot="tree"></SyntaxTree>
	<div slot="parse" class="grid" style="place-items: center;">
		<LlParse bind:input={inputString} {table} {rules}></LlParse>
	</div>
</AlgorithmTab>
