<script>
	import { wait } from '$lib/utils';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/atom-one-dark.min.css';
	import { onMount, onDestroy } from 'svelte';
	import FillHeightWrapper from './FillHeightWrapper.svelte';

	export let code;
	let maxWidth = 50;
	let opacity = 0;
	let pos = -50;

	onMount(async () => {
		await wait(250);
		const elem = /**@type {HTMLElement}*/ (document.querySelector('.popup'));

		maxWidth = /**@type {number}*/ (elem.scrollWidth) - 40;
		console.log(maxWidth);
		elem.scrollWidth;
		await wait(250);
		opacity = 1;
		pos = 0;
	});

	onDestroy(() => {
		maxWidth = 50;
	});
</script>

<div id="code" class="maxHeight" style="max-width: {maxWidth}px;place-self: center;">
	<pre class="fill" id="pre-code" style="opacity: {opacity}; translate: {pos}px 0px"><code
			>{#each code.split('\n') as line, index}<span
					>{@html hljs.highlight(line + '\n', {
						language: 'javascript'
					}).value}</span
				>{/each}</code
		></pre>
</div>

<style>
	:global(#code) {
		display: grid;
		place-content: left top;
		background: hsl(215, 20%, 20%);
		border: 1px solid hsl(200, 50%, 50%);
		color: #abb2bf;
		border-radius: 10px;
		transition: all 0.5s;
		padding: 10px;
		margin: 10px;
		overflow: hidden;
	}
	pre {
		overflow: hidden;
		overflow: auto;
		margin: 0px;
		transition: all 0.9s 0.2s;
	}

	:global(code > span, code > span > span) {
		position: relative;
		animation: rotA 0.5s;
		font-family: monospace !important;
	}

	pre::-webkit-scrollbar {
		background: hsl(215, 15%, 15%);
		margin: 10px;
	}
	::-webkit-scrollbar {
		width: 15px;
		height: 15px;
		border-radius: 10px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		border-radius: 10px;
	}
	::-webkit-scrollbar-corner {
		border-radius: 10px;
		background: transparent;
	}
	/* Handle */
	::-webkit-scrollbar-thumb {
		background: hsl(215, 15%, 25%);
		border-radius: 10px;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: hsl(215, 15%, 30%);
	}
</style>
