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
	 * @param {string} srcId
	 * @param {string} destId
	 */
	function calcPos(srcId, destId) {
		let srcElem = document.querySelector(srcId);
		let destElem = document.querySelector(destId);

		if (srcElem === null || destElem === null)
			return { srcPos: null, destPos: null, dirx: 1, diry: 1, dist: { x: 1, y: 1 } };

		let srcElemRect = /**@type {DOMRect}*/ (srcElem.getBoundingClientRect());
		let destElemRect = /**@type {DOMRect}*/ (destElem.getBoundingClientRect());

		let parentRect = /**@type {DOMRect}*/ (
			document.querySelector('.cards-box')?.getBoundingClientRect()
		);
		// let dist = {
		// 	x: Math.abs(destElemRect.x - srcElemRect.x) / 1.0,
		// 	y: Math.abs(destElemRect.y - srcElemRect.y) / 1.0
		// };
		// dist.x = dist.x > 1 ? 1 : dist.x;
		// dist.y = dist.y > 1 ? 1 : dist.y;
		return {
			srcPos: {
				x:
					srcElemRect.x -
					parentRect.x +
					(srcElemRect.x > destElemRect.x ? -5 : srcElemRect.width + 5),
				y:
					srcElemRect.y -
					parentRect.y +
					(srcElemRect.y >= destElemRect.y ? 0 : srcElemRect.height + 5)
			},
			destPos: {
				x:
					destElemRect.left -
					parentRect.left +
					(srcElemRect.left < destElemRect.left ? -5 : destElemRect.width + 5),
				y:
					destElemRect.top -
					parentRect.top +
					(srcElemRect.top < destElemRect.top ? -5 : destElemRect.height + 5)
			},
			diry: srcElemRect.top < destElemRect.top ? 1 : -1,
			dirx: srcElemRect.left < destElemRect.left ? 1 : -1
		};
	}

	/**
	 * @param {string} srcId
	 * @param {string} destId
	 */
	export function updateTargets(srcId, destId) {
		if (!srcId.startsWith('#')) {
			srcId = '#' + srcId;
		}
		if (!destId.startsWith('#')) {
			destId = '#' + destId;
		}
		_destId = destId;
		_srcId = srcId;
	}

	/**
	 * @param {string} srcId
	 * @param {string} destId
	 */
	export async function showLine(srcId, destId) {
		if (!srcId.startsWith('#')) {
			srcId = '#' + srcId;
		}
		if (!destId.startsWith('#')) {
			destId = '#' + destId;
		}

		_destId = destId;
		_srcId = srcId;
		if (inter !== null) {
			window.clearInterval(inter);

			if (li && li.animations.length > 0) anime.remove(li.animations[0].animatable.target);
			if (an && an.animations.length > 0) anime.remove(an.animations[0].animatable.target);
		}

		let { srcPos, destPos, dirx, diry, dist } = calcPos(_srcId, _destId);
		if (destPos === null || srcPos === null) return;

		opacity = 1;
		const linePath = [
			`M ${srcPos.x} ${srcPos.y} C ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}`,
			`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30 * dirx} ${srcPos.y + 30 * diry}, ${destPos.x - 30 * dirx} ${destPos.y - 30 * diry},  ${destPos.x} ${destPos.y}`
		];
		const arrowPath = [
			`M ${srcPos.x + 1} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 1}`,
			`M ${destPos.x + 1 * dirx} ${destPos.y + 5 * diry} L ${destPos.x + 5 * dirx} ${destPos.y + 5 * diry} L ${destPos.x + 5 * dirx} ${destPos.y + 1 * diry}`
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

		inter = setInterval(() => {
			if (li === null || an === null) return;
			let { srcPos, destPos, dirx, diry } = calcPos(_srcId, _destId);
			if (destPos === null || srcPos === null) {
				// console.log('destPos', _srcId, _destId);
				if (inter) window.clearInterval(inter);
				return;
			}

			const nlinePath = [
				li.animations[0].currentValue,
				`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30 * dirx} ${srcPos.y + 30 * diry}, ${destPos.x - 30 * dirx} ${destPos.y - 30 * diry},  ${destPos.x} ${destPos.y}`
			];
			const narrowPath = [
				an.animations[0].currentValue,
				`M ${destPos.x + 1 * dirx} ${destPos.y + 5 * diry} L ${destPos.x + 5 * dirx} ${destPos.y + 5 * diry} L ${destPos.x + 5 * dirx} ${destPos.y + 1 * diry}`
			];

			let animeParams = {
				targets: line,
				d: nlinePath,
				duration: 100,
				direction: 'forward',
				autoplay: true,
				easing: 'linear'
			};

			if (li) anime.remove(li.animations[0].animatable.target);
			if (an) anime.remove(an.animations[0].animatable.target);

			li = anime(animeParams);
			an = anime(Object.assign(animeParams, { d: narrowPath, targets: arrow }));
		}, 100);

		// li.pause();
		// /**@type {SVGPathElement}*/ (line).setAttribute('d', li.animations[0].currentValue);
	}

	export async function hideLine() {
		await wait(2000);
		if (inter != null) {
			// li?.pause();
			// an?.pause();
			if (li && li.animations.length > 0) anime.remove(li.animations[0].animatable.target);
			if (an && an.animations.length > 0) anime.remove(an.animations[0].animatable.target);
			window.clearInterval(inter);
		}
		const { srcPos, destPos, dirx, diry } = calcPos(_srcId, _destId);
		if (destPos === null || srcPos === null) return;

		const linePath = [
			`M ${srcPos.x} ${srcPos.y} C ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}`,
			`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30 * dirx} ${srcPos.y + 30 * diry}, ${destPos.x - 30 * dirx} ${destPos.y - 30 * diry},  ${destPos.x} ${destPos.y}`
		];
		const arrowPath = [
			`M ${srcPos.x + 1} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 1}`,
			`M ${destPos.x + 1 * dirx} ${destPos.y + 5 * diry} L ${destPos.x + 5 * dirx} ${destPos.y + 5 * diry} L ${destPos.x + 5 * dirx} ${destPos.y + 1 * diry}`
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
