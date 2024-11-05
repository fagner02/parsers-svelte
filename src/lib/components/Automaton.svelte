<script>
	import { getGrammar } from '$lib/utils';
	import anime from 'animejs';
	import { onMount } from 'svelte';

	let rules = getGrammar().rules;

	/**@type {SVGGElement}*/
	let groupElem;
	/**@type {SVGGElement}*/
	let selectGroupElem;
	/**@type {SVGElement}*/
	let svgElem;
	/**@typedef {{
	 * obj: SVGGElement;
	 * size: {x:number,y:number};
	 * pos: { x: number; y: number; };
	 * lines: SVGLineElement[];
	 * arrows: SVGElement[];
	 * conLabels: SVGGElement[];
	 * con: number[];
	 * }} Node*/
	/**@typedef {{x:number, y:number}} Vec2*/
	/** @type {Node[]}*/
	let nodes = [];

	export function reset() {
		nodes = [];
		groupElem.remove();
		groupElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		groupElem.id = 'nodes';
		selectGroupElem.remove();
		selectGroupElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		selectGroupElem.id = 'selected-node';
		document.querySelector('#svg')?.append(groupElem);
		document.querySelector('#svg')?.append(selectGroupElem);
		groupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
		selectGroupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
	}

	function resetSelected(hide = false) {
		let temp = selectGroupElem.cloneNode(false);
		selectGroupElem.replaceWith(temp);
		selectGroupElem = /**@type {SVGGElement}*/ (temp);
		groupElem.style.opacity = hide ? '1' : '0.5';
		groupElem.style.filter = hide ? 'none' : 'blur(5px)';
	}

	export async function addNode(
		/** @type {number | null}*/ from,
		/** @type {number}*/ to,
		/** @type {import('@/types').State}*/ data,
		/** @type {string?}*/ symbol
	) {
		resetSelected(true);

		if (to > nodes.length - 1) {
			let res = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			let box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			let container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

			for (let [i, item] of data.items.entries()) {
				let span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
				let right = `${rules[item.ruleIndex].right.slice(0, item.pos).join(' ')}\u2022${rules[item.ruleIndex].right.slice(item.pos).join(' ')}`;
				span.textContent = `${rules[item.ruleIndex].left} -> ${right}`;
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
				if (!isClick) return;
				e.stopImmediatePropagation();
				resetSelected();

				let clone = res.cloneNode(true);
				selectGroupElem.append(clone);
				for (let [i, c] of nodes[to].con.entries()) {
					selectGroupElem.prepend(nodes[to].arrows[i].cloneNode(true));
					selectGroupElem.prepend(nodes[to].lines[i].cloneNode(true));
					clone = nodes[c].obj.cloneNode(true);
					/**@type {SVGGElement}*/ (clone).style.pointerEvents = 'none';
					selectGroupElem.append(clone);
				}
			});

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
				con: []
			});
			res.style.transform = `translateX(${nodes[nodes.length - 1].pos.x}px) translateY(${nodes[nodes.length - 1].pos.y}px)`;
		}
		if (from !== null) {
			if (to === nodes.length - 1) {
				nodes[to].pos = { x: nodes[from].pos.x, y: nodes[from].pos.y };
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
				if (!isClick) return;
				e.stopImmediatePropagation();
				resetSelected();
				let clone = nodes[from].obj.cloneNode(true);
				selectGroupElem.append(clone);
				/**@type {SVGGElement}*/ (clone).style.pointerEvents = 'none';

				clone = nodes[to].obj.cloneNode(true);
				selectGroupElem.append(clone);
				/**@type {SVGGElement}*/ (clone).style.pointerEvents = 'none';

				selectGroupElem.prepend(line.cloneNode(true));
				selectGroupElem.append(arrow.cloneNode(true));
			};
			arrow.addEventListener('click', selectLine);
			line.addEventListener('click', selectLine);
		}
		let ex =
			to === (nodes.length - 1 && from !== null) ? [-1, -1] : [/**@type {number}*/ (from), to];
		update(ex);
	}

	let svgScale = 0.7;
	let svgPos = { x: 0, y: 0 };
	/**@type {{ x: number; y: number; } | null}*/
	let dragPos = null;
	let isClick = false;

	function dragStart(/**@type {MouseEvent}*/ e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		isClick = true;
		dragPos = { x: e.clientX, y: e.clientY };
		svgElem.style.cursor = 'grabbing';
	}

	function dragEnd(/**@type {MouseEvent}*/ e) {
		if (dragPos === null) return;
		let diff = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };
		svgPos = { x: svgPos.x + diff.x, y: svgPos.y + diff.y };
		dragPos = null;
		svgElem.style.cursor = 'grab';
	}

	function dragMove(/**@type {MouseEvent}*/ e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		if (dragPos === null) return;
		isClick = false;

		let diff = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };

		groupElem.style.transform = `translate(${svgPos.x + diff.x}px,${svgPos.y + diff.y}px) scale(${svgScale})`;
		selectGroupElem.style.transform = `translate(${svgPos.x + diff.x}px,${svgPos.y + diff.y}px) scale(${svgScale})`;
	}

	let isScroll = false;
	let lastDist = 0;
	function touchStart(/**@type {TouchEvent}*/ e) {
		e.preventDefault();
		if (e.touches.length > 1) {
			isScroll = false;
			let diff = {
				x: e.touches[0].clientX - e.touches[1].clientX,
				y: e.touches[0].clientY - e.touches[1].clientY
			};
			lastDist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
		} else {
			isScroll = true;
			dragPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		}
	}
	function touchMove(/**@type {TouchEvent}*/ e) {
		e.preventDefault();
		if (isScroll) {
			if (dragPos === null) return;
			let diff = { x: e.touches[0].clientX - dragPos.x, y: e.touches[0].clientY - dragPos.y };
			dragPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			svgPos.x += diff.x;
			svgPos.y += diff.y;
			groupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
			selectGroupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;

			return;
		}
		if (e.touches.length < 2) return;
		let diff = {
			x: e.touches[0].clientX - e.touches[1].clientX,
			y: e.touches[0].clientY - e.touches[1].clientY
		};
		let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
		svgScale += (dist - lastDist) * 0.001;
		lastDist = dist;
		groupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
		selectGroupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
	}
	function touchEnd() {
		dragPos = null;
	}

	function wheel(/**@type {WheelEvent}*/ e) {
		e.preventDefault();

		if (Math.round(e.deltaX) !== e.deltaX || Math.round(e.deltaY) !== e.deltaY) {
			svgScale += e.deltaY * -0.01;
			if (svgScale < 0) svgScale = 0;
		} else {
			svgPos = { x: svgPos.x + e.deltaX, y: svgPos.y + e.deltaY };
		}

		groupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
		selectGroupElem.style.transform = `translate(${svgPos.x}px,${svgPos.y}px) scale(${svgScale})`;
	}

	function update(/**@type {number[]}*/ existent) {
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
					let limit = { x: 20 + n.size.x + v.size.x, y: 20 + n.size.y + v.size.y };

					// if (
					// 	diff.x < limit.x &&
					// 	Math.abs(diff.y) <= limit.y
					// 	// ((n.pos.x - n.size.x > v.pos.x - v.size.x && n.pos.x - n.size.x < v.pos.x + v.size.x) ||
					// 	// 	(n.pos.x + n.size.x > v.pos.x - v.size.x && n.pos.x + n.size.x < v.pos.x + v.size.x))
					// ) {
					// 	direction.x += diff.x * -1;
					// }
					if (
						Math.abs(diff.y) <= limit.y &&
						Math.abs(diff.x) <= limit.x
						// ((n.pos.y - n.size.y >= v.pos.y - v.size.y &&
						// 	n.pos.y - n.size.y <= v.pos.y + v.size.y) ||
						// 	(n.pos.y + n.size.y > v.pos.y - v.size.y && n.pos.y + n.size.y < v.pos.y + v.size.y))
					) {
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

	onMount(() => {
		svgElem = /**@type {SVGElement}*/ (document.querySelector('#svg'));
		groupElem = /**@type {SVGGElement}*/ (document.querySelector('#svg>#nodes'));
		selectGroupElem = /**@type {SVGGElement}*/ (document.querySelector('#svg>#selected-node'));
		reset();
		document.querySelector('#svg')?.addEventListener('click', (e) => {
			if (!isClick) return;
			resetSelected(true);
		});
	});
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
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
	id="svg"
>
	<g id="nodes"></g>
	<g id="selected-node"></g>
</svg>

<style>
	#svg {
		min-height: 240px;
		width: 100%;
		height: 100%;
		border-radius: 10px;
		border: 1px solid hsl(200, 50%, 50%, 100%);
		cursor: grab;
		pointer-events: all;
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
