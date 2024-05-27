<script>
	import Popup from './Popup.svelte';

	export let onClose;
</script>

<Popup let:style let:contentClass id="result-text" {onClose}>
	<div class={contentClass} {style}>Text</div>
</Popup>

<style>
	:global(#result-text) {
		background: hsl(200, 60%, 100%);
		/* border: 1px solid hsl(200, 60%, 50%); */
		border: none;
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
	}
</style>
