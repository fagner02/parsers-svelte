<script>
	import Popup from './Popup.svelte';
	import { component } from '@/Info/infoText';
	/** @type {{onClose: any}} */
	let { onClose } = $props();
</script>

<Popup id="info" {onClose}>
	{#snippet children(/**@type {{ style:string, contentClass:string }}*/ params)}
		{@const SvelteComponent = component}
		<div id="info-content" class={params.contentClass} style={`padding: 0px 10px;${params.style}`}>
			<SvelteComponent></SvelteComponent>
		</div>
	{/snippet}
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
