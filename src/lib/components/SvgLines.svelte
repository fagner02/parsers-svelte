<script>
	import { wait } from '$lib/flowControl';
	import { lineHeight } from '$lib/globalStyle';
	import anime from 'animejs';
	import { onMount } from 'svelte';

	let opacity = 0;
	// /** @type {string[]} */
	// let linePath;
	// /** @type {string[]} */
	// let arrowPath;
	/** @type {SVGPathElement | null} */
	let line;
	/** @type {SVGElement | null} */
	let arrow;

	/**@type {string}*/
	let _destId;
	/**@type {string}*/
	let _srcId;

	/**@type {null | anime.AnimeInstance}*/
	let li = null;
	/**@type {null | anime.AnimeInstance}*/
	let an = null;

	/**@type {null | NodeJS.Timeout}*/
	let inter = null;

	export let svgId;

	/**
	 * @param {string} id
	 * @param {boolean} src
	 */
	function calcPos(id, src) {
		if (!id.startsWith('#')) {
			id = '#' + id;
		}

		let elemRect = /**@type {DOMRect}*/ (document.querySelector(id)?.getBoundingClientRect());
		let parentRect = /**@type {DOMRect}*/ (
			document.querySelector('.cards-box')?.getBoundingClientRect()
		);
		if (src) {
			return {
				x: elemRect.x - parentRect.x + elemRect.width + 5,
				y: elemRect.y - parentRect.y + elemRect.height
			};
		}

		return {
			x: elemRect.left - parentRect.left - 10,
			y: elemRect.top - parentRect.top - 5
		};
	}

	/**
	 * @param {string} srcId
	 * @param {string} destId
	 */
	export async function showLine(srcId, destId) {
		_destId = destId;
		_srcId = srcId;
		if (inter !== null) {
			window.clearInterval(inter);
			li?.pause();
			an?.pause();
		}
		opacity = 1;

		const targetPos = calcPos(destId, false);
		const srcPos = calcPos(srcId, true);

		const linePath = [
			`M ${srcPos.x} ${srcPos.y} C ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}`,
			`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30} ${srcPos.y + 30}, ${targetPos.x - 30} ${targetPos.y - 30},  ${targetPos.x} ${targetPos.y}`
		];
		const arrowPath = [
			`M ${srcPos.x + 1} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 1}`,
			`M ${targetPos.x + 1} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 1}`
		];

		let animeParams = {
			targets: line,
			d: linePath,
			duration: 2900,
			direction: 'forward',
			autoplay: true,
			easing: 'spring(1, 50, 10, 1)'
		};

		li = anime(animeParams);
		an = anime(Object.assign(animeParams, { d: arrowPath, targets: arrow }));

		await wait(500);

		inter = setInterval(async () => {
			try {
				if (li === null || an === null) return;
				const targetPos = calcPos(destId, false);
				const srcPos = calcPos(srcId, true);

				let nlinePath = [
					li.animations[0].currentValue,
					`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30} ${srcPos.y + 30}, ${targetPos.x - 30} ${targetPos.y - 30},  ${targetPos.x} ${targetPos.y}`
				];
				let narrowPath = [
					an.animations[0].currentValue,
					`M ${targetPos.x + 1} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 1}`
				];
				// /**@type {SVGPathElement}*/ (line).setAttribute('d');

				let animeParams = {
					targets: line,
					d: nlinePath,
					duration: 100,
					direction: 'forward',
					autoplay: true,
					easing: 'linear'
				};

				li.pause();
				li = anime(animeParams);
				// console.log(li.animations);
				an.pause();
				an = anime(Object.assign(animeParams, { d: narrowPath, targets: arrow }));
			} catch (e) {
				if (inter != null) {
					window.clearInterval(inter);
					li?.pause();
					an?.pause();
				}
			}
		}, 100);

		// li.pause();
		// /**@type {SVGPathElement}*/ (line).setAttribute('d', li.animations[0].currentValue);
	}

	export async function hideLine() {
		await wait(2000);
		if (inter != null) {
			li?.pause();
			an?.pause();
			window.clearInterval(inter);
		}
		const targetPos = calcPos(_destId, false);
		const srcPos = calcPos(_srcId, true);

		const linePath = [
			`M ${srcPos.x} ${srcPos.y} C ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}`,
			`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30} ${srcPos.y + 30}, ${targetPos.x - 30} ${targetPos.y - 30},  ${targetPos.x} ${targetPos.y}`
		];
		const arrowPath = [
			`M ${srcPos.x + 1} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 1}`,
			`M ${targetPos.x + 1} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 1}`
		];
		let animeParams = {
			targets: line,
			d: linePath,
			duration: 500,
			direction: 'reverse',
			autoplay: true,
			easing: 'easeInQuad'
		};

		anime(animeParams);
		anime(Object.assign(animeParams, { d: arrowPath, targets: arrow }));

		await wait(400);
		opacity = 0;
		await wait(300);
	}

	export async function setHideOpacity() {
		opacity = 0;
	}

	onMount(() => {
		line = document.querySelector(`#${svgId}-line`);
		arrow = document.querySelector(`#${svgId}-arrow`);
	});
</script>

<svg id={svgId} xmlns="http://www.w3.org/2000/svg" class="unit" overflow="visible">
	<defs>
		<path
			stroke-dasharray="6,10"
			id="{svgId}-line"
			d="M 0 0 C 20 20, 50 0, 60 10"
			stroke-linecap="round"
			fill="none"
		/>

		<path
			id="{svgId}-arrow"
			d="M 1 13 L 16 15 L 14.5 1"
			stroke-linejoin="round"
			stroke-linecap="round"
			fill="none"
		/>
	</defs>
	<g id="{svgId}-lines" style="transition: all 0.2s;opacity:{opacity}">
		<use xlink:href="#{svgId}-line" stroke-width="12" stroke="white" />
		<use xlink:href="#{svgId}-line" stroke="black" stroke-width="4" />
		<use xlink:href="#{svgId}-arrow" stroke-width="12" stroke="white" />
		<use xlink:href="#{svgId}-arrow" stroke="black" stroke-width="4"></use>
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
