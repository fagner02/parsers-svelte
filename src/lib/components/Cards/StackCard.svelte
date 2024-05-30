<script>
	import { wait } from '$lib/utils';
	import CardBox from './CardBox.svelte';
	const stackTransitionForward = `top 0.5s 0.5s, height 0.5s, width 0.5s, opacity 0.5s 0.5s`;
	const stackTransitionBackward = `top 0.5s, height 0.5s 0.5s, width 0.5s 0.5s, opacity 0.5s`;
	/**@type {number}*/
	export let lineHeight;
	/**@type {number}*/
	export let charWidth;
	/**@type {number}*/
	export let subCharWidth;

	/**@type {import("svelte/store").Writable<Array<import('@/types').StackItem<any>>>}*/
	export let stack;
	export let fontSize;
	export let subFontSize;
	export let label;
	export let color;
	/** @type {string} */
	export let stackId;
	/**@type {import('@/SvgLines.svelte').default}*/
	export let svgLines;

	/**
	 * @param {string} text
	 * @param {string} note
	 */
	function textWidth(text, note) {
		return text.length * charWidth + note.length * subCharWidth;
	}

	/**
	 * @param {any} data
	 * @param {string} text
	 * @param {string} note
	 * @param {string} id
	 * @param {string|null} srcId
	 */
	export async function addToStack(data, text, note, id, srcId = null) {
		stack.update((x) => [
			...x,
			{
				opacity: 0,
				height: 0,
				width: 0,
				top: -lineHeight,
				text,
				note,
				data: data,
				transition: stackTransitionForward,
				id,
				showBlock: true
			}
		]);
		await wait(50);

		if (srcId) {
			await svgLines.showLine(/**@type {string}*/ (srcId), `#s-${stackId}-0`);
		}

		stack.update((x) => {
			Object.assign(x[x.length - 1], {
				opacity: 1,
				height: lineHeight,
				width: textWidth(text, note),
				top: 0
			});
			return x;
		});

		if (srcId) {
			await svgLines.hideLine();
		}

		/**@type {HTMLElement}*/ (document.querySelector('#lines')).style.opacity = '0';
	}

	/**
	 * @param {any} data
	 * @param {string} text
	 * @param {number} index
	 */
	export async function updateItem(data, text, index) {
		stack.update((x) => {
			Object.assign(x[index], {
				data,
				text,
				width: textWidth(text, x[index].note),
				showBlock: false
			});
			return x;
		});
		await wait(50);

		stack.update((x) => {
			Object.assign(x[index], {
				data,
				text,
				width: textWidth(text, x[index].note),
				showBlock: true
			});
			return x;
		});
		await wait(500);
	}

	/**
	 * @param {number} index
	 */
	export async function removeFromStack(index) {
		stack.update((x) => {
			Object.assign(x[index], {
				opacity: 0,
				height: 0,
				width: 0,
				top: -lineHeight,
				transition: stackTransitionBackward
			});
			return x;
		});
		await wait(1000);
		stack.update((x) => x.splice(0, index));
	}
</script>

<CardBox minHeight={lineHeight} minWidth={charWidth} {color} {label}>
	{#each [...$stack].reverse() as stackItem, index (stackId + stackItem.id)}
		<p
			id="s-{stackId}-{index}"
			class="{stackItem.showBlock ? 'block' : ''} {color}-after"
			style="transition: {stackItem.transition};height: {stackItem.height}px;width: {stackItem.width}px;opacity: {stackItem.opacity}; top: {stackItem.top}px;line-height: {lineHeight}px;font-size:{fontSize}px; padding: 0px;"
		>
			{stackItem.text}<span
				style="font-size: {subFontSize}px; position: absolute;translate: 0px 5px"
				>{stackItem.note}</span
			>
		</p>
	{/each}
</CardBox>

<style>
	@import '@/block.css';

	p {
		position: relative;
		transition:
			top 0.5s 0.5s,
			height 0.5s,
			width 0.5s,
			opacity 0.5s 0.5s;
	}
</style>
