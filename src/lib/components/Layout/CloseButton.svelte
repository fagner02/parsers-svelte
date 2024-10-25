<script>
	import { wait } from '$lib/flowControl';
	import CloseIcon from '@icons/CloseIcon.svelte';
	import { onMount } from 'svelte';

	export let onClose;
	let initialWidth = 500;
	let initialHeight = 40;
	let width = initialWidth;
	let scale = 0.1;
	let opacity = 0;

	const opened = `M ${initialWidth * 0.014}, ${initialHeight * 0.004}C ${initialWidth * 0.035}, ${initialHeight * 0.001}, ${initialWidth * 0.088}, ${initialHeight * -0.004}, ${initialWidth * 0.124}, ${initialHeight * 0.005}C ${initialWidth * 0.248}, ${initialHeight * 0.033}, ${initialWidth * 0.316}, ${initialHeight * 0.252}, ${initialWidth * 0.441}, ${initialHeight * 0.269}C ${initialWidth * 0.465}, ${initialHeight * 0.272}, ${initialWidth * 0.479}, ${initialHeight * 0.271}, ${initialWidth * 0.504}, ${initialHeight * 0.269}C ${initialWidth * 0.65}, ${initialHeight * 0.254}, ${initialWidth * 0.73}, ${initialHeight * 0.03}, ${initialWidth * 0.876}, ${initialHeight * 0.005}C ${initialWidth * 0.912}, ${initialHeight * -0.002}, ${initialWidth * 0.965}, ${initialHeight * 0.002}, ${initialWidth * 0.986}, ${initialHeight * 0.004}C ${initialWidth * 0.991}, ${initialHeight * 0.004}, ${initialWidth * 0.996}, ${initialHeight * 0.049}, ${initialWidth * 0.997}, ${initialHeight * 0.12}C ${initialWidth * 0.999}, ${initialHeight * 0.205}, ${initialWidth * 1}, ${initialHeight * 0.333}, ${initialWidth * 1}, ${initialHeight * 0.5}C ${initialWidth * 1}, ${initialHeight * 0.667}, ${initialWidth * 0.999}, ${initialHeight * 0.795}, ${initialWidth * 0.997}, ${initialHeight * 0.88}C ${initialWidth * 0.996}, ${initialHeight * 0.951}, ${initialWidth * 0.991}, ${initialHeight * 0.996}, ${initialWidth * 0.986}, ${initialHeight * 0.996}C ${initialWidth * 0.965}, ${initialHeight * 0.998}, ${initialWidth * 0.912}, ${initialHeight * 1}, ${initialWidth * 0.876}, ${initialHeight * 0.995}C ${initialWidth * 0.73}, ${initialHeight * 0.97}, ${initialWidth * 0.65}, ${initialHeight * 0.746}, ${initialWidth * 0.504}, ${initialHeight * 0.731}C ${initialWidth * 0.479}, ${initialHeight * 0.729}, ${initialWidth * 0.465}, ${initialHeight * 0.728}, ${initialWidth * 0.441}, ${initialHeight * 0.731}C ${initialWidth * 0.316}, ${initialHeight * 0.748}, ${initialWidth * 0.248}, ${initialHeight * 0.967}, ${initialWidth * 0.124}, ${initialHeight * 0.995}C ${initialWidth * 0.088}, ${initialHeight * 1}, ${initialWidth * 0.035}, ${initialHeight * 0.999}, ${initialWidth * 0.014}, ${initialHeight * 0.996}C ${initialWidth * 0.009}, ${initialHeight * 0.996}, ${initialWidth * 0.004}, ${initialHeight * 0.951}, ${initialWidth * 0.003}, ${initialHeight * 0.88}C ${initialWidth * 0.001}, ${initialHeight * 0.796}, ${initialWidth * 0}, ${initialHeight * 0.667}, ${initialWidth * 0}, ${initialHeight * 0.5}C ${initialWidth * 0}, ${initialHeight * 0.333}, ${initialWidth * 0.001}, ${initialHeight * 0.204}, ${initialWidth * 0.003}, ${initialHeight * 0.12}C ${initialWidth * 0.004}, ${initialHeight * 0.049}, ${initialWidth * 0.009}, ${initialHeight * 0.004}, ${initialWidth * 0.014}, ${initialHeight * 0.004}`;

	let d = opened;
	async function resize() {
		const svg = /**@type {HTMLElement}*/ (document.querySelector('#close-svg'));
		const parent = /**@type {HTMLElement}*/ (document.querySelector('#close-svg')?.parentElement);
		if (!svg || !parent) return;
		const map = window.getComputedStyle(svg);
		width = parent.clientWidth - parseFloat(map.marginLeft) - parseFloat(map.marginRight) - 1;
	}

	onMount(async () => {
		const parent = /**@type {HTMLElement}*/ (document.querySelector('.svg-box')?.parentElement);
		new ResizeObserver(resize).observe(parent);
		new MutationObserver(resize).observe(parent, {
			subtree: true,
			childList: true,
			attributes: true
		});

		await wait(300);
		opacity = 1;
		scale = 1;
	});
</script>

<div
	class="svg-box grid maxWidth"
	style="transform: scale({scale}, 1);opacity: {opacity};transition: all 0.5s;"
>
	<svg
		class="unit"
		id="close-svg"
		height={initialHeight}
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path id="close-path" {d} fill="#E54949" transform="scale({width / 500} 1)" />
	</svg>
	<CloseIcon class="unit xicon" strokeWidth={4} color="white"></CloseIcon>
	<button class="unit" on:click={onClose}></button>
</div>

<style>
	svg {
		margin: 0px 10px;
		overflow: visible;
		width: 100%;
	}
	button {
		background: transparent;
	}

	:global(.xicon) {
		place-self: center end;
		margin-right: 20px;
		z-index: 1;
	}
</style>
