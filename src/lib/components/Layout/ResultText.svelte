<script>
	import Popup from './Popup.svelte';

	/** @type {{onClose: any}} */
	let { onClose } = $props();
</script>

<Popup id="result-text" {onClose}>
	{#snippet children(/**@type {{ style:string, contentClass:string }}*/ params)}
		<div class="result-text-content {params.contentClass}" style={params.style}>Text</div>
	{/snippet}
</Popup>

<style>
	:global(#result-text) {
		background: hsl(200, 60%, 100%);
		border: 1px solid hsl(200, 60%, 50%);
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
	}
</style>
