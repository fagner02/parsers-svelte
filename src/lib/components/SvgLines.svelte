<script>
	import { wait } from '$lib/utils';
	import anime from 'animejs';

	/** @type {number} */
	export let lineHeight;

	/** @type {string[]} */
	let values;
	/** @type {string[]} */
	let arrow;

	/**
	 * @param {string} srcId
	 * @param {string} destId
	 */
	export async function showLine(srcId, destId) {
		/**@type {HTMLElement}*/ (document.querySelector('#lines')).style.opacity = '1';

		let elemRect = /**@type {DOMRect}*/ (document.querySelector(destId)?.getBoundingClientRect());
		let parentRect = /**@type {DOMRect}*/ (
			document.querySelector('.cards-box')?.getBoundingClientRect()
		);
		const targetPos = {
			x: elemRect.x - parentRect.x + elemRect.width / 2 - 12,
			y: elemRect.y - parentRect.y + lineHeight + elemRect.height - 5
		};

		elemRect = /**@type {DOMRect}*/ (document.querySelector(srcId)?.getBoundingClientRect());
		parentRect = /**@type {DOMRect}*/ (
			document.querySelector('.cards-box')?.getBoundingClientRect()
		);
		const srcPos = {
			x: elemRect.x - parentRect.x + elemRect.height,
			y: elemRect.y - parentRect.y + elemRect.height
		};

		values = [
			`M ${srcPos.x} ${srcPos.y} C ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}, ${srcPos.x} ${srcPos.y}`,
			`M ${srcPos.x} ${srcPos.y} C  ${srcPos.x + 30} ${srcPos.y + 30}, ${targetPos.x - 30} ${targetPos.y - 30},  ${targetPos.x} ${targetPos.y}`
		];
		arrow = [
			`M ${srcPos.x + 1} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 5} L ${srcPos.x + 5} ${srcPos.y + 1}`,
			`M ${targetPos.x + 1} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 5} L ${targetPos.x + 5} ${targetPos.y + 1}`
		];

		let easing = 'spring(1, 50, 10, 1)';
		anime({
			targets: document.querySelector('#line'),
			d: values,
			duration: 2000,
			direction: 'forward',
			delay: 0,
			autoplay: true,
			easing: easing
		});

		anime({
			targets: document.querySelector('#arrow'),
			d: arrow,
			delay: 0,
			duration: 2000,
			direction: 'forward',
			autoplay: true,
			easing: easing
		});

		await wait(500);
	}

	export async function hideLine() {
		await wait(2000);
		anime({
			targets: document.querySelector('#line'),
			d: values,
			duration: 1000,
			direction: 'reverse',
			autoplay: true,
			easing: 'easeInQuad'
		});
		anime({
			targets: document.querySelector('#arrow'),
			d: arrow,
			duration: 1000,
			direction: 'reverse',
			autoplay: true,
			easing: 'easeInQuad'
		});
		await wait(1000);
	}

	export async function setShowOpacity() {
		/**@type {HTMLElement}*/ (document.querySelector('#lines')).style.opacity = '1';
	}

	export async function setHideOpacity() {
		/**@type {HTMLElement}*/ (document.querySelector('#lines')).style.opacity = '0';
	}
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
	<g opacity="0" id="lines" style="transition: all 0.2s;">
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
