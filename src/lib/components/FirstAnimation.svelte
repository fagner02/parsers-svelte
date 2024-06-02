<script>
	import { onMount } from 'svelte';
	import AlgorithmTab from './Tabs/AlgorithmTab.svelte';
	import FirstAlgorithm from './FirstAlgorithm.svelte';
	import FollowAlgorithm from './FollowAlgorithm.svelte';
	import LlAlgorithm from './LLAlgorithm.svelte';
	import { swapAlgorithm } from '$lib/flowControl';
	import { fontSize } from '$lib/globalStyle';

	// ========== Components ====================
	/**@type {string}*/
	let instruction;
	/**@type {string}*/
	let selectedAlgorithm = 'first';
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let firstSet;
	/**@type {import('svelte/store').Writable<import('./types').SetRow[]>}*/
	let followSet;
	// ========== Components ====================

	// ========= Style ======================================
	// const fontSize = 10;
	// const subFontSize = 7;
	// const lineHeight = 1.7 * fontSize;
	// let charWidth = 0;
	// let subCharWidth = 0;
	// ========= Style ======================================

	/**@type {string}*/
	let inputString;

	/**@type {() => void}*/
	export let reset;

	let code = '';

	onMount(async () => {
		code = await (await fetch('first.js')).text();
	});
</script>

<AlgorithmTab resetCall={reset} bind:instruction bind:inputString {code}>
	<div slot="steps" style="--height: {1.5 * fontSize}px">
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
				<FirstAlgorithm bind:instruction bind:reset bind:firstSet></FirstAlgorithm>
			{:else if selectedAlgorithm === 'follow'}
				<FollowAlgorithm {firstSet} bind:instruction bind:reset bind:followSet></FollowAlgorithm>
			{:else}
				<LlAlgorithm {firstSet} {followSet} bind:instruction bind:reset></LlAlgorithm>
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
