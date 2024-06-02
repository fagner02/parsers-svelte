<script>
	import { wait } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import FillHeight from './FillHeight.svelte';
	import CloseButton from './CloseButton.svelte';

	export let flex = 0.1;
	export let opacity = 0;
	export let pos = -50;
	export let onClose;

	onMount(async () => {
		await wait(200);
		flex = 1;
		await wait(200);
		opacity = 1;
		pos = 0;
	});
</script>

<FillHeight
	style="display: flex;flex-direction: column;justify-content: center;padding-top: 20px"
	class="maxWidth"
>
	<CloseButton {onClose}></CloseButton>
	<div id={$$props.id} class="popup-box maxWidth" style="scale: {flex} 1;height: inherit">
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
		border: 1px solid hsl(200, 50%, 50%);
	}

	:global(.popup-content) {
		overflow: hidden;
		overflow: auto;
		margin: 0px;
		transition: all 0.5s 0.2s;
	}
</style>
