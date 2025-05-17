<script>
	import { wait } from '$lib/flowControl';
	import CardWrapper from './CardWrapper.svelte';
	import { charWidth, fontSize, lineHeight, subCharWidth, subFontSize } from '$lib/globalStyle';

	/** @type {{
	 * id: string,
	 * set: import('svelte/store').Writable<Array<import('@/types').SetRow>>,
	 * setIndexes?: Map<any, number>,
	 * setId: string, useNote?: boolean,
	 * svgLines?: import('@/Structures/SvgLines.svelte').default | null,
	 * hue: any,
	 * label: any}} */
	let {
		id,
		set = $bindable(),
		setIndexes = new Map(),
		setId,
		useNote = true,
		svgLines = $bindable(),
		hue,
		label
	} = $props();

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
	 * @param {number} index
	 * @param {string} symbol
	 * @param {string} note
	 */
	async function addSetItem(index, symbol, note) {
		return new Promise(async (resolve, reject) => {
			try {
				set.update((x) => {
					x[index].rightProps = [
						...x[index].rightProps,
						{ value: symbol, opacity: 0, hide: true, note: note }
					];
					return x;
				});
				await wait(id, 50);
				set.update((x) => {
					x[index].rightProps[x[index].rightProps.length - 1] = {
						value: symbol,
						opacity: 1,
						hide: false,
						note: note
					};
					return x;
				});
				await wait(id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {Array<any>} symbols
	 * @param {Array<string>} texts
	 * @param {Array<string> | null} notes
	 * @param {any} key
	 * @param {string | null} srcId
	 */
	export async function joinSets(symbols, texts, notes, key, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				const index = /**@type {number}*/ (setIndexes.get(key));
				if ($set[index].rightProps.length > 0 && $set[index].rightProps[0].value === ' ') {
					$set[index].rightProps.pop();
				}

				let propIndex = $set[index].rightProps.findIndex(
					(x) =>
						x.note === (notes ? notes[0] : '') && x.value === (texts.length > 0 ? texts[0] : '')
				);
				if (propIndex === -1) propIndex = $set[index].rightProps.length;

				if (srcId) svgLines?.showLine(srcId, `${setId}r${index}-${propIndex}`, id);

				for (let i = 0; i < symbols.length; i++) {
					if ($set[index].right.find((x) => x === symbols[i]) === undefined) {
						set.update((x) => {
							x[index].right = [...x[index].right, symbols[i]];
							return x;
						});
						propIndex = $set[index].rightProps.findIndex(
							(x) => x.note === (notes ? notes[i] : '') && x.value === texts[i]
						);
						if (propIndex === -1) propIndex = $set[index].rightProps.length;

						if (srcId) svgLines?.updateTargets(srcId, `${setId}r${index}-${propIndex}`);

						if ($set[index].rightProps.length > 0) {
							await addSetItem(index, ',', '');
						}

						await addSetItem(index, texts[i], notes !== null ? notes[i] : '');
					}
				}
				await svgLines?.hideLine(true, id);
				resolve(null);
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	}

	/**
	 * @param {string} symbol
	 * @param {any} indexMapIdentifier
	 * @param {string | null} srcId
	 */
	export async function addSetRow(symbol, indexMapIdentifier, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				setIndexes.set(indexMapIdentifier, $set.length);
				set.update((x) => [
					...x,
					{
						left: symbol,
						right: [],
						showRight: false,
						rightProps: [{ value: ' ', opacity: 0, hide: false, note: '' }],
						note: useNote ? indexMapIdentifier.toString() : ''
					}
				]);

				await wait(id, 0);
				if (srcId) svgLines?.showLine(srcId, `${setId}l${setIndexes.get(indexMapIdentifier)}`, id);

				set.update((x) => {
					x[/**@type {number}*/ (setIndexes.get(indexMapIdentifier))].showRight = true;
					return x;
				});
				await wait(id, 0);
				if (srcId) await svgLines?.hideLine(true, id);
				return resolve(null);
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	}

	/**
	 * @param {any} key
	 * @param {any} item
	 */
	export async function remove(key, item) {
		return new Promise(async (resolve, reject) => {
			try {
				set.update((x) => {
					const index = /**@type {number}*/ (setIndexes.get(key));
					const rIndex = x[index].right.findIndex((i) => i === item) * 2;

					let prop = x[index].rightProps[rIndex];
					x[index].rightProps[rIndex] = {
						value: prop.value,
						opacity: 0,
						hide: true,
						note: prop.note
					};
					if (rIndex < x[index].rightProps.length - 1) {
						x[index].rightProps[rIndex + 1] = {
							value: ',',
							opacity: 0,
							hide: true,
							note: ''
						};
					}
					return x;
				});
				await wait(id, 1000);
				set.update((x) => {
					const index = /**@type {number}*/ (setIndexes.get(key));
					const rIndex = x[index].right.findIndex((i) => i === item) * 2;
					x[index].right = x[index].right.filter((i) => i !== item);
					if (rIndex === x[index].rightProps.length - 1) {
						x[index].rightProps.splice(rIndex, 1);
					} else {
						x[index].rightProps.splice(rIndex, 2);
					}
					return x;
				});
				await wait(id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export function get(/**@type {any}*/ key) {
		const index = setIndexes.get(key);
		if (index !== undefined) {
			return $set[index].right;
		}
	}

	export function has(/**@type {any}*/ key) {
		return setIndexes.has(key);
	}

	export function getSetId() {
		return setId;
	}

	export function reloadElement() {
		visible = !visible;
	}

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
				<span
					id="{setId}l{index}"
					class="block"
					style="--block-hue: {hue};width:{charWidth * item.left.length +
						subCharWidth * (item.note?.length ?? 0)}rem"
					><span style="font-size: {subFontSize}rem;">{item.note ?? ''}</span>{item.left}</span
				>
				{#if item.showRight}
					<span in:setItemIn={{ duration: 500, delay: 0 }}>{':'}</span>
					<span in:setItemIn={{ duration: 500, delay: 100 }} id="{setId}r{index}--1">{'{'}</span>

					{#each item.rightProps as text, ri (`${index}-${item.right[Math.floor(ri / 2.0)]}-${text.value}`)}
						<span
							style="transition: opacity 0.5s 0.2s, width 0.5s;width: {subCharWidth *
								(text.hide ? 0 : text.note?.length) +
								charWidth *
									(text.value === ''
										? 1
										: text.hide
											? 0
											: text.value.length)}rem;opacity:{text.opacity};{text.value === ''
								? "font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
								: ''}"
							id="{setId}r{index}-{ri}"
						>
							<span style="font-size: {subFontSize}rem;">{text.note}</span>{#if text.value === ''}
								&#x03B5;
							{:else if text.value != ' '}
								{text.value}
							{:else}
								&nbsp;
							{/if}
						</span>
					{/each}

					<span
						in:setItemIn={{ duration: 500, delay: 200 }}
						id="{setId}r{index}-{item.rightProps.length}">{'}'}</span
					>{/if}
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
