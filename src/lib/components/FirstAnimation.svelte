<script>
	import { getTextWidth } from '$lib/utils';
	import { onMount } from 'svelte';
	import AlgorithmTab from './Tabs/AlgorithmTab.svelte';
	import FirstAlgorithm from './FirstAlgorithm.svelte';
	import FollowAlgorithm from './FollowAlgorithm.svelte';
	import LlAlgorithm from './LLAlgorithm.svelte';

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
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let followSet;
	/**@type {any}*/
	let swapAlgorithm;
	// ========== Components ====================

	// ========= Style ======================================
	const fontSize = 10;
	const subFontSize = 7;
	const lineHeight = 1.7 * fontSize;
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
	bind:swapAlgorithm
	{code}
>
	<div slot="steps" style="--height: {1.5 * fontSize}px">
		<div class="algo-buttons">
			<button
				on:click={() => {
					swapAlgorithm(() => (selectedAlgorithm = 'first'));
				}}>{'<'}first</button
			>
			<button
				on:click={async () => {
					swapAlgorithm(() => (selectedAlgorithm = 'follow'));
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
					bind:followSet
				></FollowAlgorithm>
			{:else}
				<LlAlgorithm
					{charWidth}
					{fontSize}
					{lineHeight}
					{subCharWidth}
					{subFontSize}
					{limitHit}
					{addPause}
					{firstSet}
					{followSet}
					bind:instruction
					bind:reset
				></LlAlgorithm>
			{/if}
		</div>
	</div>
	<div slot="parse"></div>
</AlgorithmTab>

<style>
	@import '@/block.css';

	.algo-buttons {
		display: flex;
		justify-content: space-between;
	}
</style>
