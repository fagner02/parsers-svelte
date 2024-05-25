<script>
	import { getJumpWait, wait } from '$lib/utils';
	import anime from 'animejs';
	import { onMount } from 'svelte';

	/** @type {number} */
	export let lineHeight;

	let opacity = 0;
	/** @type {string[]} */
	let linePath;
	/** @type {string[]} */
	let arrowPath;
	/** @type {Element | null} */
	let line;
	/** @type {Element | null} */
	let arrow;

	/**
	 * @param {string} id
	 * @param {boolean} src
	 */
	function calcPos(id, src) {
		let elemRect = /**@type {DOMRect}*/ (document.querySelector(id)?.getBoundingClientRect());
		let parentRect = /**@type {DOMRect}*/ (
			document.querySelector('.cards-box')?.getBoundingClientRect()
		);
		if (src) {
			return {
				x: elemRect.x - parentRect.x + elemRect.height,
				y: elemRect.y - parentRect.y + elemRect.height
			};
		}
		return {
			x: elemRect.x - parentRect.x + elemRect.width / 2 - 12,
			y: elemRect.y - parentRect.y + lineHeight + elemRect.height - 5
		};
	}

	/**
	 * @param {string} srcId
	 * @param {string} destId
	 */
	export async function showLine(srcId, destId) {
		opacity = 1;

		const targetPos = calcPos(destId, false);
		const srcPos = calcPos(srcId, true);

		linePath = [
			`M ${srcPos.x} ${srcPos.y} C ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}`,
			`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30} ${srcPos.y + 30}, ${targetPos.x - 30} ${targetPos.y - 30},  ${targetPos.x} ${targetPos.y}`
		];
		arrowPath = [
			`M ${srcPos.x + 1} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 1}`,
			`M ${targetPos.x + 1} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 1}`
		];

		let animeParams = {
			targets: line,
			d: linePath,
			duration: 2000,
			direction: 'forward',
			delay: 0,
			autoplay: true,
			easing: 'spring(1, 50, 10, 1)'
		};
		anime(animeParams);
		anime(Object.assign(animeParams, { d: arrowPath, targets: arrow }));

		await wait(500);
	}

	export async function hideLine() {
		await wait(2000);
		let animeParams = {
			targets: line,
			d: linePath,
			duration: 1000,
			direction: 'reverse',
			autoplay: true,
			easing: 'easeInQuad'
		};
		anime(animeParams);
		anime(Object.assign(animeParams, { d: arrowPath, targets: arrow }));

		await wait(800);
		opacity = 0;
	}

	export async function setHideOpacity() {
		opacity = 0;
	}

	onMount(() => {
		line = document.querySelector('#line');
		arrow = document.querySelector('#arrow');
	});
</script>

<svg xmlns="http://www.w3.org/2000/svg" class="unit" overflow="visible">
	<defs>
		<path
			stroke-dasharray="6,10"
			id="line"
			d="M 0 0 C 20 20, 50 0, 60 10"
			stroke-linecap="round"
			fill="none"
		/>

		<path
			id="arrow"
			d="M 1 13 L 16 15 L 14.5 1"
			stroke-linejoin="round"
			stroke-linecap="round"
			fill="none"
		/>
	</defs>
	<g id="lines" style="transition: all 0.2s;opacity:{opacity}">
		<use xlink:href="#line" stroke-width="12" stroke="white" />
		<use xlink:href="#line" stroke="black" stroke-width="4" />
		<use xlink:href="#arrow" stroke-width="12" stroke="white" />
		<use xlink:href="#arrow" stroke="black" stroke-width="4"></use>
	</g>
</svg>

<style>
	svg {
		filter: drop-shadow(0px 3px 2px hsl(0, 0%, 0%, 30%));
		width: -webkit-fill-available;
		height: -webkit-fill-available;
		pointer-events: none;
		z-index: 1;
	}
</style>
