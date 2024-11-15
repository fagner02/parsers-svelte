<script>
	import Popup from './Popup.svelte';

	export let onClose;
</script>

<Popup let:style let:contentClass id="info" {onClose}>
	<div class={contentClass} {style}>Text</div>
</Popup>

<style>
	:global(#info) {
		background: hsl(200, 60%, 100%);
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
	}
</style>
