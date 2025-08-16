<script>
	import { stackFloatingWindows } from '@/Layout/interactiveElem';
	import SvgLines from '@/Structures/SvgLines.svelte';

	let { id, svgLines = $bindable(), cards, floats } = $props();
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="algo unit grid">
	<div class="cards-box unit" id="card-box{id}">
		{@render cards()}
	</div>
	<div
		use:stackFloatingWindows={id}
		class="unit"
		style="pointer-events:none;padding: 5px; padding-bottom: 10px;flex: 1; "
	>
		{@render floats()}
	</div>
</div>

<style>
	.algo {
		overflow: auto;
		padding: 0 5px;
		flex-direction: column;
		align-items: stretch;
	}
</style>
