<script>
	import { wait } from '$lib/flowControl';
	import { charWidth, fontSize, lineHeight, subCharWidth, subFontSize } from '$lib/globalStyle';
	import CardWrapper from './CardWrapper.svelte';
	const stackTransitionForward = `top 0.5s 0.5s, height 0.5s, width 0.5s, opacity 0.5s 0.5s`;
	const stackTransitionBackward = `top 0.5s, height 0.5s 0.5s, width 0.5s 0.5s, opacity 0.5s`;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<any>>>} */
	export let stack;
	export let label;
	export let hue;
	export let highlighted = true;
	export let reversed = true;
	/** @type {string} */
	export let stackId;
	/** @type {import('@/SvgLines.svelte').default | undefined} */
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
		return new Promise(async (resolve, reject) => {
			try {
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
				await wait(10);

				if (srcId) {
					await svgLines?.showLine(/**@type {string}*/ (srcId), `#stack-${stackId}-0`);
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
					await svgLines?.hideLine();
				}

				svgLines?.setHideOpacity();
				await wait(500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {any} data
	 * @param {string} text
	 * @param {number} index
	 */
	export async function updateItem(data, text, index) {
		return new Promise(async (resolve, reject) => {
			try {
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
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export function top() {
		return $stack[$stack.length - 1].data;
	}

	export function first() {
		return $stack[0].data;
	}

	/**
	 * @param {number} index
	 */
	export async function removeFromStack(index) {
		return new Promise(async (resolve, reject) => {
			try {
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
				stack.update((x) => {
					return [...x.slice(0, index), ...x.slice(index + 1)];
				});
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}
</script>

<CardWrapper minHeight={lineHeight} minWidth={charWidth} {hue} {label} cardId={stackId}>
	{#each reversed ? [...$stack].reverse() : $stack as stackItem, index (`${stackId}-${stackItem.id}`)}
		<p
			id="stack-{stackId}-{index}"
			class={highlighted && stackItem.showBlock ? 'block' : ''}
			style="--block-hue: {hue};transition: {stackItem.transition};height: {stackItem.height}rem;width: {stackItem.width}rem;opacity: {stackItem.opacity}; top: {stackItem.top}rem;line-height: {lineHeight}rem;font-size:{fontSize}rem; padding: 0px;"
		>
			{stackItem.text}<span
				style="font-size: {subFontSize}rem; position: absolute;transform: translate(0px, 5px)"
				>{stackItem.note}</span
			>
		</p>
	{/each}
</CardWrapper>

<style>
	p {
		position: relative;
		transition:
			top 0.5s 0.5s,
			height 0.5s,
			width 0.5s,
			opacity 0.5s 0.5s;
		white-space: nowrap;
	}
</style>
