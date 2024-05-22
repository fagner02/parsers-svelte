<script>
	import { onMount } from 'svelte';
	import { getTextWidth } from '$lib/utils';

	/**@type {number}*/
	let height;
	/** @type {HTMLElement} */
	let input;
	/** @type {HTMLElement} */
	let text;

	function updateSize() {
		lines = Math.max(text.childElementCount + 1, Math.ceil(input.clientHeight / lineHeight));
		height = input.scrollHeight;
		numGap = lines.toString().length * charWidth + 15;
	}

	let charWidth = 0;
	export let numGap = 0;
	export const fontSize = 15;
	export const lineHeight = fontSize + 5;
	export let lines = 1;
	onMount(() => {
		charWidth = getTextWidth('0', fontSize);
		updateSize();
	});

	/** @param {HTMLElement} comp */
	function setInput(comp) {
		input = comp;
		new ResizeObserver(updateSize).observe(input);
	}

	/** @param {HTMLElement} comp */
	function setText(comp) {
		text = comp;
		new MutationObserver(updateSize).observe(text, {
			childList: true
		});
	}
</script>

<div class="input {$$props.class}" use:setInput>
	<div class="unit textnumbers" style="width: {numGap}px;height: {height}px;">
		{#each { length: lines } as _, textInputIndex}
			<div class="grid">
				<p style="font-size:{12}px;height: {lineHeight}px">{textInputIndex + 1}.</p>
			</div>
		{/each}
	</div>
	<div
		use:setText
		contenteditable="true"
		class="text"
		style="font-size: {fontSize}px;line-height: {lineHeight}px;"
	></div>
</div>

<style>
	.text {
		resize: none;
		overflow: visible;
		width: 100%;
		outline: none;
		border: none;
	}

	.input:focus-within {
		outline: hsl(200, 80%, 60%) solid 2px;
	}

	.input {
		width: -webkit-fill-available;
		width: -moz-available;
		border-radius: 10px;
		outline: hsl(0, 0%, 50%) solid 2px;
		resize: vertical;
		overflow: auto;
		transition: padding 0.3s;
		height: 100px;
		display: flex;
		margin: 20px;
	}

	.textnumbers {
		display: grid;
		overflow: hidden;
		letter-spacing: 0px;
		background: hsl(0, 0%, 90%);
		border-radius: 10px 0px 0px 10px;
		transition: width 0.3s;
		place-content: start end;
	}

	.textnumbers > .grid > p {
		grid-area: unit;
		display: grid;
		place-content: end end;
		position: relative;
		top: -1px;
	}

	@supports (width: -moz-available) {
		.textnumbers {
			top: 1px;
		}
	}
</style>
