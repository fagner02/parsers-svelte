<script>
	import hljs from 'highlight.js';
	import 'highlight.js/styles/atom-one-dark.min.css';
	import Popup from './Popup.svelte';
	export let code;
</script>

<Popup let:style let:contentClass id="code">
	<pre id="pre-code" class={contentClass} {style}><code
			>{@html hljs.highlight(code, {
				language: 'javascript'
			}).value}</code
		></pre>
</Popup>

<style>
	:global(#code) {
		background: linear-gradient(127deg, hsl(215, 30%, 10%), hsl(215, 30%, 15%));
		border: 1px solid hsl(200, 50%, 50%);
		color: #abb2bf;
	}

	pre {
		overflow: hidden;
		overflow: auto;
		margin: 0px;
		transition: all 0.9s 0.2s;
	}

	:global(code, code > span, code > span > span) {
		position: relative;
		animation: rotA 0.5s;
		font-family: monospace !important;
	}
</style>
