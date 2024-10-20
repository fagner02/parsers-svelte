<script>
	import { writable } from 'svelte/store';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { onMount } from 'svelte';
	import { newRunningCall, setResetCall, wait } from '$lib/flowControl';
	import StateCard from './Cards/StateCard.svelte';
	import { getGrammar } from '$lib/utils';
	import anime from 'animejs';
	import GrammarCard from './Cards/GrammarCard.svelte';
	import { colors } from '$lib/selectSymbol';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {StateCard | undefined}*/
	let stateElem;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let stateSet = writable([]);
	let { nt, rules } = getGrammar();

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;

	function reset() {
		stateStack.update(() => []);
		stateSet.update(() => []);
		svgLines?.hideLine();

		buildAutomaton();
	}
	setResetCall(reset);

	async function closure() {
		let itemsToCheck = [...$stateSet];
		while (itemsToCheck.length > 0) {
			/**@type {import("@/types").StateItem[]}*/
			let temp = [];
			for (let item of itemsToCheck) {
				let symbol = rules[item.ruleIndex].right[item.pos];
				if (!nt.includes(symbol)) continue;

				for (let rule of rules) {
					if (!(rule.left === symbol)) continue;
					if ($stateSet.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;
					await stateElem?.addItem(rule.index, 0);
					temp.push({ ruleIndex: rule.index, pos: 0, hide: true });
				}
			}
			itemsToCheck = temp;
		}
	}

	async function buildAutomaton() {
		const id = newRunningCall();

		try {
			await loadGrammar();
			await wait(500);

			/**@type {import('@/types').Automaton}*/
			let automaton = { states: [], transitions: new Map() };

			await stateElem?.addItem(0, 0);

			await closure();
			automaton.states.push($stateSet);
		} catch {}
	}
	/**
	 * @type {{ obj: SVGGElement; size: number; pos: { x: number; y: number; }; lines: SVGLineElement[]; con: number[]; }[]}
	 */
	let nodes = [];
	function createNode(/**@type {number}*/ i, /**@type {number}*/ size) {
		let res = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.textContent = `${i}`;
		res.style.cursor = 'pointer';
		res.style.pointerEvents = 'all';
		res.append(circle);
		res.append(text);
		circle.setAttribute('r', `${size}`);
		circle.setAttribute('fill', 'hsl(0,50%,50%)');
		return res;
	}
	onMount(() => {
		buildAutomaton();
		addo();
		addo();
	});

	function addo() {
		let size = 10 + Math.round(Math.random() * 50);
		let res = createNode(nodes.length, size);

		nodes.push({
			obj: res,
			lines: [],
			pos: { x: 200, y: 200 },
			size,
			con: []
		});
		if (nodes.length > 0) {
			let con = Math.round(Math.random() * (nodes.length - 1));
			nodes[nodes.length - 1].pos = { x: nodes[con].pos.x, y: nodes[con].pos.y };
			nodes[con].con.push(nodes.length - 1);

			let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', `${nodes[con].pos.x}`);
			line.setAttribute('y1', `${nodes[con].pos.y}`);
			line.setAttribute('x2', `${nodes[nodes.length - 1].pos.x}`);
			line.setAttribute('y2', `${nodes[nodes.length - 1].pos.y}`);
			line.setAttribute('stroke', 'black');
			line.setAttribute('stroke-width', '4');
			document.querySelector('#cont>g')?.prepend(line);
			nodes[con].lines.push(line);
		}

		res.style.transform = `translateX(${nodes[nodes.length - 1].pos.x}px) translateY(${nodes[nodes.length - 1].pos.y}px)`;

		document.querySelector('#cont>g')?.append(res);

		up();
	}
	function addl() {
		// for (let i = 0; i < 2; i++) {
		let size = 20;
		let res = createNode(nodes.length, size);
		// res.setAttribute('height', '10');
		let node = Math.round(Math.random() * (nodes.length - 1));
		let con = Math.round(Math.random() * (nodes.length - 1));
		if (nodes[node].con.includes(con) || nodes[con].con.includes(node)) return;

		nodes[con].con.push(node);
		nodes[node].pos = { x: nodes[con].pos.x, y: nodes[con].pos.y };
		// n.con = i in nodes[con].con ? [] : [con];
		// for (let c of n.con) {
		let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line.setAttribute('x1', `${nodes[con].pos.x}`);
		line.setAttribute('y1', `${nodes[con].pos.y}`);
		line.setAttribute('x2', `${nodes[node].pos.x}`);
		line.setAttribute('y2', `${nodes[node].pos.y}`);
		line.setAttribute('stroke', 'black');
		line.setAttribute('stroke-width', '4');
		document.querySelector('#cont>g')?.prepend(line);
		nodes[con].lines.push(line);
		// }
		// }
	}
	let touchType = '';
	let svgScale = 1;
	let svgPos = { x: 0, y: 0 };
	/**@type {{ x: number; y: number; } | null}*/
	let dragPos = null;
	function dragStart(/**@type {MouseEvent}*/ e) {
		dragPos = { x: e.clientX, y: e.clientY };
	}

	function dragEnd(/**@type {MouseEvent}*/ e) {
		if (dragPos === null) return;
		let diff = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };
		svgPos = { x: svgPos.x + diff.x, y: svgPos.y + diff.y };
		dragPos = null;
	}

	function dragMove(/**@type {MouseEvent}*/ e) {
		if (dragPos === null) return;
		let diff = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };

		let g = /**@type {SVGGElement}*/ (document.querySelector('#cont>g'));
		g.style.transform = `translate(${svgPos.x + diff.x}px,${svgPos.y + diff.y}px) scale(${svgScale})`;
	}

	let lastTouch = { x: 0, y: 0 };
	let lastDist = 0;
	function touchStart(/**@type {TouchEvent}*/ e) {
		e.preventDefault();
		if (e.touches.length > 1) {
			touchType = 'pan';
			console.log('pan');
			let diff = {
				x: e.touches[0].clientX - e.touches[1].clientX,
				y: e.touches[0].clientY - e.touches[1].clientX
			};
			lastDist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
		} else {
			lastTouch = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			};
			touchType = 'scroll';
			console.log('scroll');
		}
		dragPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}
	function touchMove(/**@type {TouchEvent}*/ e) {
		if (dragPos === null) return;
		e.preventDefault();
		if (touchType === 'scroll') {
			let diff = { x: e.touches[0].clientX - dragPos.x, y: e.touches[0].clientY - dragPos.y };
			lastTouch = { x: diff.x, y: diff.y };
			let g = /**@type {SVGGElement}*/ (document.querySelector('#cont>g'));
			g.style.transform = `translate(${svgPos.x + diff.x}px,${svgPos.y + diff.y}px) scale(${svgScale})`;
			return;
		}
		if (e.touches.length < 2) return;
		let diff = {
			x: e.touches[0].clientX - e.touches[1].clientX,
			y: e.touches[0].clientY - e.touches[1].clientY
		};
		let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
		svgScale += (dist - lastDist) * 0.001;
	}
	function touchEnd(/**@type {TouchEvent}*/ e) {
		if (dragPos === null) return;
		if (touchType === 'scroll') {
			svgPos = { x: svgPos.x + lastTouch.x, y: svgPos.y + lastTouch.y };
		} else {
		}
		dragPos = null;
		lastTouch = { x: 0, y: 0 };
	}

	function wheel(/**@type {WheelEvent}*/ e) {
		e.preventDefault();

		if (Math.round(e.deltaX) !== e.deltaX || Math.round(e.deltaY) !== e.deltaY) {
			svgScale += e.deltaY * -0.01;
			if (svgScale < 0) svgScale = 0;
		} else {
			svgPos = { x: svgPos.x + e.deltaX, y: svgPos.y + e.deltaY };
		}

		let g = /**@type {SVGGElement}*/ (document.querySelector('#cont>g'));
		g.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
	}

	function up() {
		let oldPos = [];
		for (let k = 0; k < 4; k++) {
			for (let [j, n] of nodes.entries()) {
				let direction = { x: 0, y: 0 };
				let jump = false;
				for (let [i, v] of nodes.entries()) {
					if (i === j) continue;
					let diff = { x: v.pos.x - n.pos.x, y: v.pos.y - n.pos.y };
					let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
					if (dist <= 0) {
						jump = true;
					}
					let limit = 20 + n.size + v.size;
					// if ((n.con.includes(i) || v.con.includes(j)) && dist > limit + 1) {
					// 	// direction.x += diff.x / 40;
					// 	// direction.y += diff.y / 40;
					// 	continue;
					// }
					if (dist < limit) {
						direction.x += (diff.x * -1) / limit;
						direction.y += (diff.y * -1) / limit;
						continue;
					}
				}
				if (jump) {
					direction.x += Math.round(Math.random() * -1) * Math.random();
					direction.y += Math.round(Math.random() * -1) * Math.random();
				}
				let dist = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2));

				oldPos.push({ x: n.pos.x, y: n.pos.y });
				n.pos.x += dist === 0 ? 0 : 20 * (direction.x / dist);
				n.pos.y += dist === 0 ? 0 : 20 * (direction.y / dist);
			}
		}

		for (let [i, n] of nodes.entries()) {
			anime({
				targets: n.obj,
				translateX: [oldPos[i].x, n.pos.x],
				translateY: [oldPos[i].y, n.pos.y],
				duration: 500,
				direction: 'forward',
				autoplay: true,
				delay: 0,
				easing: 'spring(1, 50, 10, 1)'
			});
			for (let [j, c] of n.con.entries()) {
				anime({
					targets: n.lines[j],
					x1: [oldPos[i].x, n.pos.x],
					y1: [oldPos[i].y, n.pos.y],
					x2: [oldPos[c].x, nodes[c].pos.x],
					y2: [oldPos[c].y, nodes[c].pos.y],
					duration: 500,
					direction: 'forward',
					autoplay: true,
					delay: 0,
					easing: 'spring(1, 50, 10, 1)'
				});
			}
		}
	}
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div id="ji"></div>
<div class="cards-box unit" style="padding: 0 5px;">
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->

	<div style="padding: 5px; padding-bottom: 0px;flex: 1; height: 100%;">
		<svg
			role="application"
			on:mousedown={dragStart}
			on:mouseleave={dragEnd}
			on:mouseup={dragEnd}
			on:mousemove={dragMove}
			on:touchstart={touchStart}
			on:touchmove={touchMove}
			on:touchend={touchEnd}
			on:wheel={wheel}
			id="cont"
		>
			<g></g>
		</svg>
	</div>
	<div style="flex: 0;">
		<GrammarCard bind:loadGrammar></GrammarCard>
		<StackCard
			stack={stateStack}
			stackId="state"
			label="state stack"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
		<StateCard
			state={stateSet}
			stateId={'state'}
			label="state"
			hue={colors.pink}
			bind:this={stateElem}
		></StateCard>
	</div>
</div>

<style>
	#cont {
		width: 100%;
		height: 100%;
		border-radius: 10px;
		border: 1px solid hsl(200, 50%, 50%, 100%);
		/* box-shadow: 0px 0px 5px inset hsl(0, 0%, 0%, 20%); */
		cursor: move;
	}
	#cont > * {
		pointer-events: none;
		user-select: none;
	}
</style>
