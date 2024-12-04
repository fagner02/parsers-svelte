<script>
	import Popup from './Popup.svelte';
	import { component } from '$lib/infoText';
	export let onClose;
</script>

<Popup let:style let:contentClass id="info" {onClose}>
	<div id="info-content" class={contentClass} style={`padding: 0px 10px;${style}`}>
		<svelte:component this={component}></svelte:component>
	</div>
</Popup>

<style>
	:global(#info) {
		background: hsl(200, 60%, 100%);
		box-shadow: 0px 0px 10px 0px hsl(0, 0%, 0%, 20%);
	}
	:global(td, th) {
		border: 1px solid black;
	}
</style>
