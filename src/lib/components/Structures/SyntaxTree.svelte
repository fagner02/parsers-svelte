<script>
	import { setTree } from '$lib/treeFunctions';
	import { onMount } from 'svelte';
	import { SyntaxTreeClass } from '@/Structures/SyntaxTreeClass.svelte';

	/**@type {{id: string, style?: string, floating?: boolean}}*/
	let { floating = false, style = '', ...props } = $props();
	let tree = new SyntaxTreeClass();
	setTree(tree);
	tree.id = props.id;
	tree.floating = floating;

	onMount(async () => {
		new ResizeObserver(tree.updateSize).observe(
			/**@type {Element}*/ (document.querySelector(`#svg-box${props.id}`))
		);

		await tree.setSvg(/**@type {SVGGElement}*/ (document.querySelector(`#parse-svg${props.id}`)));
	});
</script>

<div class="svg-box" id="svg-box{props.id}" {style}>
	<svg height={tree.height} width={tree.width}>
		<g id="parse-svg{props.id}">
			{#each tree.levels as level, index (tree.levels.length - index - 1)}
				{#each level as item (item.id)}
					<path
						d={item.d}
						stroke="white"
						stroke-width="4"
						fill="none"
						stroke-dasharray="100"
						stroke-dashoffset={item.dashOffset}
						pathLength="100"
						style="filter: drop-shadow(0 0 2px hsl(0,0%,0%,40%));{tree.updating
							? 'transition: none'
							: ''}"
					></path>{/each}
			{/each}
			{#each tree.levels as level, index (tree.levels.length - index - 1)}
				{#each level as item (item.id)}
					<rect
						id="parse-rect{props.id}-{item.id}"
						width={item.width + 12}
						height={tree.blockSize + 4}
						fill="hsl(20, 60%, 60%)"
						stroke="hsl(0,0%,80%,0%)"
						rx="8"
						style="transform: translate({item.x - item.width / 2 - 6}px, {item.y -
							tree.blockSize / 2 -
							4}px); opacity: {item.opacity};{tree.updating ? 'transition: none' : ''}"
					></rect>
					<text
						id="parse-text{props.id}-{item.id}"
						class="par-{item.parentIndex}"
						fill="hsl(0,0%,100%)"
						dominant-baseline="middle"
						text-anchor="middle"
						style="opacity: {item.opacity};transform: translate({item.x}px, {item.y}px);{tree.updating
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
