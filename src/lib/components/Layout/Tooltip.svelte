<script>
	import { fontSize } from '$lib/globalStyle';
	import { registerTooltipGroup } from './tooltip.svelte';

	let { groupId } = $props();

	registerTooltipGroup(groupId);
</script>

<div class="tooltip" id="tooltip-{groupId}" style="font-size: {fontSize}px">
	<span id="tooltip"></span>

	<svg class="arrow" width="54" height="48" viewBox="0 0 54 48" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M49.5 27.5C40.7959 35.5956 33.5 48 27 48C20.5 48 13.2041 35.5956 4.5 27.5C3.03317 26.1357 0.75 24 0.75 24H1C1 24 3.28317 21.8643 4.75 20.5C13.4541 12.4044 20.75 0 27.25 0C33.75 0 41.0459 12.4044 49.75 20.5C51.2168 21.8643 53.5 24 53.5 24H53.25C53.25 24 50.9668 26.1357 49.5 27.5Z"
		/>
	</svg>
</div>

<style>
	.tooltip {
		--hue: 200;
		z-index: 2;
		position: absolute;
		pointer-events: none;
		background: hsl(var(--hue), 50%, 50%);
		color: white;
		border-radius: 5px;
		padding: 2px 4px;
		opacity: 0;
		transition: all 0.2s;
		border: 2px solid hsl(var(--hue), 50%, 30%);
		max-width: 250px;
		display: flex;
	}
	.tooltip > span {
		text-align: center;
	}
	.arrow {
		width: 16px;
		height: 16px;
		position: absolute;
		top: 0px;
		left: 0px;
		clip-path: inset(0px 0px 8px 0px);
		stroke: hsl(var(--hue), 50%, 30%);
		stroke-width: 4px;
		fill: hsl(var(--hue), 50%, 50%);
	}
</style>
