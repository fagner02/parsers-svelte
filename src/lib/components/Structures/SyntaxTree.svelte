<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script>
	import { noJumpWait, wait } from '$lib/flowControl';
	import { setTreeFunctions } from '$lib/treeFunctions';
	import { onMount } from 'svelte';

	/** @type {SVGGElement} */
	let svg;
	/** @type {Element} */
	let parentElement;
	let width = $state(0);
	let height = $state(0);
	let boxWidth = 0;
	let count = 0;
	let updating = $state(false);
	let blockSize = $state(30);
	/**@type {import('@/types').nodeId[]} */
	let treeTop = [];

	/**@type {{id: string, style?: string, floating?: boolean}}*/
	let { floating = false, style = '', ...props } = $props();

	const vGap = 30;
	const vGapPoint = vGap / 1.9;

	/**@type {import('@/types').node[][]}*/
	let levels = $state([[]]);

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
				if (levels[nodeId.level + 1][i].parentIndex === nodeId.index) {
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
					j === 0 ? { x: width / 2, y: -vGap / 2, height: vGap } : levels[j - 1][item.parentIndex];

				item.x = (i + 1) * (width / (levels[j].length + 1));
				item.y = vGap + parent.y + blockSize / 2;
				item.index = i;
				setDPath(item, parent);
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

				if (item.parentIndex === -1) continue;
				let parent = levels[item.parentLevel][item.parentIndex];
				setDPath(item, parent);
			}
		}
		levels = levels;
	}

	/**
	 * @param {{level: number, index: number, y: number, x: number}} parent
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} nodeId
	 * @param {boolean} shouldWait
	 */
	async function addToSvg(parent, data, newItemIndex, nodeId, shouldWait) {
		return new Promise(async (resolve, reject) => {
			try {
				if (
					parent.level === -1 &&
					levels[parent.level + 1].length === 1 &&
					levels[parent.level + 1][0].index === nodeId
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
					parentIndex: parent.index,
					parentLevel: -1,
					opacity: 0,
					x: (newItemIndex + 1) * (width / (levels[parent.level + 1].length + 2)),
					y: vGap + parent.y + blockSize / 2,
					width: 0,
					d: '',
					dashOffset: 100,
					id: count++
				});

				levels = levels;
				await noJumpWait(0);

				let newNode = levels[parent.level + 1][newItemIndex];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text${props.id}-${newNode.id}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				blockSize = bbox.height;

				setDPath(newNode, parent);

				newNode.dashOffset = 0;
				levels = levels;
				height = svg.getBBox().height + 100;
				if (shouldWait) await wait(props.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} data
	 */
	async function addFloatingToSvg(data) {
		return new Promise(async (resolve, reject) => {
			try {
				const lastLevel = levels.length - 1;
				const index = levels[lastLevel].length;

				addSpaceForNewNode(lastLevel, index);

				levels[lastLevel].splice(index, 0, {
					data: data,
					done: false,
					level: lastLevel,
					index: index,
					parentIndex: -1,
					parentLevel: -1,
					opacity: 0,
					x: (index + 1) * (width / (levels[lastLevel].length + 2)),
					y: vGap + vGap * lastLevel + (blockSize / 2) * lastLevel,
					width: 0,
					d: '',
					dashOffset: 100,
					id: count++
				});
				treeTop.push({
					level: lastLevel,
					index: index
				});
				levels = levels;
				await wait(props.id, 100);
				let newNode = levels[lastLevel][index];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text${props.id}-${newNode.id}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				levels = levels;
				blockSize = bbox.height;
				height = svg.getBBox().height + 100;
				await wait(props.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} level
	 */
	async function addParentToSvg(data, newItemIndex, level) {
		return new Promise(async (resolve, reject) => {
			try {
				addSpaceForNewNode(level, newItemIndex);
				updateFloatingLevel(level + 1);

				levels[level].splice(newItemIndex, 0, {
					data: data,
					done: false,
					level: level,
					index: newItemIndex,
					parentIndex: -1,
					parentLevel: -1,
					opacity: 0,
					x: (newItemIndex + 1) * (width / (levels[level].length + 2)),
					y: vGap + vGap * level + (blockSize / 2) * level,
					width: 0,
					d: '',
					dashOffset: 100,
					id: count++
				});
				levels = levels;
				await wait(props.id, 100);
				let newNode = levels[level][newItemIndex];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text${props.id}-${newNode.id}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				levels = levels;
				height = svg.getBBox().height + 100;
				await wait(props.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {number} level
	 * @param {number} index
	 */
	function getLeftmost(level, index) {
		let leftmostLoc = levels[level][index];

		for (let i = leftmostLoc.level + 1; i < levels.length; i++) {
			for (let j = 0; j < levels[i].length; j++) {
				if (
					levels[i][j].parentIndex === leftmostLoc.index &&
					levels[i][j].parentLevel === leftmostLoc.level
				) {
					leftmostLoc = levels[i][j];
					break;
				}
			}
		}
		return leftmostLoc;
	}

	/**
	 * @param {import('@/types').node} item
	 * @param {{ x: number; y: number; }} parent
	 */
	function setDPath(item, parent) {
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

	/**
	 * @param {string} parentData
	 * @param {string[]} children
	 */
	async function addParent(parentData, children) {
		return new Promise(async (resolve) => {
			let matchLoc = -1;
			for (let j = 0; j < treeTop.length; j++) {
				let match = true;
				for (let i = 0; i < children.length; i++) {
					if (j + i >= treeTop.length) {
						match = false;
						break;
					}
					const symbol = levels[treeTop[j + i].level][treeTop[j + i].index].data;
					if (symbol !== children[i]) {
						match = false;
						break;
					}
				}
				if (match) {
					matchLoc = j;
					break;
				}
			}

			let highestLevel = treeTop[matchLoc].level;
			for (let i = matchLoc + 1; i < matchLoc + children.length; i++) {
				if (treeTop[i].level < highestLevel) highestLevel = treeTop[i].level;
			}

			if (highestLevel - 1 < 0) {
				highestLevel = 1;
				levels.unshift([]);
				for (let i = 0; i < treeTop.length; i++) {
					treeTop[i].level = treeTop[i].level + 1;
				}
				for (let j = 0; j < levels.length; j++) {
					for (let i = 0; i < levels[j].length; i++) {
						let node = levels[j][i];
						node.level = j;
						if (node?.parentLevel !== -1) {
							node.parentLevel += 1;
						}
						node.y = vGap + vGap * j + (blockSize / 2) * j;
						if (node.parentIndex === -1) continue;

						setDPath(node, levels[node.parentLevel][node.parentIndex]);
					}
				}
			}

			levels = levels;
			await wait(props.id, 500);

			let parentLevel = highestLevel - 1;
			let matchLeftmost = getLeftmost(treeTop[matchLoc].level, treeTop[matchLoc].index);
			let neighborIndex = 0;
			if (levels[parentLevel].length > 0) {
				let neighborLeftmost = getLeftmost(parentLevel, neighborIndex);
				while (neighborLeftmost.index < matchLeftmost.index) {
					neighborIndex++;
					if (neighborIndex >= levels[parentLevel].length) break;
					neighborLeftmost = getLeftmost(parentLevel, neighborIndex);
				}
			}
			let parentIndex = neighborIndex;

			await addParentToSvg(parentData, parentIndex, parentLevel);

			for (let i = matchLoc; i < matchLoc + children.length; i++) {
				let loc = treeTop[i];
				let node = levels[loc.level][loc.index];
				setDPath(node, levels[parentLevel][parentIndex]);

				node.parentIndex = parentIndex;
				node.parentLevel = parentLevel;
			}
			levels = levels;
			await wait(props.id, 500);
			for (let i = matchLoc; i < matchLoc + children.length; i++) {
				let loc = treeTop[i];
				let node = levels[loc.level][loc.index];
				node.dashOffset = 0;
			}
			levels = levels;
			treeTop.splice(matchLoc, children.length, {
				level: parentLevel,
				index: parentIndex
			});
			await wait(props.id, 500);
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
				await wait(props.id, 10);
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
			if (item.parentIndex === -1) continue;
			let parentLevel = item.parentLevel === -1 ? level - 1 : levels.length - item.parentLevel - 1;
			let parent = levels[floating ? item.parentLevel : parentLevel][item.parentIndex];
			setDPath(item, parent);
		}
		level++;
		if (floating && level < levels.length) {
			for (let i = 0; i < levels[level].length; i++) {
				let item = levels[level][i];
				if (item.parentIndex === -1) continue;
				setDPath(item, levels[item.parentLevel][item.parentIndex]);
			}
		}

		levels = levels;
	}
	/**
	 * @param {string[]} data
	 */
	export async function addFloatingNode(data) {
		return new Promise(async (resolve, reject) => {
			try {
				for (let i = 0; i < data.length; i++) {
					await addFloatingToSvg(data[i]);
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
	 * @param {boolean} shouldWait
	 */
	export async function addToTree(data, parentData, shouldWait) {
		return new Promise(async (resolve, reject) => {
			try {
				const parent = /**@type {import('@/types').node}*/ (findNode(parentData));
				if (parent === undefined) return resolve(null);

				parent.done = true;
				if (levels.length <= parent.level + 1) levels.push([]);
				let levelIndex = levels[parent.level + 1].findIndex(
					(x) => x.parentIndex === parent.index + 1
				);

				levelIndex = levelIndex === -1 ? levels[parent.level + 1].length : levelIndex;

				for (let i = 0; i < data.length; i++) {
					await addToSvg(parent, data[i], levelIndex + i, i, shouldWait);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**@param {{data: string[], parentData: string}[]} levels
	 * @param {string} startingSymbol
	 */
	async function loadSyntaxTree(levels, startingSymbol) {
		return new Promise(async (resolve, reject) => {
			try {
				initializeTree(startingSymbol, false);
				for (let i of levels) {
					await addToTree(i.data, i.parentData, false);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	onMount(async () => {
		new ResizeObserver(updateSize).observe(
			/**@type {Element}*/ (document.querySelector(`#svg-box${props.id}`))
		);

		await setSvg(/**@type {SVGGElement}*/ (document.querySelector(`#parse-svg${props.id}`)));
	});

	/**
	 * @param {SVGGElement} comp
	 */
	async function setSvg(comp) {
		return new Promise(async (resolve, reject) => {
			try {
				svg = comp;
				parentElement = /**@type {Element}*/ (document.querySelector(`#svg-box${props.id}`));
				boxWidth = /**@type {number}*/ (parentElement?.clientWidth);
				width = boxWidth;

				await wait(props.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export async function initializeTree(
		/**@type {string}*/ symbol,
		/**@type {boolean}*/ shouldWait = true
	) {
		await addToSvg(
			{
				level: -1,
				index: 0,
				x: width / 2,
				y: -vGap / 2
			},
			symbol,
			0,
			0,
			shouldWait
		);
	}

	export function resetTree() {
		levels = [[]];
		count = 0;
		treeTop = [];
	}

	setTreeFunctions({
		initializeTree,
		addFloatingNode,
		addToTree,
		addParent,
		resetTree,
		loadSyntaxTree
	});
</script>

<div class="svg-box" id="svg-box{props.id}" {style}>
	<svg {height} {width}>
		<g id="parse-svg{props.id}">
			{#each levels as level, index (levels.length - index - 1)}
				{#each level as item (item.id)}
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
			{#each levels as level, index (levels.length - index - 1)}
				{#each level as item (item.id)}
					<rect
						id="parse-rect{props.id}-{item.id}"
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
						id="parse-text{props.id}-{item.id}"
						class="par-{item.parentIndex}"
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
