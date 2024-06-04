<script>
	import { wait } from '$lib/flowControl';
	import { onMount } from 'svelte';

	/** @type {SVGGElement} */
	let svg;
	/** @type {Element} */
	let parentElement;
	let width = 0;
	let height = 0;
	let boxWidth = 0;
	let updating = false;
	const vGap = 30;
	const vGapPoint = vGap / 1.9;

	/**@type {import('@/types').node[][]}*/
	let levels = [[]];

	/**
	 * @param {string} data
	 */
	async function findNode(data) {
		/**@type {import('@/types').nodeId[]}*/
		let nodes = [{ level: 0, index: 0 }];

		while (nodes.length > 0) {
			const nodeId = /**@type {import('@/types').nodeId}*/ (nodes.pop());
			const node = levels[nodeId.level][nodeId.index];
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
	 * @param {number | null} newItemIndex
	 */
	async function updateLevel(level, newItemIndex = null) {
		for (let i = 0; i < levels[level].length; i++) {
			let item = levels[level][i];

			let parent =
				level === 0 ? { x: width / 2, y: -vGap / 2, height: vGap } : levels[level - 1][item.parent];

			const newIndex = newItemIndex === null ? i : i < newItemIndex ? i : i + 1;

			item.x = (newIndex + 1) * (width / (levels[level].length + (newItemIndex ? 2 : 1)));
			item.y = vGap + parent.y + parent.height / 2;
			const pos = {
				x: item.x,
				y: item.y - item.height / 2 - 4
			};
			const parentPos = {
				x: parent.x,
				y: parent.y + parent.height / 2
			};
			item.index = newIndex;
			item.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + vGapPoint}, ${pos.x} ${pos.y - vGapPoint}, ${pos.x} ${pos.y}`;
		}
		levels = levels;
	}

	/**
	 * @param {{level: number, index: number, height: number, y: number, x: number}} parent
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} id
	 */
	async function addToSvg(parent, data, newItemIndex, id) {
		await updateLevel(parent.level + 1, newItemIndex);

		levels[parent.level + 1].splice(newItemIndex, 0, {
			data: data,
			done: false,
			level: parent.level + 1,
			index: newItemIndex,
			parent: parent.index,
			id: id,
			opacity: 0,
			x: (newItemIndex + 1) * (width / (levels[parent.level + 1].length + 2)),
			y: vGap + parent.y + parent.height / 2,
			width: 0,
			height: 0,
			d: '',
			dashOffset: 100,
			pos: -10
		});
		levels = levels;
		await wait(100);

		let newNode = levels[parent.level + 1][newItemIndex];
		let bbox = /**@type {SVGTextElement}*/ (
			document.querySelector(`#parse-text-${newNode.level}-${newNode.index}`)
		)?.getBBox();
		if (!bbox) return;
		newNode.opacity = 1;
		newNode.width = bbox.width;
		newNode.height = bbox.height;
		newNode.pos = 0;

		const pos = {
			y: newNode.y - newNode.height / 2 - 4,
			x: newNode.x
		};

		const parentPos = {
			x: parent.x,
			y: parent.y + parent.height / 2
		};

		newNode.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + vGapPoint}, ${pos.x} ${pos.y - vGapPoint}, ${pos.x} ${pos.y}`;

		newNode.dashOffset = 0;
		levels = levels;
		height = svg.getBBox().height + 100;
		await wait(500);
	}

	async function updateSize() {
		boxWidth = /**@type {number}*/ (parentElement?.clientWidth);
		width = boxWidth;

		updating = true;

		for (let i = 0; i < levels.length; i++) {
			updateLevel(i);
		}
		await wait(10);
		updating = false;
	}

	/**
	 * @param {string[]} data
	 * @param {string} parentData
	 */
	export async function addToTree(data, parentData) {
		const parent = /**@type {import('@/types').node}*/ (await findNode(parentData));
		if (parent === undefined) return;

		parent.done = true;
		if (levels.length <= parent.level + 1) levels.push([]);
		let levelIndex = levels[parent.level + 1].findIndex((x) => x.parent === parent.index + 1);

		levelIndex = levelIndex === -1 ? levels[parent.level + 1].length : levelIndex;

		for (let i = 0; i < data.length; i++) {
			await addToSvg(parent, data[i], levelIndex + i, i);
		}
	}

	onMount(async () => {
		new ResizeObserver(updateSize).observe(
			/**@type {Element}*/ (document.querySelector('.svg-box'))
		);
		try {
			await setSvg(/**@type {SVGGElement}*/ (document.querySelector('#parse-svg')));
		} catch {}
	});

	/**
	 * @param {SVGGElement} comp
	 */
	async function setSvg(comp) {
		svg = comp;
		parentElement = /**@type {Element}*/ (document.querySelector('.svg-box'));
		boxWidth = /**@type {number}*/ (parentElement?.clientWidth);
		width = boxWidth;

		await addToSvg(
			{
				level: -1,
				index: 0,
				x: width / 2,
				y: -vGap / 2,
				height: vGap
			},
			'S',
			0,
			0
		);

		await wait(500);

		await addToTree(['haa', 'ç', 'hii'], 'S');
		await addToTree(['h', 'k'], 'haa');
		await addToTree(['o', 'p'], 'hii');
		await addToTree(['o', 'p'], 'ç');

		height = svg.getBBox().height + 100;
	}
</script>

<div class="svg-box" style={$$props.style}>
	<svg {height} {width}>
		<g id="parse-svg">
			{#each levels as level}
				{#each level as item (`${item.level}-${item.id}-${item.parent}`)}
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
			{#each levels as level}
				{#each level as item (`${item.level}-${item.id}-${item.parent}`)}
					<rect
						width={item.width + 12}
						height={item.height + 4}
						fill="hsl(20, 60%, 60%)"
						stroke="hsl(0,0%,80%,0%)"
						rx="8"
						style="transform: translate({item.x - item.width / 2 - 6}px, {item.y -
							item.height / 2 -
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
