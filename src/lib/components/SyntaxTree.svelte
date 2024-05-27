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
						nodes: [{ nodes: [{ nodes: [], data: 'second' }], data: 'second' }],
						data: 'second'
					},
					{
						nodes: [{ nodes: [{ nodes: [], data: 'second' }], data: 'second' }],
						data: 'second'
					},
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
		width = boxWidth * 0.3;
		let vGap = 50;
		/**@typedef {{
			node: node;
			pos: {
				x: number;
				y: number;
			}
		}} nodeItem*/
		/**@type {Array<nodeItem>}*/
		let items = [{ node: root, pos: { x: width / 2, y: 0 } }];
		/**@type {Array<nodeItem>}*/
		let level = [{ node: root, pos: { x: width / 2, y: 0 } }];
		while (level.length > 0) {
			/**
			 * @type {nodeItem[]}
			 */
			let newItems = [];
			/**@type {Array<nodeItem>}*/
			let nextLevel = [];

			for (let i = 0; i < level.length; i++) {
				let current = level[i];

				let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				let item = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				let box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				svg.prepend(path);
				svg.appendChild(box);
				svg.appendChild(item);

				item.textContent = current.node.data;
				let bbox = item.getBBox();
				let pos = {
					x: (i + 1) * (width / (level.length + 1)),
					y: vGap + current.pos.y
				};
				item.setAttribute('dominant-baseline', 'middle');
				item.setAttribute('text-anchor', 'middle');
				item.setAttribute('x', `${pos.x}`);
				item.setAttribute('y', `${pos.y}`);
				item.style.opacity = '0';
				item.style.translate = '0 -10px';
				await wait(10);
				item.style.transition = 'all 0.5s';

				let boxPos = {
					x: pos.x - bbox.width / 2,
					y: pos.y - bbox.height / 2 - 2
				};
				// box.style.filter = 'drop-shadow(0 0 3px hsl(0,0%,0%,20%))';
				box.setAttribute('width', `${bbox.width + 8}`);
				box.setAttribute('height', `${bbox.height + 4}`);
				box.setAttribute('fill', 'white');
				box.setAttribute('stroke', 'hsl(0,0%,80%)');
				box.setAttribute('rx', '10');
				box.setAttribute('x', `${boxPos.x - 4}`);
				box.setAttribute('y', `${boxPos.y - 2}`);

				box.style.translate = '0 -10px';
				box.style.opacity = '0';
				await wait(10);
				box.style.transition = 'all 0.5s';
				box.style.translate = '0 0px';
				box.style.opacity = '1';

				// await wait(500);
				item.style.translate = '0 0px';
				item.style.opacity = '1';
				height = svg.getBBox().height + 100;

				pos.y -= bbox.height / 2 + 4;
				path.setAttribute(
					'd',
					`M ${current.pos.x} ${current.pos.y} C ${current.pos.x} ${current.pos.y + vGap / 2}, ${pos.x} ${pos.y - vGap / 2}, ${pos.x} ${pos.y}`
				);
				path.setAttribute('stroke', 'black');
				path.setAttribute('stroke-width', '2');
				path.setAttribute('fill', 'none');
				path.setAttribute('stroke-dasharray', '100');
				path.setAttribute('stroke-dashoffset', '100');
				path.setAttribute('pathLength', '100');
				await wait(10);
				path.style.transition = 'all 0.6s';
				height = svg.getBBox().height + 100;
				await wait(10);
				path.setAttribute('stroke-dashoffset', '0');
				await wait(1000);

				pos.y += bbox.height + 4;
				for (let i = 0; i < current.node.nodes.length; i++) {
					nextLevel.push({
						node: current.node.nodes[i],
						pos: pos
					});
				}
			}
			items = newItems;
			level = nextLevel;
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

	:global(svg *) {
		transform-box: fill-box;
	}

	.svg-box {
		overflow: auto;
		z-index: 30;
		height: inherit;
		border: 1px solid hsl(0, 0%, 80%);
		border-radius: 10px;
		/* box-shadow: 0 0 5px hsl(0, 0%, 0%, 20%); */
	}
</style>
