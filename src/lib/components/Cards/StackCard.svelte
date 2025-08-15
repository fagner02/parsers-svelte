<script>
	import { noJumpWait, wait } from '$lib/flowControl';
	import { charWidth, fontSize, lineHeight, subFontSize } from '$lib/globalStyle';
	import { onMount } from 'svelte';
	import CardWrapper from './CardWrapper.svelte';

	/**
	 * @template T
	 * @typedef {import('@/types').StackItem<T>} StackItem*/

	/** @type {{
	 * id: string,
	 * stack: import("svelte/store").Writable<Array<StackItem<any>>>,
	 * label: any,
	 * hue: any,
	 * highlighted?: boolean,
	 * reversed?: boolean,
	 * stackId: string,
	 * labelTooltip?: string,
	 * svgLines: import('@/Structures/SvgLines.svelte').default
	 * horizontal?: boolean }}*/
	let {
		horizontal = false,
		id,
		stack = $bindable(),
		label,
		hue,
		highlighted = true,
		reversed = true,
		stackId,
		svgLines = $bindable(),
		labelTooltip = ''
	} = $props();
	let idCount = 0;

	/**
	 * @template T
	 * @param {T} data
	 * @param {string} text
	 * @param {string} note
	 * @param {string|null} srcId
	 */
	export async function addToStack(data, text, note, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				await wait(id, 10);
				if ($stack.length === 0) idCount = 0;
				stack.update((x) => [
					...x,
					{
						text,
						note,
						data: data,
						id: idCount
					}
				]);
				idCount++;
				await wait(id, 10);

				if (srcId) {
					await svgLines?.showLine(
						/**@type {string}*/ (srcId),
						`#stack-${stackId}-${$stack.length - 1}`,
						id
					);
				}

				let elem = /**@type {HTMLElement}*/ (
					document.querySelector(`#stack-${stackId}-${$stack.length - 1}`)
				);
				elem.style.height = `${elem.scrollHeight}px`;
				elem.style.width = `${elem.clientWidth}px`;
				elem.style.opacity = '1';
				elem.style.top = '0px';

				if (srcId) {
					await svgLines?.hideLine(true, id);
				}

				svgLines?.setHideOpacity();
				await wait(id, 500);
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
						text
					});
					return x;
				});
				await wait(id, 0);
				let elem = /**@type {HTMLElement}*/ (document.querySelector(`#stack-${stackId}-${index}`));
				elem.style.width = `${elem.scrollWidth}px`;
				await wait(id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {number} index
	 */
	export async function removeFromStack(index) {
		return new Promise(async (resolve, reject) => {
			try {
				let elem = /**@type {HTMLElement}*/ (document.querySelector(`#stack-${stackId}-${index}`));
				elem.style.width = '0px';
				elem.style.height = '0px';
				elem.style.opacity = '0';
				elem.style.top = `-${lineHeight}px`;

				await wait(id, 1000);
				stack.update((x) => {
					return [...x.slice(0, index), ...x.slice(index + 1)];
				});
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export async function removeAll() {
		return new Promise(async (resolve, reject) => {
			try {
				if ($stack.length === 0) {
					return resolve(null);
				}
				let elem = /**@type {HTMLElement?}*/ (document.querySelector(`#stack-${stackId}-${0}`));
				while (elem) {
					elem.style.width = '0px';
					elem.style.height = '0px';
					elem.style.opacity = '0';
					elem.style.top = `-${lineHeight}px`;
					elem = /**@type {HTMLElement?}*/ (elem.nextElementSibling);
				}
				await wait(id, 1000);
				stack.set([]);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {StackItem<any>[]} items
	 */
	export async function loadStack(items) {
		return new Promise(async (resolve, reject) => {
			try {
				idCount = items.length;
				stack.set(items);

				await wait(id, 0);
				let elem = /**@type {HTMLElement}*/ (document.querySelector(`#stack-${stackId}-${0}`));

				while (elem) {
					elem.style.opacity = '1';
					elem.style.top = '0px';
					elem = /**@type {HTMLElement}*/ (elem.nextElementSibling);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	onMount(async () => {
		let elem = /**@type {HTMLElement}*/ (document.querySelector(`#stack-${stackId}-${0}`));

		while (elem) {
			// elem.style.height = `${elem.scrollHeight}px`;
			// elem.style.width = `${elem.scrollWidth}px`;
			elem.style.opacity = '1';
			elem.style.top = '0px';
			elem = /**@type {HTMLElement}*/ (elem.nextElementSibling);
			await noJumpWait(0);
		}
	});
</script>

<CardWrapper
	{labelTooltip}
	style={reversed
		? 'flex-direction: column-reverse'
		: horizontal
			? 'flex-direction: row; gap: 8px'
			: ''}
	{id}
	minHeight={lineHeight}
	minWidth={charWidth}
	{hue}
	{label}
	cardId={stackId}
>
	{#each $stack as stackItem, index (stackItem.id)}
		<p
			id="stack-{stackId}-{index}"
			class={`stack-item ${highlighted ? (horizontal ? 'empty' : 'block') : ''}`}
			style="{horizontal
				? 'padding: 0 2px'
				: ''};--block-hue: {hue};top: -{lineHeight}px;line-height: {lineHeight}px;font-size:{fontSize}px;"
		>
			<span style="font-size: {subFontSize}px;">{stackItem.note}</span>{stackItem.text}
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
		justify-content: center;
		display: flex;
	}
	.stack-item {
		height: fit-content;
		width: fit-content;
		opacity: 0;
		padding: 0;
		transition:
			width 0.5s,
			height 0.5s,
			opacity 0.5s,
			top 0.5s;
	}
</style>
