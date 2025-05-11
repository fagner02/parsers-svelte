<script>
	import FillSize from '../Layout/FillSize.svelte';
	import LLAnimation from './LLAnimation.svelte';
	import TextInput from '../Layout/TextInput.svelte';
	import SLRAnimation from './SLRAnimation.svelte';
	import { swapAlgorithm, wait } from '$lib/flowControl';
	import CLRAnimation from './CLRAnimation.svelte';
	import { setUpTooltip, hideTooltip } from '$lib/tooltip.js';
	import AssignmentTab from './AssignmentTab.svelte';

	/**@type {Array<import('@/types').TabItem>} */
	let items = [
		{ comp: TextInput, name: 'Entrada', loaded: true },
		{ comp: LLAnimation, name: 'LL(1)', loaded: false },
		{ comp: SLRAnimation, name: 'SLR', loaded: false },
		{ comp: CLRAnimation, name: 'LR(1)', loaded: false },
		{ comp: AssignmentTab, name: 'Tarefa', loaded: false }
	];
	/**@type {Map<string, Node>} */
	let saves = new Map();
	let selected = items[0];
</script>

<FillSize class="tab {$$props.class ?? ''}">
	<div class="tab-item-list">
		{#each items as item}
			<button
				use:setUpTooltip={item.name}
				class="tab-item"
				style="padding-top: {selected.name == item.name ? 10 : 0}px;background: {selected.name ==
				item.name
					? 'hsl(200,50%,50%)'
					: 'hsl(200,50%,70%)'};"
				on:click={async () => {
					// let clone = document.querySelector('.tab-content')?.cloneNode(true);
					// if (!clone) return;
					// saves.set(selected.name, clone);
					items[items.findIndex((i) => i.name === item.name)].loaded = true;
					hideTooltip();
					// swapAlgorithm();
					selected = item;
					// console.log('selected');
					// await wait(id,1000);
					// console.log('selected3');
					// let save = saves.get(item.name);
					// if (save) {
					// }
				}}>{item.name}</button
			>
		{/each}
	</div>
	<FillSize class="tab-content grid">
		{#each items as item}
			<div
				class="unit"
				style="height: inherit;z-index: {selected.name === item.name
					? 1
					: 0};opacity: {selected.name === item.name ? '1' : '0'};"
			>
				{#if item.loaded}
					<svelte:component this={item.comp}></svelte:component>
				{/if}
			</div>
		{/each}
		<!-- <svelte:component this={selected.comp} class="tab-content" /> -->
	</FillSize>
</FillSize>

<style>
	:global(.tab) {
		margin: 0px 10px 10px 10px;
		width: 100%;
		width: -webkit-fill-available;
		width: -moz-available;
	}

	.tab-item {
		background: hsl(200, 50%, 50%);
		border-radius: 0px 0px 10px 10px;
		padding: 5px 10px;
		color: white;
		transition:
			background 0.2s,
			padding 0.2s;
	}

	.tab-item-list {
		height: 38px;
		/* border-top: 1px solid hsl(200, 50%, 100%); */
		display: flex;
		gap: 0px;
		width: fit-content;
		align-items: flex-start;
		z-index: -1;
	}
</style>
