<script>
	// import hljs from 'highlight.js';
	// import 'highlight.js/styles/atom-one-light.min.css';
	import Popup from './Popup.svelte';
	/** @type {{code: any, onClose: any}} */
	let { code, onClose } = $props();
</script>

<Popup id="code" {onClose}>
	{#snippet children(/**@type {{style:string, contentClass: string}}*/ params)}
		<!-- <pre id="pre-code" class={params.contentClass} style={params.style}><code
				>{@html hljs
					.highlight(code, {
						language: 'javascript'
					})
					.value.replaceAll('\t', '    ')}</code
			></pre> -->
	{/snippet}
</Popup>

<style>
	:global(#code) {
		background: white;
		border: 1px solid hsl(200, 50%, 50%);
	}

	pre {
		overflow: hidden;
		overflow: auto;
		margin: 0px;
		transition: all 0.9s 0.2s;
		line-height: 15px;
	}

	:global(#pre-code > code, #pre-code > code span) {
		position: relative;
		animation: rotA 0.5s;
		font-family: monospace !important;
	}
</style>
