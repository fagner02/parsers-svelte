<script>
	import { onMount } from 'svelte';
	import { getTextWidth } from '$lib/utils';

	/**@type {number}*/
	let height;
	function updateSize() {
		lines = Math.ceil(
			/**@type {HTMLElement}*/ (document.querySelector('textarea')).scrollHeight / lineHeight
		);
		numGap = lines.toString().length * charWidth + 15;
		height = /**@type {HTMLElement}*/ (document.querySelector('textarea')).offsetHeight - 5;
	}

	/**
	 * @param {Event} e
	 */
	function onScroll(e) {
		/**@type {Element}*/ (document.querySelector('.textnumbers')).scrollTop = /**@type {Element}*/ (
			e.target
		).scrollTop;
		updateSize();
	}

	let charWidth = 0;
	export let numGap = 0;
	export const fontSize = 15;
	export const lineHeight = fontSize + 5;
	export let lines = 1;
	onMount(() => {
		charWidth = getTextWidth('0', fontSize);
		updateSize();
		new ResizeObserver(updateSize).observe(
			/**@type {HTMLElement}*/ (document.querySelector('textarea'))
		);
	});
</script>

<div class="grid input {$$props.class}">
	<textarea
		on:scroll={onScroll}
		class="unit"
		style="font-size: {fontSize}px; padding-left: {numGap + 5}px; line-height: {lineHeight}px;"
	></textarea>
	<div class="unit textnumbers" style="width: {numGap}px;height: {height}px">
		{#each { length: lines } as _, i}
			<div class="grid">
				<p style="font-size:{12}px;height: {lineHeight}px">{i + 1}.</p>
			</div>
		{/each}
	</div>
</div>

<style>
	textarea {
		width: -webkit-fill-available;
		border-radius: 10px;
		outline: hsl(0, 0%, 50%) solid 2px;
		border: none;
		resize: vertical;
		padding: 5px 10px 5px;
		overflow: auto;
		transition: padding 0.3s;
		height: 95px;
	}

	textarea:focus-within {
		outline: hsl(200, 80%, 60%) solid 2px;
	}

	.input {
		overflow: hidden;
		padding: 20px;
	}

	.textnumbers {
		display: grid;
		padding-top: 5px;
		position: relative;
		overflow: hidden;
		letter-spacing: 0px;
		background: hsl(0, 0%, 90%);
		border-radius: 10px 0px 0px 10px;
		transition: width 0.3s;
	}

	.textnumbers > .grid > p {
		grid-area: unit;
		display: grid;
		place-content: end end;
		position: relative;
		top: -1px;
	}
</style>
