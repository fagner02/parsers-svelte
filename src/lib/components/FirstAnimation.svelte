<script>
	import { onMount } from 'svelte';
	import { swapAlgorithm } from '$lib/flowControl';
	import { fontSize } from '$lib/globalStyle';
	import AlgorithmTab from './Tabs/AlgorithmTab.svelte';
	import FirstAlgorithm from './FirstAlgorithm.svelte';
	import FollowAlgorithm from './FollowAlgorithm.svelte';
	import LlAlgorithm from './LLAlgorithm.svelte';
	import LlParse from './LLParse.svelte';

	// ========== Components ====================
	/**@type {string}*/
	let instruction;
	/**@type {string}*/
	let selectedAlgorithm = 'first';
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let firstSet;
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let followSet;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	let table;
	/** @type {Array.<import('@/types').GrammarItem>} */
	let rules = [];
	// ========== Components ====================

	const grammar = 'S -> A Bb\nA -> a a\nA -> \nBb -> b m\nBb -> m';
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
	/**
	 * @type {{ comp: any; args: any}[]}
	 */
	let steps = [];
	let currentStep = 0;
	onMount(async () => {
		code = await (await fetch('first.js')).text();

		steps = [
			{
				comp: FirstAlgorithm,
				args: {
					instruction: instruction,
					firstSet: firstSet,
					callback: () => {
						currentStep = 1;
					}
				}
			},
			{
				comp: FollowAlgorithm,
				args: {
					instruction: instruction,
					firstSet: firstSet,
					followSet: followSet,
					callback: () => {
						currentStep = 2;
					}
				}
			},
			{
				comp: LlAlgorithm,
				args: {
					instruction: instruction,
					firstSet: firstSet,
					followSet: followSet,
					callback: () => {
						currentStep = -1;
					}
				}
			}
		];
	});
	onMount(() => loadGrammar());
</script>

{#if loaded}
	{#if steps.length > 0 && currentStep > -1}
		{currentStep}
		<div style="display: none;">
			<svelte:component
				this={steps[currentStep].comp}
				bind:followSet
				bind:firstSet
				bind:table
				{rules}
				{...steps[currentStep].args}
			></svelte:component>
		</div>
	{/if}
	{#if currentStep === -1}
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
{/if}

<style>
	.algo-buttons {
		display: flex;
		justify-content: space-between;
	}
</style>
