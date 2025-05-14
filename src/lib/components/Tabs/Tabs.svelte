<script>
	import FillSize from '../Layout/FillSize.svelte';
	import LLAnimation from './LLAnimation.svelte';
	import TextInput from '../Layout/TextInput.svelte';
	import SLRAnimation from './SLRAnimation.svelte';
	import CLRAnimation from './CLRAnimation.svelte';
	import { setUpTooltip } from '$lib/tooltip.js';
	import AssignmentTab from './AssignmentTab.svelte';
	import { appendData } from '$lib/log';
	import { setGrammarChangeCallback } from '$lib/utils';
	import { clearControlFlow } from '$lib/flowControl';
	/** @type {{[key: string]: any}} */
	let { ...props } = $props();

	let items = /**@type {Array<import('@/types').TabItem>} */ (
		$state([
			{ comp: TextInput, name: 'Gramática', loaded: true, desc: 'Digitar gramática de entrada' },
			{ comp: LLAnimation, name: 'LL(1)', loaded: false, desc: 'Visualização do parser LL(1)' },
			{ comp: SLRAnimation, name: 'SLR', loaded: false, desc: 'Visualização do parser SLR' },
			{ comp: CLRAnimation, name: 'LR(1)', loaded: false, desc: 'Visualização do parser LR(1)' },
			{ comp: AssignmentTab, name: 'Tarefa', loaded: false, desc: 'Tarefa' }
		])
	);
	const algoTabs = [1, 2, 3];
	function resetLoadedItems() {
		for (let i = 0; i < algoTabs.length; i++) {
			items[algoTabs[i]].loaded = false;
		}
		clearControlFlow();
	}
	setGrammarChangeCallback(resetLoadedItems);
	let selected = $state(items[0]);
</script>

<FillSize class="tab {props.class ?? ''}">
	{#snippet content()}
		<div class="tab-item-list">
			{#each items as item}
				<button
					use:setUpTooltip={{ text: item.desc }}
					class="tab-item"
					style="padding-top: {selected.name == item.name ? 10 : 0}px;background: {selected.name ==
					item.name
						? 'hsl(200,50%,50%)'
						: 'hsl(200,50%,70%)'};"
					onclick={async () => {
						items[items.findIndex((i) => i.name === item.name)].loaded = true;
						selected = item;
						appendData(`tab change,${item.name}`);
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
		display: flex;
		gap: 0px;
		width: fit-content;
		align-items: flex-start;
		z-index: -1;
	}
</style>
