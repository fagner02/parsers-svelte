<script>
	import { wait } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import ResizeWrapper from './ResizeWrapper.svelte';
	import { Interaction } from '$lib/interactiveElem';
	import FileCodeIcon from '@icons/FileCodeIcon.svelte';

	/**@type {number[]}*/
	let highlightedLines = [];
	/** @type {HTMLElement} */
	let card;
	/** @type {HTMLElement} */
	let cardContent;
	let interaction = new Interaction();

	export function reset() {
		for (let line of highlightedLines) {
			/**@type {HTMLElement}*/ (cardContent.children[line]).style.background = 'hsl(200,0%,100%)';
			/**@type {HTMLElement}*/ (cardContent.children[line]).style.border =
				'1px solid hsl(110,60%,100%)';
		}
	}

	/**
	 * @param {number[]} lines
	 * @returns {Promise<void>}
	 */
	export async function highlightLines(lines) {
		return new Promise(async (resolve, reject) => {
			try {
				for (let line of highlightedLines) {
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.background =
						'hsl(200,0%,0%, 0%)';
					// /**@type {HTMLElement}*/ (cardContent.children[line]).style.boxShadow =
					// 	'0px 0px 5px hsl(110,60%,60%, 0%)';
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.border =
						'1px solid transparent';
					// /**@type {HTMLElement}*/ (cardContent.children[line]).style.color = 'hsl(0,0%,0%)';
				}

				highlightedLines = lines;
				for (let line of lines) {
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.background =
						'hsl(110,50%,90%)';
					/**@type {HTMLElement}*/ (cardContent.children[line]).style.border =
						'1px solid hsl(110,60%,60%, 100%)';
					// /**@type {HTMLElement}*/ (cardContent.children[line]).style.boxShadow =
					// 	'0px 0px 5px hsl(110,60%,60%)';
					// /**@type {HTMLElement}*/ (cardContent.children[line]).style.color = 'hsl(0,0%,100%)';
				}

				let line = cardContent.children[lines[0]].getBoundingClientRect();
				let content = cardContent.getBoundingClientRect();
				let height = parseFloat(window.getComputedStyle(card).height);
				card.scrollTo({
					behavior: 'smooth',
					left: 0,
					top: line.y - content.y - height / 2 + (line.height * lines.length) / 2
				});
				await wait(500);
				return resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} pseudoCode
	 */
	export function setPseudoCode(pseudoCode) {
		cardContent.innerHTML = pseudoCode;
		card.style.width = `${card.scrollWidth + card.clientWidth - cardContent.clientWidth}px`;
		setSize();
	}

	/**@type {()=>void}*/
	let setSize;
	onMount(() => {
		card = /**@type {HTMLElement}*/ (document.querySelector('.pseudo-code-card'));
		cardContent = /**@type {HTMLElement}*/ (document.querySelector('#pseudocode'));
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<ResizeWrapper bind:setSize component={FileCodeIcon} id="code" {interaction}>
	<div slot="content" class="pseudo-code-card">
		<pre style="font-size: 11px;" id="pseudocode"></pre>
	</div>
</ResizeWrapper>

<style>
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
	}
	:global(#pseudocode > span) {
		padding: 0px 5px;
		border-radius: 5px;
		font-family: spacemono;
		transition: all 0.5s;
		border: 1px solid transparent;
	}
	:global(#pseudocode sub) {
		vertical-align: bottom;
	}
</style>
