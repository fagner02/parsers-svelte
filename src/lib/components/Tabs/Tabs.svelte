<script>
	import FillHeight from '../Layout/FillHeight.svelte';
	import LLAnimation from './LLAnimation.svelte';
	import TextInput from '../Layout/TextInput.svelte';
	import SLRAnimation from './SLRAnimation.svelte';
	import { swapAlgorithm } from '$lib/flowControl';

	/**@type {Array<import('@/types').TabItem>} */
	let items = [
		{ comp: TextInput, name: 'Entrada' },
		{ comp: LLAnimation, name: 'LL(1)' },
		{ comp: SLRAnimation, name: 'SLR' }
	];
	let selected = items[0];
</script>

<FillHeight class="tab {$$props.class ?? ''}">
	<div class="tab-item-list">
		{#each items as item}
			<button
				class="tab-item"
				style="padding-top: {selected.name == item.name ? 10 : 0}px;background: {selected.name ==
				item.name
					? 'hsl(200,50%,50%)'
					: 'hsl(200,50%,70%)'};"
				on:click={() => {
					swapAlgorithm();
					selected = item;
				}}>{item.name}</button
			>
		{/each}
	</div>
	<FillHeight class="tab-content">
		<svelte:component this={selected.comp}></svelte:component>
	</FillHeight>
</FillHeight>

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
