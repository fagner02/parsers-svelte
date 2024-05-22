<script>
	import Popup from './Popup.svelte';
</script>

<Popup let:style let:contentClass id="result-text">
	<div class={contentClass} {style}>Text</div>
</Popup>

<style>
	:global(#result-text) {
		background: hsl(200, 60%, 90%);
		border: 1px solid hsl(200, 60%, 50%);
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
	}
</style>
