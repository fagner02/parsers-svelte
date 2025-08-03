<script>
	import { getJumpPause, wait } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import ResizeWrapper from './ResizeWrapper.svelte';
	import { Interaction } from '$lib/interactiveElem';
	import FileCodeIcon from '@icons/FileCodeIcon.svelte';
	import { colors } from '$lib/selectSymbol';
	import { appendData } from '$lib/log';

	/**@type {number[]}*/
	let highlightedLines = [];
	/** @type {HTMLElement} */
	let card;
	/** @type {HTMLElement} */
	let cardContent;

	let linesNum = $state(0);
	let minimized = /** @type {Boolean} */ ($state(true));
	let interaction = new Interaction();

	/** @type {{title: string, id: string, breakpoints: number[]}} */
	let { title, id, breakpoints = $bindable() } = $props();

	export function reset() {
		for (let line of highlightedLines) {
			/**@type {HTMLElement}*/ (cardContent.children[line]).style.background = 'hsl(200,0%,100%)';
			/**@type {HTMLElement}*/ (cardContent.children[line]).style.border =
				'1px solid hsl(110,60%,100%)';
		}
	}

	/**
	 * @param {number[]} lines
	 * @param {number} hue
	 */
	export async function highlightLines(lines, hue = colors.green) {
		return new Promise(async (resolve, reject) => {
			try {
				for (let line of highlightedLines) {
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.background = `transparent`;
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.border =
						'1px solid transparent';
				}

				if (lines.length === 0) {
					return resolve(null);
				}

				highlightedLines = lines;
				for (let line of lines) {
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.background =
						`hsl(${hue},50%,70%)`;
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.border =
						`1px solid hsl(${hue},60%,60%,100%)`;
				}
				if (minimized || getJumpPause(id)) {
					return resolve(null);
				}

				let line = cardContent.children[lines[0]].getBoundingClientRect();
				let content = cardContent.getBoundingClientRect();
				let height = parseFloat(window.getComputedStyle(card).height);
				card.scrollTo({
					behavior: 'smooth',
					left: 0,
					top: line.y - content.y - height / 2 + (line.height * lines.length) / 2
				});
				await wait(id, 500);
				return resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} pseudoCode
	 */
	export function setPseudoCode(pseudoCode) {
		cardContent.innerHTML = pseudoCode.trim();
		linesNum = (pseudoCode.match(/\n/g) || []).length;
		card.style.width = `${card.scrollWidth + card.clientWidth - cardContent.clientWidth}px`;
		setSize();
	}

	let setSize = /**@type {()=>void}*/ ($state(() => {}));
	onMount(() => {
		card = /**@type {HTMLElement}*/ (document.querySelector(`#code-card-${id}`));
		cardContent = /**@type {HTMLElement}*/ (document.querySelector(`#pseudocode-${id}`));
	});

	/**
	 * @param {number} index
	 */
	function toggleBreakpoint(index) {
		const existent = breakpoints.indexOf(index);
		if (existent === -1) {
			appendData('breakpoint, add');
			breakpoints.push(index);
		} else {
			appendData('breakpoint, remove');
			breakpoints.splice(existent, 1);
		}
	}
</script>

<ResizeWrapper
	{title}
	bind:minimized
	bind:setSize
	component={FileCodeIcon}
	id="code-{id}"
	{interaction}
>
	{#snippet content()}
		<div class="pseudo-code-card" id="code-card-{id}">
			<div class="line-nums">
				{#each { length: linesNum }, i}
					<button
						class={breakpoints.includes(i) ? 'breakpoint' : ''}
						onclick={(e) => toggleBreakpoint(i)}>{i}.</button
					>
				{/each}
			</div>
			<pre class="pseudocode" id="pseudocode-{id}"></pre>
		</div>
	{/snippet}
</ResizeWrapper>

<style>
	pre,
	button {
		font-size: 11px;
	}
	.line-nums {
		background: hsl(200, 50%, 40%);
		height: fit-content;
		border-radius: 5px;
		justify-items: stretch;
		position: sticky;
		left: 0;
	}
	.line-nums > button {
		cursor: pointer;
		background: none;
		padding: 0 5px;
		color: white;
		place-content: start;
	}

	.line-nums > button:hover {
		background: hsl(200, 50%, 60%);
		border-radius: 5px;
	}

	.line-nums > button.breakpoint::after {
		content: '';
		position: absolute;
		background: hsl(7, 60%, 50%);
		width: 10px;
		height: 10px;
		border-radius: 3px;
		place-self: center;
		left: -5px;
	}
	.pseudo-code-card {
		min-height: 50px;
		min-width: 50px;
		height: 100px;
		overflow: auto;
		position: relative;
		padding: 5px;
		z-index: 1;
		top: 0;
		left: 0;
		display: flex;
		width: fit-content;
	}
	:global(.pseudocode > span) {
		padding: 0px 5px;
		border-radius: 5px;
		font-family: spacemono;
		transition: all 0.5s;
		border: 1px solid transparent;
	}
	:global(.pseudocode sub) {
		vertical-align: bottom;
	}
</style>
