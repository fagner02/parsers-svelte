<script>
	import { selectLSymbol } from '$lib/selectSymbol';
	import { addPause, wait } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import CardBox from './CardWrapper.svelte';
	import { charWidth, fontSize, lineHeight, subCharWidth, subFontSize } from '$lib/globalStyle';
	import { text } from '@sveltejs/kit';

	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	export let set;
	/**@type {Map<any, number>}*/
	export let setIndexes = new Map();
	/**@type {string}*/
	export let setId;
	export let useNote = true;
	/**@type {import('@/SvgLines.svelte').default}*/
	export let svgLines;

	export let color;
	export let label;

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
			width: ${charWidth * t}px;`
		};
	}

	/**
	 * @param {number} index
	 * @param {string} symbol
	 */
	async function addSetItem(index, symbol) {
		try {
			set.update((x) => {
				x[index].rightProps = [...x[index].rightProps, { value: symbol, opacity: 0, hide: true }];
				return x;
			});
			await wait(50);
			set.update((x) => {
				x[index].rightProps[x[index].rightProps.length - 1] = {
					value: symbol,
					opacity: 1,
					hide: false
				};
				return x;
			});
			await wait(500);
		} catch {}
	}

	/**
	 * @param {Array<any>} symbols
	 * @param {Array<string>} texts
	 * @param {any} key
	 * @param {string | null} srcId
	 */
	export async function joinSets(symbols, texts, key, srcId = null) {
		try {
			const index = /**@type {number}*/ (setIndexes.get(key));
			if ($set[index].rightProps[0].value === ' ') {
				$set[index].rightProps.pop();
			}

			if (srcId) svgLines.showLine(srcId, `${setId}r${index}-${$set[index].rightProps.length}`);

			for (let i = 0; i < symbols.length; i++) {
				if ($set[index].right.find((x) => x === symbols[i]) === undefined) {
					set.update((x) => {
						x[index].right = [...x[index].right, symbols[i]];
						return x;
					});
					if (srcId)
						svgLines.updateTargets(srcId, `${setId}r${index}-${$set[index].rightProps.length}`);

					if ($set[index].rightProps.length > 0) {
						await addSetItem(index, ',');
					}

					await addSetItem(index, texts[i]);
				}
			}
			await svgLines.hideLine();
		} catch {}
	}

	/**
	 * @param {string} symbol
	 * @param {any} indexMapIdentifier
	 * @param {string | null} srcId
	 */
	export async function addSetRow(symbol, indexMapIdentifier, srcId = null) {
		try {
			setIndexes.set(indexMapIdentifier, $set.length);
			set.update((x) => [
				...x,
				{
					left: symbol,
					right: [],
					showRight: false,
					rightProps: [{ value: ' ', opacity: 0, hide: false }],
					note: useNote ? indexMapIdentifier.toString() : ''
				}
			]);

			await wait(0);
			if (srcId) svgLines.showLine(srcId, `${setId}l${setIndexes.get(indexMapIdentifier)}`);

			await selectLSymbol(
				setId,
				/**@type {number}*/ (setIndexes.get(indexMapIdentifier)),
				'blue',
				false
			);

			set.update((x) => {
				x[/**@type {number}*/ (setIndexes.get(indexMapIdentifier))].showRight = true;
				return x;
			});
			await wait(0);
			await svgLines.hideLine();
		} catch {}
	}

	/**
	 * @param {any} key
	 * @param {any} item
	 */
	export async function remove(key, item) {
		set.update((x) => {
			const index = /**@type {number}*/ (setIndexes.get(key));
			const rIndex = x[index].right.findIndex((i) => i === item) * 2;

			let prop = x[index].rightProps[rIndex];
			x[index].rightProps[rIndex] = {
				value: prop.value,
				opacity: 0,
				hide: true
			};
			if (rIndex < x[index].rightProps.length - 1) {
				x[index].rightProps[rIndex + 1] = {
					value: ',',
					opacity: 0,
					hide: true
				};
			}
			return x;
		});
		await wait(1000);
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
		await wait(500);
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

	onMount(async () => {
		for (let i = 0; i < $set.length; i++) {
			selectLSymbol(setId, i, 'blue', false);
		}
	});

	$: maxHeight = lineHeight * Math.max($set.length, 1);
</script>

<CardBox minWidth={charWidth} minHeight={lineHeight} {maxHeight} {color} {label}>
	{#each $set as item, index}
		<p
			id="{setId}set{index}"
			style="line-height: {lineHeight}px;font-size:{fontSize}px; padding: 0px; width: fit-content"
		>
			<span
				id="{setId}l{index}"
				style="width:{charWidth * item.left.length + subCharWidth * (item.note?.length ?? 0)}px"
				>{item.left}<span
					style="font-size: {subFontSize}px; position: absolute;transform: translate(0px, {0.3 *
						fontSize}px)">{item.note ?? ''}</span
				></span
			>
			{#if item.showRight}
				<span in:setItemIn={{ duration: 500, delay: 0 }}>{':'}</span>
				<span in:setItemIn={{ duration: 500, delay: 100 }} id="{setId}r{index}--1">{'{'}</span>

				{#each item.rightProps as text, ri (`${index}-${item.right[Math.floor(ri / 2.0)]}-${text.value}`)}
					<p
						style="transition: opacity 0.5s 0.2s, width 0.5s;width: {charWidth *
							(text.value === ''
								? 1
								: text.hide
									? 0
									: text.value.length)}px;opacity:{text.opacity};{text.value === ''
							? "font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
							: ''}"
						id="{setId}r{index}-{ri}"
					>
						{#if text.value === ''}
							&#x03B5;
						{:else if text.value != ' '}
							{text.value}
						{:else}
							&nbsp;
						{/if}
					</p>
				{/each}

				<span
					in:setItemIn={{ duration: 500, delay: 200 }}
					id="{setId}r{index}-{item.rightProps.length}">{'}'}</span
				>{/if}
		</p>
	{/each}
</CardBox>

<style>
	p > span:nth-child(2) {
		margin-left: 5px;
	}
	p {
		padding: 0px;
		display: flex;
	}
</style>
