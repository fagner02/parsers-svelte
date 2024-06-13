<script>
	import { onMount } from 'svelte';
	import { swapAlgorithm } from '$lib/flowControl';
	import AlgorithmTab from './Tabs/AlgorithmTab.svelte';
	import FirstAlgorithm from './FirstAlgorithm.svelte';
	import FollowAlgorithm from './FollowAlgorithm.svelte';
	import LlAlgorithm from './LLAlgorithm.svelte';
	import LlParse from './LLParse.svelte';
	import { first } from '$lib/first';
	import { follow } from '$lib/follow';
	import { lltable } from '$lib/lltable';
	import { writable } from 'svelte/store';

	// ========== Components ====================
	/**@type {string}*/
	let instruction;
	/**@type {string}*/
	let selectedAlgorithm = 'first';
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let firstSet = writable();
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let followSet = writable();
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	let table = writable();
	/** @type {Array.<import('@/types').GrammarItem>} */
	let rules = [];
	// ========== Components ====================

	const grammar = 'S -> A Bb\nS -> A\nA -> a a\nA -> \nBb -> b m\nBb -> m';
	let loaded = false;
	const loadGrammar = function () {
		/** @type {{ left: string; right: string[]; index: number; }[]} */

		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				rules.push({
					left: s[0].replaceAll(' ', ''),
					right: s[1].trim().split(' '),
					index: rules.length
				});
			}
		});

		loaded = true;
	};

	/**@type {string}*/
	let inputString;

	/**@type {() => void}*/
	export let reset;

	let code = '';
	onMount(async () => {
		code = await (await fetch('first.js')).text();
		loadGrammar();
		const nt = ['S', 'A', 'Bb'];

		const t = ['$', 'a', 'b', 'm'];
		const f = first(rules, nt);
		const ff = follow(rules, nt, f);
		const tt = lltable(rules, nt, t, f, ff);
		if (f !== null) {
			firstSet.set(
				/**@type {import('@/types').SetRow[]}*/ (
					[...f.entries()].map((x) => {
						let values = [];
						for (let value of x[1].values()) {
							values.push(value);
							if (values.length < x[1].size * 2 - 1) {
								values.push(',');
							}
						}

						return {
							left: rules[x[0]].left,
							right: values,
							showRight: true,
							rightProps: values.map((s) => {
								return { value: s, opacity: 1 };
							}),
							note: x[0].toString()
						};
					})
				)
			);
		}

		followSet.set(
			/**@type {import('@/types').SetRow[]}*/ (
				[...ff.entries()].map((x) => {
					let values = [];
					for (let value of x[1].values()) {
						values.push(value);
						if (values.length < x[1].size * 2 - 1) {
							values.push(',');
						}
					}

					return {
						left: x[0],
						right: values,
						showRight: true,
						rightProps: values.map((s) => {
							return { value: s, opacity: 1 };
						}),
						note: ''
					};
				})
			)
		);

		table.set(
			/**@type {Map<string, import('./types').tableCol>}*/ (
				new Map(
					[...tt].map(([rowKey, cols]) => [
						rowKey,
						new Map(
							[...cols].map(([colKey, cell]) => [
								colKey,
								/**@type {import('./types').tableItem}*/ ({
									data: cell,
									opacity: 1,
									pos: 0,
									text: cell > -1 ? rules[cell].left : '',
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

{#if loaded}
	<AlgorithmTab resetCall={reset} bind:instruction bind:inputString {code}>
		<div slot="steps">
			<div class="algo-buttons">
				<button
					on:click={() => {
						swapAlgorithm(() => (selectedAlgorithm = 'first'));
					}}>{'<'}first</button
				>
				<button
					on:click={async () => {
						swapAlgorithm(() => {
							selectedAlgorithm = 'follow';
						});
					}}>follow{'>'}</button
				>
				<button
					on:click={() => {
						swapAlgorithm(() => (selectedAlgorithm = 'll'));
					}}>ll{'>'}</button
				>
			</div>
			<div class="grid">
				{#if selectedAlgorithm === 'first'}
					<FirstAlgorithm {rules} bind:instruction bind:reset></FirstAlgorithm>
				{:else if selectedAlgorithm === 'follow'}
					<FollowAlgorithm {rules} {firstSet} bind:instruction bind:reset></FollowAlgorithm>
				{:else}
					<LlAlgorithm {rules} {firstSet} {followSet} bind:instruction bind:reset></LlAlgorithm>
				{/if}
			</div>
		</div>
		<div slot="parse" class="grid" style="place-items: center;">
			<LlParse bind:input={inputString} {table} {rules}></LlParse>
		</div>
	</AlgorithmTab>
{/if}

<style>
	.algo-buttons {
		display: flex;
		justify-content: space-between;
	}
</style>
