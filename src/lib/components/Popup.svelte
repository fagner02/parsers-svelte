<script>
	import { wait } from '$lib/utils';
	import { onMount } from 'svelte';
	import FillHeight from './FillHeight.svelte';

	export let flex = 0.1;
	/**
	 * @type {number | undefined }
	 */
	export let opacity = 0;
	export let pos = -50;
	let elem;
	onMount(async () => {
		elem = document.querySelector('.popup');
		await wait(500);
		flex = 1;

		await wait(50);
		opacity = 1;
		pos = 0;
	});
</script>

<FillHeight style="display: flex;justify-content: center" class="maxWidth">
	<div id={$$props.id} class="popup-box maxWidth" style="flex: {flex};">
		<slot
			maxWidth={flex}
			{opacity}
			{pos}
			contentClass="popup-content"
			style="opacity: {opacity}; translate: 0px {pos}px"
		></slot>
	</div>
</FillHeight>

<style>
	.popup-box {
		display: grid;
		border-radius: 10px;
		transition: all 0.5s;
		padding: 10px;
		margin: 10px;
		overflow: hidden;
	}

	:global(.popup-content) {
		overflow: hidden;
		overflow: auto;
		margin: 0px;
		transition: all 0.5s 0.2s;
	}
</style>
