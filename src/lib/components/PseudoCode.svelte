<script>
	import { wait } from '$lib/flowControl';
	import { onMount } from 'svelte';

	/**@type {number[]}*/
	let highlightedLines = [];
	/** @type {HTMLElement} */
	let card;
	/** @type {HTMLElement} */
	let cardContent;

	/**
	 * @param {number[]} lines
	 */
	export async function highlightLines(lines) {
		for (let line of highlightedLines) {
			/**@type {HTMLElement}*/ (cardContent.children[line]).style.background = 'hsl(200,0%,100%)';
		}

		highlightedLines = lines;
		for (let line of lines) {
			/**@type {HTMLElement}*/ (cardContent.children[line]).style.background = 'hsl(200,50%,80%)';
		}
		cardContent.children[lines[0]].scrollIntoView({ behavior: 'smooth', block: 'center' });
		await wait(500);
	}

	let pcCardPos = { x: 0, y: 0 };
	/**@type {{ x: number; y: number; } | null}*/
	let dragPos = null;
	function dragStart(/**@type {MouseEvent}*/ e) {
		let bbox = card.getBoundingClientRect();

		if (
			e.clientX < bbox.right + 20 &&
			e.clientX > bbox.right - 20 &&
			e.clientY < bbox.bottom + 20 &&
			e.clientY > bbox.bottom - 20
		) {
			return;
		}
		e.preventDefault();
		e.stopImmediatePropagation();
		dragPos = { x: e.clientX, y: e.clientY };

		card.style.cursor = 'grabbing';
	}

	function dragEnd(/**@type {MouseEvent}*/ e) {
		if (dragPos === null) return;
		let diff = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };
		pcCardPos = { x: pcCardPos.x + diff.x, y: pcCardPos.y + diff.y };
		dragPos = null;
		card.style.cursor = 'grab';
	}

	function dragMove(/**@type {MouseEvent}*/ e) {
		if (dragPos === null) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		let diff = { x: e.clientX - dragPos.x, y: e.clientY - dragPos.y };
		dragPos = { x: e.clientX, y: e.clientY };
		pcCardPos = { x: pcCardPos.x + diff.x, y: pcCardPos.y + diff.y };

		card.style.top = `${pcCardPos.y}px`;
		card.style.left = `${pcCardPos.x}px`;
	}

	function touchStart(/**@type {TouchEvent}*/ e) {
		e.preventDefault();

		dragPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}
	function touchMove(/**@type {TouchEvent}*/ e) {
		e.preventDefault();

		if (dragPos === null) return;
		let diff = { x: e.touches[0].clientX - dragPos.x, y: e.touches[0].clientY - dragPos.y };
		dragPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		pcCardPos.x += diff.x;
		pcCardPos.y += diff.y;
		card.style.top = `${pcCardPos.y}px`;
		card.style.left = `${pcCardPos.x}px`;
		return;
	}
	function touchEnd() {
		dragPos = null;
	}

	/**
	 * @param {string} pseudoCode
	 */
	export function setPseudoCode(pseudoCode) {
		cardContent.innerHTML = pseudoCode;
	}

	onMount(() => {
		card = /**@type {HTMLElement}*/ (document.querySelector('.pseudo-code-card'));
		cardContent = /**@type {HTMLElement}*/ (document.querySelector('#pseudocode'));
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="pseudo-code-card unit"
	on:mousedown={dragStart}
	on:mouseleave={dragEnd}
	on:mouseup={dragEnd}
	on:mousemove={dragMove}
	on:touchstart={touchStart}
	on:touchmove={touchMove}
	on:touchend={touchEnd}
>
	<pre style="font-size: 11px;" id="pseudocode"></pre>
</div>

<style>
	.pseudo-code-card {
		resize: both;
		overflow: auto;
		cursor: grab;
		position: absolute;
		padding: 5px;
		margin: 5px;
		border: 1px solid hsl(200, 50%, 50%);
		border-radius: 10px;
		background: white;
		z-index: 1;
		height: 100px;
		width: 100px;
		min-height: 50px;
		min-width: 50px;
		top: 0;
		left: 0;
	}
	:global(#pseudocode > span) {
		padding: 0px 5px;
		border-radius: 5px;
		font-family: spacemono;
		transition: background 0.5s;
	}
	:global(#pseudocode sub) {
		vertical-align: bottom;
	}
</style>
