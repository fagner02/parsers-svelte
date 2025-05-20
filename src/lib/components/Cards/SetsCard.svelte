<script>
	import { noJumpWait, wait } from '$lib/flowControl';
	import CardWrapper from './CardWrapper.svelte';
	import { charWidth, fontSize, lineHeight, subFontSize } from '$lib/globalStyle';
	import { onMount } from 'svelte';

	/** @type {{
	 * id: string,
	 * set: import('svelte/store').Writable<Array<import('@/types').SetRow>>,
	 * setId: string,
	 * svgLines?: import('@/Structures/SvgLines.svelte').default | null,
	 * hue: any,
	 * label: any,
	 * convert?: {
	 * left?: (value: any)=> string,
	 * right?: (value: any)=> string,
	 * noteLeft?: (value: any)=>string,
	 * noteRight?: (value: any)=> string}}} */
	let { id, set = $bindable(), setId, svgLines = $bindable(), hue, label, convert = {} } = $props();

	if (!convert.left) convert.left = (value) => value;
	if (!convert.right) convert.right = (value) => value;
	if (!convert.noteLeft) convert.noteLeft = (_) => '';
	if (!convert.noteRight) convert.noteRight = (_) => '';
	let visible = $state(true);

	/**
	 * @param {any} _
	 * @param {{duration: number, delay: number}} params
	 */
	export function setItemIn(_, { duration, delay }) {
		return {
			delay,
			duration,
			/** @param {number} t */
			css: (t) => `opacity: ${t < 0.5 ? 0 : (t - 0.5) / 0.5};
			width: ${charWidth * t}rem;`
		};
	}

	/**
	 * @param {Array<any>} symbols
	 * @param {any} key
	 * @param {string | null} srcId
	 */
	export async function joinSets(symbols, key, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				const index = $set.findIndex((x) => x.left === key);

				set.update((x) => {
					x[index].right = [...new Set([...x[index].right, ...symbols])];
					return x;
				});
				await wait(id, 0);
				if (srcId) svgLines?.showLine(srcId, `${setId}r${index}-${0}`, id);
				for (let i = 0; i < $set[index].right.length; i++) {
					let itemId = `${setId}r${index}-${i}`;
					let elem = /**@type {HTMLElement} */ (document.querySelector(`#${itemId}`));

					elem.style.maxWidth = `${elem.scrollWidth}px`;
					elem.style.opacity = '1';

					if (srcId) svgLines?.updateTargets(srcId, itemId);
				}
				await wait(id, 500);
				await svgLines?.hideLine(true, id);
				resolve(null);
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	}

	/**
	 * @param {any} key
	 * @param {string | null} srcId
	 */
	export async function addSetRow(key, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				set.update((x) => [
					...x,
					{
						left: key,
						right: []
					}
				]);

				await wait(id, 0);
				const index = $set.findIndex((i) => i.left === key);
				if (srcId) svgLines?.showLine(srcId, `${setId}l${index}`, id);

				await wait(id, 0);
				if (srcId) await svgLines?.hideLine(true, id);
				return resolve(null);
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	}

	function initialize() {
		for (let i = 0; i < $set.length; i++) {
			for (let j = 0; j < $set[i].right.length; j++) {
				let elem = /**@type {HTMLElement}*/ (document.querySelector(`#${setId}r${i}-${j}`));
				elem.style.maxWidth = `${elem.scrollWidth}px`;
				elem.style.opacity = '1';
			}
		}
	}

	/**@param {Map<any, Set<any>>} sets */
	export async function loadSets(sets) {
		try {
			set.set(
				/**@type {import('@/types').SetRow[]}*/ (
					sets
						.entries()
						.toArray()
						.map((x) => ({ left: x[0], right: x[1].values().toArray() }))
				)
			);
			await noJumpWait(0);
			initialize();
		} catch (e) {}
	}

	/**
	 * @param {any} key
	 * @param {any} item
	 */
	export async function remove(key, item) {
		return new Promise(async (resolve, reject) => {
			try {
				const index = $set.findIndex((i) => i.left === key);
				const rIndex = $set[index].right.findIndex((i) => i === item);
				if (rIndex === -1) return resolve(null);
				const elem = /**@type {HTMLElement} */ (
					document.querySelector(`#${setId}r${index}-${rIndex}`)
				);
				elem.style.maxWidth = '0px';
				elem.style.opacity = '0';
				await wait(id, 500);
				set.update((x) => {
					x[index].right.splice(rIndex, 1);
					return x;
				});
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export function get(/**@type {any}*/ key) {
		const index = $set.findIndex((i) => i.left === key);
		if (index !== undefined) {
			return $set[index].right;
		}
	}

	export function has(/**@type {any}*/ key) {
		return $set.findIndex((i) => i.left === key) !== -1;
	}

	export function getSetId() {
		return setId;
	}

	export async function reloadElement() {
		visible = !visible;
		await noJumpWait(0);
		initialize();
	}
	onMount(initialize);
	let maxHeight = $derived(lineHeight * Math.max($set?.length ?? 0, 1));
</script>

<CardWrapper
	{id}
	minWidth={charWidth}
	minHeight={lineHeight}
	{maxHeight}
	{hue}
	{label}
	cardId={setId}
>
	{#key visible}
		{#each $set as item, index}
			<p
				id="{setId}set{index}"
				style="line-height: {lineHeight}rem;font-size:{fontSize}rem; padding: 0px; width: fit-content;height: {lineHeight}rem"
			>
				<span id="{setId}l{index}" class="block" style="--block-hue: {hue};">
					<span style="font-size: {subFontSize}rem;">
						{convert.noteLeft?.(item.left)}
					</span>{convert.left?.(item.left)}
				</span>
				<span in:setItemIn={{ duration: 500, delay: 0 }}>{':'}</span>
				<span in:setItemIn={{ duration: 500, delay: 100 }} id="{setId}r{index}--1">{'{'}</span>

				{#each item.right as text, ri (text)}
					<span
						style="max-width: 0px; opacity: 0;transition: opacity 0.5s 0.2s, max-width 0.5s;"
						id="{setId}r{index}-{ri}"
					>
						<span style="font-size: {subFontSize}rem;">{convert.noteRight?.(text)}</span
						>{#if text === ''}
							&#x03B5;
						{:else}
							{convert.right?.(text)}
						{/if}{#if ri < item.right.length - 1},{/if}
					</span>
				{/each}

				<span in:setItemIn={{ duration: 500, delay: 200 }}>{'}'}</span>
			</p>
		{/each}
	{/key}
</CardWrapper>

<style>
	p > span:nth-child(2) {
		margin-left: 5px;
	}
	p {
		padding: 0px;
		display: flex;
		white-space: nowrap;
	}
</style>
