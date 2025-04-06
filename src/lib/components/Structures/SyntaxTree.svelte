<script>
	import { wait } from '$lib/flowControl';
	import { setTreeFunctions } from '$lib/treeFunctions';
	import { onMount } from 'svelte';

	/** @type {SVGGElement} */
	let svg;
	/** @type {Element} */
	let parentElement;
	let width = 0;
	let height = 0;
	let boxWidth = 0;
	let updating = false;
	let blockSize = 30;
	export let floating = false;
	const vGap = 30;
	const vGapPoint = vGap / 1.9;

	/**@type {import('@/types').node[][]}*/
	let levels = [[]];

	/**
	 * @param {string} data
	 */
	function findNode(data) {
		/**@type {import('@/types').nodeId[]}*/
		let nodes = [{ level: 0, index: 0 }];

		while (nodes.length > 0) {
			const nodeId = /**@type {import('@/types').nodeId}*/ (nodes.pop());
			const node = levels[nodeId.level][nodeId.index];
			if (node === null) return;
			if (node.data === data && !node.done) {
				return node;
			}

			if (levels.length <= nodeId.level + 1) continue;

			for (let i = levels[nodeId.level + 1].length - 1; i > -1; i--) {
				if (levels[nodeId.level + 1][i].parent === nodeId.index) {
					nodes.push({ level: nodeId.level + 1, index: levels[nodeId.level + 1][i].index });
				}
			}
		}
	}

	/**
	 * @param {number} level
	 */
	function updateLevel(level) {
		for (let j = level; j < levels.length; j++) {
			for (let i = 0; i < levels[j].length; i++) {
				let item = levels[j][i];

				let parent =
					j === 0 ? { x: width / 2, y: -vGap / 2, height: vGap } : levels[j - 1][item.parent];

				item.x = (i + 1) * (width / (levels[j].length + 1));
				item.y = vGap + parent.y + blockSize / 2;
				const pos = {
					x: item.x,
					y: item.y - blockSize / 2 - 4
				};
				const parentPos = {
					x: parent.x,
					y: parent.y + blockSize / 2
				};
				item.index = i;
				item.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + vGapPoint}, ${pos.x} ${pos.y - vGapPoint}, ${pos.x} ${pos.y}`;
			}
		}
		levels = levels;
	}

	/**
	 * @param {number} level
	 */
	function updateFloatingLevel(level) {
		for (let j = level; j < levels.length; j++) {
			for (let i = 0; i < levels[j].length; i++) {
				let item = levels[j][i];
				item.x = (i + 1) * (width / (levels[j].length + 1));
				if (item.parent === -1 || item.parentPos === undefined) continue;
				let parent = levels[levels.length - (item.parentPos ?? 0) - 1][item.parent];

				const pos = {
					x: item.x,
					y: item.y - blockSize / 2 - 4
				};
				const parentPos = {
					x: parent.x,
					y: parent.y + blockSize / 2
				};
				item.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + vGapPoint}, ${pos.x} ${pos.y - vGapPoint}, ${pos.x} ${pos.y}`;
			}
		}
		levels = levels;
	}

	/**
	 * @param {{level: number, index: number, y: number, x: number}} parent
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} id
	 */
	async function addToSvg(parent, data, newItemIndex, id) {
		return new Promise(async (resolve, reject) => {
			try {
				if (
					parent.level === -1 &&
					levels[parent.level + 1].length === 1 &&
					levels[parent.level + 1][0].index === id
				) {
					return resolve(null);
				}

				addSpaceForNewNode(parent.level + 1, newItemIndex);
				updateLevel(parent.level + 2);

				levels[parent.level + 1].splice(newItemIndex, 0, {
					data: data,
					done: false,
					level: parent.level + 1,
					index: newItemIndex,
					parent: parent.index,
					opacity: 0,
					x: (newItemIndex + 1) * (width / (levels[parent.level + 1].length + 2)),
					y: vGap + parent.y + blockSize / 2,
					width: 0,
					d: '',
					dashOffset: 100
				});

				levels = levels;
				await wait(0);

				let newNode = levels[parent.level + 1][newItemIndex];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text-${newNode.level}-${newNode.index}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				blockSize = bbox.height;

				const pos = {
					y: newNode.y - blockSize / 2 - 4,
					x: newNode.x
				};

				const parentPos = {
					x: parent.x,
					y: parent.y + blockSize / 2
				};
				newNode.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + vGapPoint}, ${pos.x} ${pos.y - vGapPoint}, ${pos.x} ${pos.y}`;

				newNode.dashOffset = 0;
				levels = levels;
				height = svg.getBBox().height + 100;
				await wait(500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} id
	 */
	async function addFloatingToSvg(data, newItemIndex, id) {
		return new Promise(async (resolve, reject) => {
			try {
				const lastLevel = levels.length - 1;
				addSpaceForNewNode(lastLevel, levels[lastLevel].length);
				updateFloatingLevel(lastLevel + 1);
				levels[lastLevel].splice(newItemIndex, 0, {
					data: data,
					done: false,
					level: 0,
					index: newItemIndex,
					parent: -1,
					opacity: 0,
					x: (newItemIndex + 1) * (width / (levels[levels.length - 1].length + 2)),
					y: vGap + vGap * lastLevel + (blockSize / 2) * lastLevel,
					width: 0,
					d: '',
					dashOffset: 100
				});
				levels = levels;
				await wait(100);
				let newNode = levels[lastLevel][newItemIndex];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text-${newNode.level}-${newNode.index}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				levels = levels;
				blockSize = bbox.height;
				height = svg.getBBox().height + 100;
				await wait(500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}
	/**
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} id
	 */
	async function addParentToSvg(data, newItemIndex, id) {
		return new Promise(async (resolve, reject) => {
			try {
				addSpaceForNewNode(0, levels[0].length);
				updateFloatingLevel(1);
				levels[0].splice(newItemIndex, 0, {
					data: data,
					done: false,
					level: levels.length - 1,
					index: newItemIndex,
					parent: -1,
					opacity: 0,
					x: (newItemIndex + 1) * (width / (levels[0].length + 2)),
					y: vGap,
					width: 0,
					d: '',
					dashOffset: 100
				});
				levels = levels;
				await wait(100);
				let newNode = levels[0][newItemIndex];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text-${newNode.level}-${newNode.index}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				levels = levels;
				height = svg.getBBox().height + 100;
				await wait(500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} parent
	 * @param {string[]} children
	 */
	async function addParent(parent, children) {
		return new Promise(async (resolve) => {
			let childrenIndex = [];
			let addLevel = false;
			for (let child of children) {
				let found = false;
				for (let i = levels.length - 1; i > -1; i--) {
					for (let j = levels[i].length - 1; j > -1; j--) {
						if (levels[i][j].data !== child || levels[i][j].done) continue;
						levels[i][j].done = true;
						if (i === 0) {
							addLevel = true;
						}
						childrenIndex.push({ level: i, pos: j });
						found = true;
						break;
					}
					if (found) break;
				}
			}
			if (addLevel) {
				levels.unshift([]);
				for (let j = 0; j < levels.length; j++) {
					for (let i = 0; i < levels[j].length; i++) {
						levels[j][i].y = vGap + vGap * j + (blockSize / 2) * j;
					}
				}
			}

			await addParentToSvg(parent, levels[0].length, levels[0].length);

			for (let index of childrenIndex) {
				let node = levels[index.level + (addLevel ? 1 : 0)][index.pos];
				let parent = levels[0][levels[0].length - 1];
				const pos = {
					y: node.y - blockSize / 2 - 4,
					x: node.x
				};

				const parentPos = {
					x: parent.x,
					y: parent.y + blockSize / 2
				};
				node.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + vGapPoint}, ${pos.x} ${pos.y - vGapPoint}, ${pos.x} ${pos.y}`;
				await wait(0);
				node.dashOffset = 0;
				node.parent = levels[0].length - 1;
				node.parentPos = levels.length - 1;
			}
			levels = levels;
			await wait(500);
			resolve(null);
		});
	}

	async function updateSize() {
		return new Promise(async (resolve, reject) => {
			try {
				boxWidth = /**@type {number}*/ (parentElement?.clientWidth);
				width = boxWidth;

				updating = true;

				if (floating) {
					updateFloatingLevel(0);
				} else {
					updateLevel(0);
				}
				await wait(10);
				updating = false;
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {number} level
	 * @param {number} newNodeIndex
	 */
	function addSpaceForNewNode(level, newNodeIndex) {
		for (let i = 0; i < levels[level].length; i++) {
			let item = levels[level][i];
			item.index = i < newNodeIndex ? i : i + 1;
			item.x = (item.index + 1) * (width / (levels[level].length + 2));
			if (item.parent === -1) continue;
			let parentLevel =
				item.parentPos === undefined ? level - 1 : levels.length - item.parentPos - 1;
			let parent = levels[parentLevel][item.parent];

			const pos = {
				x: item.x,
				y: item.y - blockSize / 2 - 4
			};
			const parentPos = {
				x: parent.x,
				y: parent.y + blockSize / 2
			};
			item.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + vGapPoint}, ${pos.x} ${pos.y - vGapPoint}, ${pos.x} ${pos.y}`;
		}

		levels = levels;
	}
	/**
	 * @param {string[]} data
	 */
	export async function addFloatingNode(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let levelIndex = levels[levels.length - 1].length;

				for (let i = 0; i < data.length; i++) {
					await addFloatingToSvg(data[i], levelIndex + i, levelIndex + i);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}
	/**
	 * @param {string[]} data
	 * @param {string} parentData
	 */
	export async function addToTree(data, parentData) {
		return new Promise(async (resolve, reject) => {
			try {
				const parent = /**@type {import('@/types').node}*/ (findNode(parentData));
				if (parent === undefined) return resolve(null);

				parent.done = true;
				if (levels.length <= parent.level + 1) levels.push([]);
				let levelIndex = levels[parent.level + 1].findIndex((x) => x.parent === parent.index + 1);

				levelIndex = levelIndex === -1 ? levels[parent.level + 1].length : levelIndex;

				for (let i = 0; i < data.length; i++) {
					await addToSvg(parent, data[i], levelIndex + i, i);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	onMount(async () => {
		new ResizeObserver(updateSize).observe(
			/**@type {Element}*/ (document.querySelector('.svg-box'))
		);

		await setSvg(/**@type {SVGGElement}*/ (document.querySelector('#parse-svg')));
	});

	/**
	 * @param {SVGGElement} comp
	 */
	async function setSvg(comp) {
		return new Promise(async (resolve, reject) => {
			try {
				svg = comp;
				parentElement = /**@type {Element}*/ (document.querySelector('.svg-box'));
				boxWidth = /**@type {number}*/ (parentElement?.clientWidth);
				width = boxWidth;

				await wait(500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export async function initializeTree(/**@type {string}*/ symbol) {
		await addToSvg(
			{
				level: -1,
				index: 0,
				x: width / 2,
				y: -vGap / 2
			},
			symbol,
			0,
			0
		);
	}

	export function resetTree() {
		levels = [[]];
	}

	setTreeFunctions({ initializeTree, addFloatingNode, addToTree, addParent, resetTree });
</script>

<div class="svg-box" style={$$props.style}>
	<svg {height} {width}>
		<g id="parse-svg">
			{#each levels as level, id (levels.length - id - 1)}
				{#each level as item (`${item.level}-${item.index}-${floating ? '' : item.parent}`)}
					<path
						d={item.d}
						stroke="white"
						stroke-width="4"
						fill="none"
						stroke-dasharray="100"
						stroke-dashoffset={item.dashOffset}
						pathLength="100"
						style="filter: drop-shadow(0 0 2px hsl(0,0%,0%,40%));{updating
							? 'transition: none'
							: ''}"
					></path>{/each}
			{/each}
			{#each levels as level, id (levels.length - id - 1)}
				{#each level as item (`${item.level}-${item.index}-${floating ? '' : item.parent}`)}
					<rect
						id={`${item.level}-${item.index}-${item.parent}`}
						width={item.width + 12}
						height={blockSize + 4}
						fill="hsl(20, 60%, 60%)"
						stroke="hsl(0,0%,80%,0%)"
						rx="8"
						style="transform: translate({item.x - item.width / 2 - 6}px, {item.y -
							blockSize / 2 -
							4}px); opacity: {item.opacity};{updating ? 'transition: none' : ''}"
					></rect>
					<text
						id="parse-text-{item.level}-{item.index}"
						class="par-{item.parent}"
						fill="hsl(0,0%,100%)"
						dominant-baseline="middle"
						text-anchor="middle"
						style="opacity: {item.opacity};transform: translate({item.x}px, {item.y}px);{updating
							? 'transition: none'
							: ''}"
					>
						{item.data}
					</text>
				{/each}
			{/each}
		</g>
	</svg>
</div>

<style>
	svg {
		overflow: visible;
	}

	svg rect,
	svg path,
	svg text {
		transform-box: fill-box;
		transition: all 0.5s;
	}

	svg rect {
		filter: drop-shadow(0 0 3px hsl(20, 60%, 60%, 70%));
	}
	.svg-box {
		overflow: auto;
		height: inherit;
		border: 1px solid hsl(0, 0%, 80%);
		border-radius: 10px;
		/* box-shadow: 0 0 5px hsl(0, 0%, 0%, 20%); */
	}
</style>
