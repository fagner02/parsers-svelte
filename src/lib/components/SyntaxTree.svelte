<script>
	import { wait } from '$lib/utils';
	import { onMount } from 'svelte';

	let svg;
	let parent;
	let width = 0;
	let height = 0;
	let boxWidth = 0;
	let boxHeight = 0;

	/**@typedef {{nodes: Array<node>, data: string}} node*/

	/**@type {node}*/
	let root = {
		nodes: [
			{
				nodes: [
					{
						nodes: [
							{
								nodes: [
									{
										nodes: [{ nodes: [{ nodes: [], data: 'second' }], data: 'second' }],
										data: 'second'
									}
								],
								data: 'second'
							}
						],
						data: 'second'
					}
				],
				data: 'second'
			},
			{ nodes: [], data: 'third' }
		],
		data: 'first'
	};

	onMount(async () => {
		await setSvg(/**@type {SVGGElement}*/ (document.querySelector('#parse-svg')));
	});
	/**
	 * @param {SVGGElement} comp
	 */
	async function setSvg(comp) {
		svg = comp;
		parent = /**@type {SVGSVGElement}*/ (document.querySelector('.svg-box')).parentElement;
		boxWidth = /**@type {number}*/ (parent?.clientWidth);
		boxHeight = /**@type {number}*/ (parent?.clientHeight);
		width = boxWidth;
		let vGap = 100;
		/**@typedef {{
			node: node;
			length: number;
			index: number;
			order: number;
			height: number;
			pos: {
				x: number;
				y: number;
			}
		}} nodeItem*/
		/**@type {Array<nodeItem>}*/
		let items = [
			{ node: root, length: 1, index: 0, order: 1, height: 0, pos: { x: width / 2, y: 0 } }
		];
		while (items.length > 0) {
			/**
			 * @type {nodeItem[]}
			 */
			let newItems = [];
			while (items.length > 0) {
				let current = /**@type {nodeItem}*/ (items.shift());

				let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				let item = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				let box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				svg.prepend(path);
				svg.appendChild(box);
				svg.appendChild(item);

				item.textContent = current.node.data;
				let bbox = item.getBBox();
				let pos = {
					x: current.order * (width / (current.length + 1)),
					y: vGap + current.height
				};
				item.setAttribute('dominant-baseline', 'middle');
				item.setAttribute('text-anchor', 'middle');
				item.setAttribute('x', `${pos.x}`);
				item.setAttribute('y', `${pos.y}`);
				let boxPos = {
					x: pos.x - bbox.width / 2,
					y: pos.y - bbox.height / 2 - 2
				};
				box.style.filter = 'drop-shadow(0 0 3px hsl(0,0%,0%,20%))';
				box.setAttribute('width', `${bbox.width + 8}`);
				box.setAttribute('height', `${bbox.height + 4}`);
				box.setAttribute('fill', 'white');
				// box.setAttribute('stroke', 'black');
				box.setAttribute('rx', '10');
				box.setAttribute('x', `${boxPos.x - 4}`);
				box.setAttribute('y', `${boxPos.y - 2}`);

				boxPos.x += bbox.width / 2;
				boxPos.y += bbox.height / 2;
				path.style.transition = 'all 0.6s';
				path.setAttribute(
					'd',
					`M ${current.pos.x} ${current.pos.y} C ${current.pos.x} ${current.pos.y}, ${current.pos.x} ${current.pos.y},${current.pos.x} ${current.pos.y}`
				);
				height = svg.getBBox().height + 100;
				await wait(1000);
				path.setAttribute(
					'd',
					`M ${current.pos.x} ${current.pos.y} C ${current.pos.x} ${current.pos.y + (vGap - 20)}, ${pos.x} ${pos.y - (vGap - 20)}, ${pos.x} ${pos.y}`
				);
				path.setAttribute('stroke', 'black');
				path.setAttribute('stroke-width', '2');
				path.setAttribute('fill', 'none');
				height = svg.getBBox().height + 100;
				await wait(1000);

				for (let i = 0; i < current.node.nodes.length; i++) {
					newItems.push({
						node: current.node.nodes[i],
						length: current.node.nodes.length,
						index: i,
						order: i + 1,
						height: pos.y + bbox.height / 2,
						pos: pos
					});
				}
			}
			items = newItems;
		}
		height = svg.getBBox().height + 100;
	}
</script>

<div class="svg-box" style="width: {width}px;">
	<svg {height}>
		<g id="parse-svg"></g>
	</svg>
</div>

<style>
	svg {
		overflow: visible;
	}

	.svg-box {
		overflow: auto;
		z-index: 30;
		height: inherit;
	}
</style>
