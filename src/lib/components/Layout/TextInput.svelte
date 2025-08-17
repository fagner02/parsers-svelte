<script>
	import { onMount } from 'svelte';
	import { getTextWidth } from '$lib/globalStyle';
	import { grammar, isGrammarLoaded, loadGrammar, setGrammarText } from '$lib/utils';
	import Instruction from './Instruction.svelte';

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
		fontSize = 13,
		lineHeight = fontSize + 9,
		lines = 1,
		...props
	} = $props();

	function updateSize() {
		lines = Math.max(text.childElementCount + 1, Math.ceil(input.clientHeight / lineHeight));
		height = lines * lineHeight;
		numGap = lines.toString().length * charWidth + 13;
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

<div style="height: inherit;overflow:auto">
	<div class="input-box unit">
		<div style="display: flex; flex-direction:column;margin-bottom: 10px;gap: 10px">
			<Instruction>
				O lado esquerdo e direito das regras devem ser separados por <kbd>-&gt;</kbd>.
				<br />Exemplo:
				<kbd>A -&gt; a B</kbd>.
			</Instruction>
			<Instruction>
				O símbolo <i>&epsilon;</i> é representado como uma regra da gramática sem lado esquerdo.
				<br />
				Exemplo: <kbd>A -&gt; </kbd> = <i>A &rightarrow; &epsilon;</i>.
			</Instruction>
			<Instruction>
				Todos os símbolos devem ser separados por espaço. Símbolos juntos são considerados um único
				símbolo.<br /> Exemplo: <kbd>b B</kbd> = <kbd>&lbrace;b, B&rbrace;</kbd>,
				<kbd>bB</kbd>
				=
				<kbd>&lbrace;bB&rbrace;</kbd>.
			</Instruction>
			<Instruction>
				As regras da gramática podem ser separadas por linha ou usando o símbolo <kbd>|</kbd>.
				<br />
				Exemplo: <br />
				<kbd>A -&gt; a B</kbd> <br />
				<kbd>A -&gt; c D</kbd><br />
				É o mesmo que
				<kbd>A -&gt; a B | c D</kbd>.
			</Instruction>
		</div>
		<!-- <hr /> -->
		<div class="input unit {props.class ?? ''}" use:setInput>
			<div class="unit textnumbers" style="width: {numGap}px;height: {height}px;">
				{#each { length: lines } as _, textInputIndex}
					<div class="grid">
						<p style="font-size:{fontSize}px;height: {lineHeight}px">{textInputIndex + 1}.</p>
					</div>
				{/each}
			</div>
			<div
				use:setText
				contenteditable="true"
				oninput={clearInput}
				class="text"
				style="font-size: {fontSize}px;line-height: {lineHeight}px;"
			></div>
		</div>
	</div>
</div>

<style>
	kbd {
		border-radius: 5px;
		background: hsl(215, 15%, 80%);
		padding: 2px 4px;
		font-family: 'Courier New', Courier, monospace !important;
	}
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
		font-family: monospace;
	}

	.textnumbers {
		display: grid;
		overflow: hidden;
		letter-spacing: 0px;
		background: hsl(0, 0%, 80%);
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
		background: hsl(215, 15%, 80%);
		border-radius: 10px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: hsl(215, 15%, 70%);
	}

	@supports (width: -moz-available) {
		.textnumbers {
			top: 1px;
		}
	}
</style>
