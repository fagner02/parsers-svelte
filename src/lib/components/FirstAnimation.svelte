<script>
	import { writable } from 'svelte/store';
	import { getTextWidth, wait } from '$lib/utils';
	import { onMount, setContext } from 'svelte';
	import StackCard from './Cards/StackCard.svelte';
	import SetsCard from './Cards/SetsCard.svelte';
	import GrammarCard from './Cards/GrammarCard.svelte';
	import AlgorithmTab from './Tabs/AlgorithmTab.svelte';
	import SvgLines from './SvgLines.svelte';
	import TableCard from './Cards/TableCard.svelte';
	import FirstAlgorithm from './FirstAlgorithm.svelte';
	import FollowAlgorithm from './FollowAlgorithm.svelte';

	// ========== Components ====================
	/**@type {() => Promise<void>}*/
	let addPause;
	/**@type {() => void}*/
	let limitHit;
	/**@type {string}*/
	let instruction;
	/**@type {string}*/
	let selectedAlgorithm = 'first';
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let firstSet;
	// ========== Components ====================

	// ========= Style ======================================
	const fontSize = 15;
	const subFontSize = 10;
	const lineHeight = 26;
	let charWidth = 0;
	let subCharWidth = 0;
	// ========= Style ======================================

	/**@type {string}*/
	let inputString;

	/**@type {() => void}*/
	export let reset;

	let code = '';

	onMount(async () => {
		code = await (await fetch('first.js')).text();
		charWidth = getTextWidth('P', fontSize);
		subCharWidth = getTextWidth('P', subFontSize);
	});
</script>

<AlgorithmTab
	resetCall={reset}
	bind:addPause
	bind:limitHit
	bind:instruction
	bind:inputString
	bind:selectedAlgorithm
	{code}
>
	<div slot="steps">
		<div class="algo-buttons">
			<button on:click={() => (selectedAlgorithm = 'first')}>{'<'}first</button>
			<button on:click={() => (selectedAlgorithm = 'follow')}>follow{'>'}</button>
		</div>
		<div class="grid">
			{#if selectedAlgorithm === 'first'}
				<FirstAlgorithm
					{charWidth}
					{fontSize}
					{lineHeight}
					{subCharWidth}
					{subFontSize}
					{limitHit}
					{addPause}
					bind:instruction
					bind:reset
					bind:firstSet
				></FirstAlgorithm>
			{:else if selectedAlgorithm === 'follow'}
				<FollowAlgorithm
					{charWidth}
					{fontSize}
					{lineHeight}
					{subCharWidth}
					{subFontSize}
					{limitHit}
					{addPause}
					{firstSet}
					bind:instruction
					bind:reset
				></FollowAlgorithm>
			{:else}
				<!-- <TableCard
					label="LL(1) tabela"
					color="blue"
					tableId="t"
					{lineHeight}
					{svgLines}
					{charWidth}
					{subCharWidth}
				></TableCard> -->
			{/if}
		</div>
	</div>
	<div slot="parse">
		<!-- <div class="cards-box unit">
			<TableCard
				label="LL(1) tabela"
				color="blue"
				tableId="t"
				{lineHeight}
				{svgLines}
				{charWidth}
				{subCharWidth}
			></TableCard>
			<Stack
				{lineHeight}
				{charWidth}
				{subCharWidth}
				{subFontSize}
				{fontSize}
				stack={posStack}
				stackId="pilha"
				label="pilha"
				color="blue"
				bind:this={posStackElement}
				bind:svgLines
			></Stack>
			<Stack
				{lineHeight}
				{charWidth}
				{subCharWidth}
				{subFontSize}
				{fontSize}
				stack={posStack}
				stackId="input"
				label="entrada"
				color="green"
				bind:this={posStackElement}
				bind:svgLines
			></Stack>
		</div> -->
	</div>
</AlgorithmTab>

<style>
	@import '@/block.css';

	.algo-buttons {
		display: flex;
		justify-content: space-between;
	}
</style>
