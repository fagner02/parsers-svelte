<script>
	import { onMount } from 'svelte';
	import { getTextWidth } from '$lib/globalStyle';
	import { grammar, isGrammarLoaded, loadGrammar, setGrammarText } from '$lib/utils';

	/**@type {number}*/
	let height = $state(0);
	/** @type {HTMLElement} */
	let input;
	/** @type {HTMLElement} */
	let text;

	/**@type {{id: string, class?: string, numGap: number, fontSize: number, lineHeight: number, lines: number}}*/
	let {
		id = $bindable(),
		numGap = 0,
		fontSize = 0.8,
		lineHeight = fontSize + 0.5,
		lines = 1,
		...props
	} = $props();

	function updateSize() {
		lines = Math.max(
			text.childElementCount + 1,
			Math.ceil((input.clientHeight * 0.0625) / lineHeight)
		);
		height = lines * lineHeight;
		numGap = lines.toString().length * charWidth + 0.8;
	}

	let charWidth = 0;

	onMount(() => {
		charWidth = getTextWidth('0', fontSize);
		/**@type {HTMLElement}*/ (document.querySelector('.input>.text')).innerText = grammar;
		if (!isGrammarLoaded()) {
			loadGrammar();
		}
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
	function clearInput(/**@type {InputEvent}*/ ev) {
		if (ev.inputType === 'insertFromPaste' && ev.target) {
			const target = /**@type {HTMLElement}*/ (ev.target);
			target.innerHTML = target.innerText.replaceAll('\n', '</br>');
		}
		setGrammarText(/**@type {HTMLElement}*/ (ev.target)?.innerText);
		loadGrammar();
	}
</script>

<div class="grid input-box unit">
	<div class="input unit {props.class ?? ''}" use:setInput>
		<div class="unit textnumbers" style="width: {numGap}rem;height: {height}rem;">
			{#each { length: lines } as _, textInputIndex}
				<div class="grid">
					<p style="font-size:{fontSize}rem;height: {lineHeight}rem">{textInputIndex + 1}.</p>
				</div>
			{/each}
		</div>
		<div
			use:setText
			contenteditable="true"
			oninput={clearInput}
			class="text"
			style="font-size: {fontSize}rem;line-height: {lineHeight}rem;"
		></div>
	</div>
</div>

<style>
	.text {
		resize: none;
		overflow: visible;
		width: 100%;
		outline: none;
		border: none;
		padding-left: 5px;
	}

	:global(.expand-icon) {
		place-self: end;
		pointer-events: none;
	}

	.input-box {
		margin: 20px;
	}

	.input {
		width: -webkit-fill-available;
		width: -moz-available;
		border-radius: 10px;
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
