<script>
	import { onMount } from 'svelte';
	import { getTextWidth } from '$lib/utils';
	import ExpandIcon from '@icons/ExpandIcon.svelte';

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

<div class="grid input-box">
	<div class="input unit {$$props.class ?? ''}" use:setInput>
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
	{#if !navigator.userAgent.toLowerCase().includes('firefox')}
		<ExpandIcon class="unit expand-icon"></ExpandIcon>
	{/if}
</div>

<style>
	.text {
		resize: none;
		overflow: visible;
		width: 100%;
		outline: none;
		border: none;
	}

	:global(.expand-icon) {
		place-self: end;
		pointer-events: none;
	}

	.input:focus-within {
		outline: hsl(200, 80%, 60%) solid 2px;
	}

	.input-box {
		margin: 20px;
	}

	.input {
		width: -webkit-fill-available;
		width: -moz-available;
		border-radius: 10px;
		outline: hsl(0, 0%, 50%) solid 2px;
		resize: vertical;
		overflow: auto;
		height: 100px;
		display: flex;
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

	::-webkit-scrollbar-thumb {
		background: hsl(215, 15%, 95%);
		border-radius: 10px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: hsl(215, 15%, 80%);
	}

	@supports (width: -moz-available) {
		.textnumbers {
			top: 1px;
		}
	}
</style>
