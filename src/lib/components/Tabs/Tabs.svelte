<script>
	import FillSize from '../Layout/FillSize.svelte';
	import LLAnimation from './LLAnimation.svelte';
	import TextInput from '../Layout/TextInput.svelte';
	import SLRAnimation from './SLRAnimation.svelte';
	import CLRAnimation from './CLRAnimation.svelte';
	import { setUpTooltip, hideTooltip } from '$lib/tooltip.js';
	import AssignmentTab from './AssignmentTab.svelte';
	/** @type {{[key: string]: any}} */
	let { ...props } = $props();

	let items = /**@type {Array<import('@/types').TabItem>} */ (
		$state([
			{ comp: TextInput, name: 'Entrada', loaded: true },
			{ comp: LLAnimation, name: 'LL(1)', loaded: false },
			{ comp: SLRAnimation, name: 'SLR', loaded: false },
			{ comp: CLRAnimation, name: 'LR(1)', loaded: false },
			{ comp: AssignmentTab, name: 'Tarefa', loaded: false }
		])
	);
	/**@type {Map<string, Node>} */
	let saves = new Map();
	let selected = $state(items[0]);
</script>

<FillSize class="tab {props.class ?? ''}">
	{#snippet content()}
		<div class="tab-item-list">
			{#each items as item}
				<button
					use:setUpTooltip={item.name}
					class="tab-item"
					style="padding-top: {selected.name == item.name ? 10 : 0}px;background: {selected.name ==
					item.name
						? 'hsl(200,50%,50%)'
						: 'hsl(200,50%,70%)'};"
					onclick={async () => {
						// let clone = document.querySelector('.tab-content')?.cloneNode(true);
						// if (!clone) return;
						// saves.set(selected.name, clone);
						items[items.findIndex((i) => i.name === item.name)].loaded = true;
						hideTooltip();
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
			{#snippet content()}
				{#each items as item}
					<div
						class="unit {selected.name === item.name ? 'not-hidden' : 'hidden'}"
						style="height: inherit;"
					>
						{#if item.loaded}
							<item.comp></item.comp>
						{/if}
					</div>
				{/each}
				<!-- <svelte:component this={selected.comp} class="tab-content" /> -->
			{/snippet}
		</FillSize>
	{/snippet}
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
