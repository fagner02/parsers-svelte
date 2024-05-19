<script>
	import FirstAnimation from './FirstAnimation.svelte';
	import TextInput from './TextInput.svelte';
	import { fade } from 'svelte/transition';

	/**@type {Array<import('./typedefs').TabItem>} */
	let items = [
		{ comp: TextInput, name: 'Entrada' },
		{ comp: FirstAnimation, name: 'First' }
	];
	let selected = items[0];
</script>

<div class="tab">
	<div class="tab-item-list">
		{#each items as item}
			<button
				class="tab-item"
				style="padding-top: {selected.name == item.name ? 10 : 0}px;background: {selected.name ==
				item.name
					? 'hsl(200,50%,50%)'
					: 'hsl(200,50%,70%)'};"
				on:click={() => {
					selected = item;
				}}>{item.name}</button
			>
		{/each}
	</div>
	<div class="tab-content" in:fade={{ duration: 1000 }} out:fade={{ duration: 1000 }}>
		<svelte:component this={selected.comp}></svelte:component>
	</div>
</div>

<style>
	.tab {
		margin: 0px 10px;
	}
	.tab-content {
		/* box-shadow: inset 0px 10px 10px -10px hsl(200, 50%, 50%); */
	}
	.tab-item {
		background: hsl(200, 50%, 50%);
		border-radius: 0px 0px 10px 10px;
		padding: 5px 10px;
		color: white;
		/* font-family: 'Trebuchet MS'; */
		transition:
			background 0.2s,
			padding 0.2s;
	}

	.tab-item-list {
		height: 35px;
		border-top: 1px solid hsl(200, 50%, 100%);
		display: flex;
		gap: 0px;
		width: fit-content;
		align-items: flex-start;
	}
</style>
