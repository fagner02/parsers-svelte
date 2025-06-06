<script>
	import { getJumpPause } from '$lib/flowControl';
	import { getAugGrammar } from '$lib/utils';
	import anime from 'animejs';
	import { onMount } from 'svelte';
	import { Interaction } from '$lib/interactiveElem';
	import ResizeWrapper from '../Layout/ResizeWrapper.svelte';
	import AutomatonIcon from '@icons/AutomatonIcon.svelte';
	import HandMoveIcon from '@icons/HandMoveIcon.svelte';

	let rules = getAugGrammar().augRules;
	/** @type {{id: string}} */
	let props = $props();

	/**@type {SVGGElement}*/
	let groupElem;
	/**@type {SVGGElement}*/
	let selectGroupElem;
	/**@type {SVGElement}*/
	let svgElem;
	/**@typedef {{
	 * obj: SVGGElement;
	 * size: import('@/types').Vec2;
	 * pos: import('@/types').Vec2;
	 * lines: SVGLineElement[];
	 * arrows: SVGElement[];
	 * conLabels: SVGGElement[];
	 * con: number[];
	 * selfCon: string[]
	 * }} Node*/
	/** @type {Node[]}*/
	let nodes = [];
	/**@type {Interaction}*/
	let svgInteraction = $state(new Interaction());
	let moveElements = false;
	let selectedElement = { index: -1, rect: { x: 0, y: 0 }, diff: { x: 0, y: 0 } };
	function move(/**@type {MouseEvent|TouchEvent}*/ e) {
		let x = 0;
		let y = 0;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			if (e.touches.length === 0) return;
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}
		x += selectedElement.diff.x;
		y += selectedElement.diff.y;

		nodes[selectedElement.index].pos = {
			x: (x - selectedElement.rect.x - svgInteraction.pos.x) / svgInteraction.scale,
			y: (y - selectedElement.rect.y - svgInteraction.pos.y) / svgInteraction.scale
		};

		for (let [i, n] of nodes.entries()) {
			n.obj.style.transform = `translateX(${n.pos.x}px) translateY(${n.pos.y}px)`;

			for (let [j, c] of n.con.entries()) {
				if (c !== selectedElement.index && i !== selectedElement.index) continue;

				let arrowPos = calArrow(nodes[c], n);
				let arrowPos2 = calArrow(n, nodes[c]);

				let start = { x: n.pos.x + arrowPos2.x, y: n.pos.y + arrowPos2.y };
				let end = { x: nodes[c].pos.x + arrowPos.x, y: nodes[c].pos.y + arrowPos.y };
				let diff = { x: start.x - end.x, y: start.y - end.y };
				let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
				let middle = {
					x: start.x + (-diff.x / dist) * (dist / 2),
					y: start.y + (-diff.y / dist) * (dist / 2)
				};

				n.lines[j].setAttribute('x1', `${n.pos.x}`);
				n.lines[j].setAttribute('y1', `${n.pos.y}`);
				n.lines[j].setAttribute('x2', `${nodes[c].pos.x}`);
				n.lines[j].setAttribute('y2', `${nodes[c].pos.y}`);

				n.conLabels[j].style.transform = `translateX(${middle.x}px) translateY(${middle.y}px)`;

				n.arrows[j].setAttribute('cx', `${nodes[c].pos.x + arrowPos.x}`);
				n.arrows[j].setAttribute('cy', `${nodes[c].pos.y + arrowPos.y}`);
			}
		}
	}
	function endMove() {
		document.onmousemove = null;
		document.onmouseleave = null;
		document.onmouseup = null;
	}
	export function reset() {
		nodes = [];
		groupElem.remove();
		groupElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		groupElem.id = `${props.id}nodes`;
		selectGroupElem.remove();
		selectGroupElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		selectGroupElem.id = 'selected-node';
		document.querySelector(`#automato-${props.id}-svg`)?.append(groupElem);
		document.querySelector(`#automato-${props.id}-svg`)?.append(selectGroupElem);
		svgInteraction.updateTargets([groupElem, selectGroupElem]);
		setSize();
	}

	function resetSelected(hide = false) {
		let temp = selectGroupElem.cloneNode(false);
		selectGroupElem.replaceWith(temp);
		selectGroupElem = /**@type {SVGGElement}*/ (temp);
		groupElem.style.opacity = hide ? '1' : '0.5';
		groupElem.style.filter = hide ? 'none' : 'blur(5px)';
		svgInteraction.updateTargets([selectGroupElem, groupElem]);
	}

	function calArrow(/** @type {Node} */ pos1, /** @type {Node} */ pos2) {
		let diff = { x: pos1.pos.x - pos2.pos.x, y: pos1.pos.y - pos2.pos.y };
		let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
		let angle = Math.asin(diff.y / dist);
		let h = Math.atan(pos1.size.y / pos1.size.x);
		let arrowPos = { x: 0, y: 0 };
		if (angle <= h && angle >= -h) {
			arrowPos.x = (diff.x < 0 ? 1 : -1) * pos1.size.x;
			arrowPos.y = Math.tan(-angle) * Math.abs(arrowPos.x);
		} else {
			arrowPos.y = (diff.y < 0 ? 1 : -1) * pos1.size.y;
			arrowPos.x = (diff.x < 0 ? 1 : -1) * Math.abs(arrowPos.y / Math.tan(angle));
		}
		return arrowPos;
	}

	/**
	 * @param {number?} from
	 * @param {number} to
	 * @param {import('@/types').LR0State?} data
	 * @param {string?} symbol
	 * @param {boolean?} shouldUpdate
	 */
	export function addNode(from, to, data, symbol, shouldUpdate = true) {
		resetSelected(true);

		if (to > nodes.length - 1 && data) {
			let res = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			let box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			let container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

			for (let [i, item] of data.items.entries()) {
				let span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
				let right = `${rules[item.ruleIndex].right.slice(0, item.pos).join(' ')}\u2022${rules[item.ruleIndex].right.slice(item.pos).join(' ')}`;
				span.textContent = `${rules[item.ruleIndex].left} -> ${right}`;
				if (item.lookahead) {
					span.textContent += `,{${[...item.lookahead].join(',')}}`;
				}
				span.setAttribute('x', '0');
				span.setAttribute('dy', i === 0 ? '0' : '1.5rem');
				span.setAttribute('alignment-baseline', 'before-edge');
				span.setAttribute('dominant-baseline', 'text-before-edge');
				text.append(span);
			}
			let titleBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			let titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			let title = document.createElementNS('http://www.w3.org/2000/svg', 'g');

			titleText.setAttribute('font-size', '0.85rem');
			title.append(titleBox);
			title.append(titleText);
			titleText.textContent = `s${to}`;
			container.append(title);
			container.append(text);
			res.setAttribute('nodeId', `${to}`);
			res.addEventListener('click', (e) => {
				if (!svgInteraction.isClick) return;
				e.stopImmediatePropagation();
				resetSelected();

				let clone = res.cloneNode(true);
				selectGroupElem.append(clone);
				for (let [i, c] of nodes[to].con.entries()) {
					selectGroupElem.append(nodes[to].arrows[i].cloneNode(true));
					selectGroupElem.prepend(nodes[to].lines[i].cloneNode(true));
					selectGroupElem.append(nodes[to].conLabels[i].cloneNode(true));
					clone = nodes[c].obj.cloneNode(true);
					/**@type {SVGGElement}*/ (clone).style.pointerEvents = 'none';
					selectGroupElem.append(clone);
				}
			});

			let startMove = (/**@type {MouseEvent|TouchEvent}*/ e) => {
				if (!moveElements) return;
				let x = 0;
				let y = 0;
				if (e instanceof MouseEvent) {
					x = e.clientX;
					y = e.clientY;
				} else {
					if (e.touches.length === 0) return;
					x = e.touches[0].clientX;
					y = e.touches[0].clientY;
				}
				let rect = svgElem.getBoundingClientRect();
				let diff = {
					x: nodes[to].pos.x * svgInteraction.scale + svgInteraction.pos.x + rect.x - x,
					y: nodes[to].pos.y * svgInteraction.scale + svgInteraction.pos.y + rect.y - y
				};
				selectedElement = {
					index: to,
					rect: { x: rect.x, y: rect.y },
					diff
				};

				document.onmousemove = move;
				document.onmouseup = endMove;
				document.onmouseleave = endMove;
			};
			res.addEventListener('mousedown', startMove);
			res.addEventListener('touchstart', startMove);

			res.style.cursor = 'pointer';
			res.append(box);
			res.append(container);
			box.setAttribute('fill', 'hsl(0,50%,100%)');
			box.setAttribute('stroke', 'hsl(200,50%,50%)');
			groupElem.append(res);

			let titleTextBBox = titleText.getBBox();
			let padding = 10;
			let height = titleTextBBox.height;
			let width = titleTextBBox.width + padding;
			titleBox.setAttribute('height', `${height}`);
			titleBox.setAttribute('width', `${width}`);
			titleBox.setAttribute('rx', '5');
			titleBox.setAttribute('fill', 'hsl(200,50%,50%)');
			titleText.setAttribute('fill', 'hsl(0,0%,100%)');
			titleText.setAttribute('x', `${width / 2}`);
			titleText.setAttribute('y', `${height / 2}`);

			titleText.style.alignmentBaseline = 'central';
			titleText.style.dominantBaseline = 'central';
			titleText.style.textAnchor = 'middle';
			text.setAttribute('transform', `translate(0, ${height})`);

			let textBBox = container.getBBox();
			padding = 20;
			height = textBBox.height + padding;
			width = textBBox.width + padding;

			box.setAttribute('height', `${height}`);
			box.setAttribute('width', `${width}`);
			box.setAttribute('rx', '10');
			box.setAttribute('x', `${-width / 2}`);
			box.setAttribute('y', `${-height / 2}`);
			container.setAttribute(
				'transform',
				`translate(${-textBBox.width / 2}, -${textBBox.height / 2})`
			);
			let size = { x: width / 2, y: height / 2 };
			nodes.push({
				obj: res,
				lines: [],
				arrows: [],
				conLabels: [],
				pos: { x: 200, y: 200 },
				size,
				con: [],
				selfCon: []
			});
			res.style.transform = `translateX(${nodes[nodes.length - 1].pos.x}px) translateY(${nodes[nodes.length - 1].pos.y}px)`;
		}
		if (from !== null) {
			if (to === nodes.length - 1) {
				nodes[to].pos = { x: nodes[from].pos.x, y: nodes[from].pos.y };
			}
			if (from === to) {
				let d = 20;
				let line = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				line.setAttribute('r', d.toString());
				line.setAttribute('fill', 'none');
				line.setAttribute('stroke', 'hsl(0,0%,30%)');
				line.setAttribute('stroke-width', '7');
				line.setAttribute('cx', `${nodes[to].size.x}`);
				nodes[to].obj.prepend(line);
				let arrow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				arrow.setAttribute('r', '7');
				arrow.setAttribute('fill', 'hsl(200,50%,50%)');

				arrow.setAttribute('cx', `${nodes[to].size.x}`);
				arrow.setAttribute('cy', `${d}`);

				let label = document.createElementNS('http://www.w3.org/2000/svg', 'g');
				let labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				labelText.style.dominantBaseline = 'central';
				labelText.style.alignmentBaseline = 'central';
				labelText.style.textAnchor = 'middle';
				labelText.textContent = symbol;
				let labelBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				label.append(labelBox);
				label.append(labelText);
				nodes[to].obj.append(label);
				labelBox.setAttribute('rx', '10');
				let bbox = labelText.getBBox();
				labelBox.setAttribute('fill', 'hsl(200,50%,90%)');
				labelBox.setAttribute('stroke', 'hsl(200,50%,50%)');
				labelBox.setAttribute('height', `${bbox.height + 10}`);
				labelBox.setAttribute('width', `${bbox.width + 10}`);
				labelBox.setAttribute('x', `${-(bbox.width + 10) / 2}`);
				labelBox.setAttribute('y', `${-(bbox.height + 10) / 2}`);
				label.style.transform = `translateX(${nodes[to].size.x + d}px)`;

				nodes[to].obj.append(arrow);
				return;
			}
			nodes[from].con.push(to);

			let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			line.setAttribute('x1', `${nodes[from].pos.x}`);
			line.setAttribute('y1', `${nodes[from].pos.y}`);
			line.setAttribute('x2', `${nodes[to].pos.x}`);
			line.setAttribute('y2', `${nodes[to].pos.y}`);
			line.setAttribute('stroke', 'hsl(0,0%,30%)');
			line.setAttribute('stroke-width', '7');
			groupElem.prepend(line);
			nodes[from].lines.push(line);

			let arrow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			arrow.setAttribute('r', '7');
			arrow.setAttribute('fill', 'hsl(200,50%,50%)');
			groupElem.append(arrow);
			nodes[from].arrows.push(arrow);

			let label = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			let labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			labelText.style.dominantBaseline = 'central';
			labelText.style.alignmentBaseline = 'central';
			labelText.style.textAnchor = 'middle';
			labelText.textContent = symbol;
			let labelBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			label.append(labelBox);
			label.append(labelText);
			groupElem.append(label);

			labelBox.setAttribute('rx', '10');
			let bbox = labelText.getBBox();
			labelBox.setAttribute('fill', 'hsl(200,50%,90%)');
			labelBox.setAttribute('stroke', 'hsl(200,50%,50%)');
			labelBox.setAttribute('height', `${bbox.height + 10}`);
			labelBox.setAttribute('width', `${bbox.width + 10}`);
			labelBox.setAttribute('x', `${-(bbox.width + 10) / 2}`);
			labelBox.setAttribute('y', `${-(bbox.height + 10) / 2}`);

			nodes[from].conLabels.push(label);
			let selectLine = (/**@type {MouseEvent}*/ e) => {
				if (!svgInteraction.isClick) return;
				e.stopImmediatePropagation();
				resetSelected();
				let clone = nodes[from].obj.cloneNode(true);
				selectGroupElem.append(clone);
				/**@type {SVGGElement}*/ (clone).style.pointerEvents = 'none';

				clone = nodes[to].obj.cloneNode(true);
				selectGroupElem.append(clone);
				/**@type {SVGGElement}*/ (clone).style.pointerEvents = 'none';

				selectGroupElem.prepend(line.cloneNode(true));
				selectGroupElem.append(label.cloneNode(true));
				selectGroupElem.append(arrow.cloneNode(true));
			};
			arrow.addEventListener('click', selectLine);
			line.addEventListener('click', selectLine);
			label.addEventListener('click', selectLine);
		}
		let ex =
			to === (nodes.length - 1 && from !== null) ? undefined : [/**@type {number}*/ (from), to];
		if (shouldUpdate && !getJumpPause(props.id)) update(ex);
	}

	/**
	 * @param {number[]} existent
	 * @param {number} numberOfUpdates
	 */
	export function update(existent = [-1, -1], numberOfUpdates = 4) {
		let oldPos = [];
		for (let k = 0; k < numberOfUpdates; k++) {
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
					let limit = { x: 20 + n.size.x + v.size.x, y: 20 + n.size.y + v.size.y };

					if (Math.abs(diff.y) <= limit.y && Math.abs(diff.x) <= limit.x) {
						direction.y += diff.y * -1;
						direction.x += diff.x * -1;
					}
				}
				if (jump) {
					direction.x += (Math.round(Math.random()) ? -1 : 1) * Math.random();
					direction.y += (Math.round(Math.random()) ? -1 : 1) * Math.random();
				}
				let dist = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2));

				oldPos.push({ x: n.pos.x, y: n.pos.y });

				n.pos.x += dist === 0 ? 0 : 30 * (direction.x / dist);
				n.pos.y += dist === 0 ? 0 : 30 * (direction.y / dist);
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
				let calArrow = (/** @type {Node} */ pos1, /** @type {Node} */ pos2) => {
					let diff = { x: pos1.pos.x - pos2.pos.x, y: pos1.pos.y - pos2.pos.y };
					let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
					let angle = Math.asin(diff.y / dist);
					let h = Math.atan(pos1.size.y / pos1.size.x);
					let arrowPos = { x: 0, y: 0 };
					if (angle <= h && angle >= -h) {
						arrowPos.x = (diff.x < 0 ? 1 : -1) * pos1.size.x;
						arrowPos.y = Math.tan(-angle) * Math.abs(arrowPos.x);
					} else {
						arrowPos.y = (diff.y < 0 ? 1 : -1) * pos1.size.y;
						arrowPos.x = (diff.x < 0 ? 1 : -1) * Math.abs(arrowPos.y / Math.tan(angle));
					}
					return arrowPos;
				};

				let arrowPos = calArrow(nodes[c], n);
				let arrowPos2 = calArrow(n, nodes[c]);

				let start = { x: n.pos.x + arrowPos2.x, y: n.pos.y + arrowPos2.y };
				let end = { x: nodes[c].pos.x + arrowPos.x, y: nodes[c].pos.y + arrowPos.y };
				let diff = { x: start.x - end.x, y: start.y - end.y };
				let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
				let middle = {
					x: start.x + (-diff.x / dist) * (dist / 2),
					y: start.y + (-diff.y / dist) * (dist / 2)
				};
				anime({
					targets: n.lines[j],
					x1: [oldPos[i].x, n.pos.x],
					y1: [oldPos[i].y, n.pos.y],
					x2:
						i === existent[0] && c === existent[1]
							? [oldPos[i].x, nodes[c].pos.x]
							: [oldPos[c].x, nodes[c].pos.x],
					y2:
						i === existent[0] && c === existent[1]
							? [oldPos[i].y, nodes[c].pos.y]
							: [oldPos[c].y, nodes[c].pos.y],
					duration: 500,
					direction: 'forward',
					autoplay: true,
					delay: 0,
					easing: 'spring(1, 50, 10, 1)'
				});
				anime({
					targets: n.conLabels[j],
					translateX:
						i === existent[0] && c === existent[1]
							? [oldPos[i].x, middle.x]
							: c === nodes.length - 1 && existent[0] === -1
								? [oldPos[c].x, middle.x]
								: middle.x,
					translateY:
						i === existent[0] && c === existent[1]
							? [oldPos[i].y, middle.y]
							: c === nodes.length - 1 && existent[0] === -1
								? [oldPos[c].y, middle.y]
								: middle.y,

					duration: 500,
					direction: 'forward',
					autoplay: true,
					delay: 0,
					easing: 'spring(1, 50, 10, 1)'
				});

				let pos = {
					x:
						c === existent[1] && i === existent[0]
							? [oldPos[i].x, nodes[c].pos.x + arrowPos.x]
							: c === nodes.length - 1 && existent[0] === -1
								? [oldPos[c].x, nodes[c].pos.x + arrowPos.x]
								: nodes[c].pos.x + arrowPos.x,
					y:
						c === existent[1] && i === existent[0]
							? [oldPos[i].y, nodes[c].pos.y + arrowPos.y]
							: c === nodes.length - 1 && existent[0] === -1
								? [oldPos[c].y, nodes[c].pos.y + arrowPos.y]
								: nodes[c].pos.y + arrowPos.y
				};
				anime({
					targets: n.arrows[j],
					cx: pos.x,
					cy: pos.y,
					duration: 500,
					direction: 'forward',
					autoplay: true,
					delay: 0,
					easing: 'spring(1, 50, 10, 1)'
				});
			}
		}
	}

	/**
	 * @param {import('@/types').LR0Automaton} automaton
	 */
	export async function loadAutomaton(automaton) {
		if (automaton.states.length === 0) {
			return;
		}
		let states = [
			/**@type {import('@/types').LR0State}*/ (automaton.states.find((x) => x.index === 0))
		];

		let processed = [states[0].index];

		addNode(null, states[0].index, states[0], null, false);

		while (states.length > 0) {
			let transitions = automaton.transitions.get(states[0].index);
			if (!transitions) {
				states.shift();
				continue;
			}
			for (let [symbol, state] of transitions) {
				if (processed.includes(state)) continue;
				addNode(states[0].index, state, automaton.states[state], symbol, false);
				if (state != states[0].index) {
					states.push(automaton.states[state]);
				}
				processed.push(state);
			}
			states.shift();
		}

		update([-1, -1], 10);
	}

	let setSize = /**@type {()=>void}*/ ($state());
	onMount(() => {
		svgElem = /**@type {SVGElement}*/ (document.querySelector(`#automato-${props.id}-svg`));
		groupElem = /**@type {SVGGElement}*/ (
			document.querySelector(`#automato-${props.id}-svg>#${props.id}nodes`)
		);
		selectGroupElem = /**@type {SVGGElement}*/ (
			document.querySelector(`#automato-${props.id}-svg>#${props.id}selected-node`)
		);
		svgInteraction.setTransformInteraction(svgElem, [groupElem, selectGroupElem]);

		reset();

		svgElem?.addEventListener('click', (e) => {
			if (!svgInteraction.isClick) return;
			resetSelected(true);
		});
	});

	const actions = [
		{
			icon: HandMoveIcon,
			callback: () => {
				resetSelected(true);
				moveElements = true;
			},
			removeCallback: () => {
				moveElements = false;
			},
			name: 'move-elements',
			desc: 'Mover estados'
		}
	];
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<ResizeWrapper
	title={'Autômato'}
	titleLabel={null}
	bind:setSize
	{actions}
	component={AutomatonIcon}
	id={props.id}
	bind:interaction={svgInteraction}
>
	{#snippet content()}
		<svg class="unit border" id="automato-{props.id}-svg">
			<g id="{props.id}nodes"></g>
			<g id="{props.id}selected-node"></g>
		</svg>
	{/snippet}
</ResizeWrapper>

<style>
	.border {
		min-height: 240px;
		min-width: 240px;
		height: 100%;
	}

	:global(#nodes > *) {
		cursor: pointer;
		user-select: none;
	}
	:global(#selected-node > *) {
		pointer-events: none;
		user-select: none;
	}
</style>
