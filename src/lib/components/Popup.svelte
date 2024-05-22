<script>
	import { wait } from '$lib/utils';
	import { onMount } from 'svelte';

	export let maxWidth = 50;
	export let opacity = 0;
	export let pos = -50;

	onMount(async () => {
		await wait(400);
		maxWidth = /**@type {number}*/ (document.querySelector('.popup')?.scrollWidth);

		await wait(50);
		opacity = 1;
		pos = 0;
	});
</script>

<div
	id={$$props.id}
	class="popup-box maxHeight maxWidth"
	style="max-width: {maxWidth}px;place-self: center;"
>
	<slot
		{maxWidth}
		{opacity}
		{pos}
		contentClass="popup-content"
		style="opacity: {opacity}; translate: {pos}px 0px"
	></slot>
</div>

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
