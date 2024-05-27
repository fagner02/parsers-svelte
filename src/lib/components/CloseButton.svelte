<script>
	import { wait } from '$lib/utils';
	import CloseIcon from '@icons/CloseIcon.svelte';
	import { onMount } from 'svelte';

	// let a = `M0.014,0.004 C0.035,0.001,0.088,-0.004,0.124,0.005 C0.248,0.033,0.316,0.252,0.441,0.269 C0.465,0.272,0.479,0.271,0.504,0.269 C0.65,0.254,0.73,0.03,0.876,0.005 C0.912,-0.002,0.965,0.002,0.986,0.004 C0.991,0.004,0.996,0.049,0.997,0.12 C0.999,0.205,1,0.333,1,0.5 C1,0.667,0.999,0.795,0.997,0.88 C0.996,0.951,0.991,0.996,0.986,0.996 C0.965,0.998,0.912,1,0.876,0.995 C0.73,0.97,0.65,0.746,0.504,0.731 C0.479,0.729,0.465,0.728,0.441,0.731 C0.316,0.748,0.248,0.967,0.124,0.995 C0.088,1,0.035,0.999,0.014,0.996 C0.009,0.996,0.004,0.951,0.003,0.88 C0.001,0.796,0,0.667,0,0.5 C0,0.333,0.001,0.204,0.003,0.12 C0.004,0.049,0.009,0.004,0.014,0.004`;
	// let values = new Map([
	// 	['M', 1],
	// 	['C', 3],
	// 	['V', 0],
	// 	['Z', 0]
	// ]);
	// let res = '';
	// while (a.length > 0) {
	// 	res += a[0];
	// 	let count = /**@type {number}*/ (values.get(a[0]));
	// 	if (count === undefined) {
	// 		throw 'lost';
	// 	}
	// 	a = a.substring(1);
	// 	let search = /[A-Z]/.exec(a);
	// 	let sub = search?.index === 0 ? [] : a.substring(0, search?.index).split(',');
	// 	for (let i = 0; i < sub.length; i++) {
	// 		res += ' ';
	// 		if (sub[i] === '') continue;
	// 		if (i % 2 == 0 && count > 0) res += '0';
	// 		else res += '0';
	// 		if (i < sub.length - 1) res += ',';
	// 	}
	// 	a = a.substring(search?.index ? /**@type {number}*/ (search?.index) : a.length);
	// }
	// console.log(res);
	export let onClose;
	let initialWidth = 500;
	let initialHeight = 40;
	let width = initialWidth;
	let scale = 0.1;

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
		await wait(200);
		scale = 1;
	});
</script>

<div class="svg-box grid maxWidth" style="scale:{scale} 1;transition: all 0.5s;">
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
		width: -webkit-fill-available;
		width: -moz-available;
	}
	button {
		background: transparent;
	}

	.svg-box {
		/* padding: 0;
		place-content: start; */
	}

	:global(.xicon) {
		place-self: center end;
		margin-right: 20px;
		z-index: 1;
	}
</style>
