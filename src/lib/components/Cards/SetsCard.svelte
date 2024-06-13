<script>
	import { selectLSymbol } from '$lib/selectSymbol';
	import { wait } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import CardBox from './CardBox.svelte';
	import { charWidth, fontSize, lineHeight, subCharWidth, subFontSize } from '$lib/globalStyle';

	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	export let set;
	/**@type {Map<any, number>}*/
	export let setIndexes = new Map();
	/**@type {string}*/
	export let setId;
	export let useNote = true;

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
	export async function addSetItem(index, symbol) {
		try {
			set.update((x) => {
				x[index].rightProps = [...x[index].rightProps, { value: symbol, opacity: 0 }];
				return x;
			});
			await wait(50);
			set.update((x) => {
				x[index].rightProps[x[index].rightProps.length - 1] = {
					value: symbol,
					opacity: 1
				};
				return x;
			});
			await wait(500);
		} catch {}
	}

	/**
	 * @param {Array<string>} symbols
	 * @param {number} index
	 */
	export async function joinSets(symbols, index) {
		try {
			if ($set[index].rightProps[0].value === ' ') {
				$set[index].rightProps.pop();
			}
			for (let i3 = 0; i3 < symbols.length; i3++) {
				if ($set[index].right.find((x) => x === symbols[i3]) === undefined) {
					set.update((x) => {
						x[index].right = [...x[index].right, symbols[i3]];
						return x;
					});
					if ($set[index].rightProps.length > 0) {
						await addSetItem(index, ',');
					}

					await addSetItem(index, symbols[i3]);
				}
			}
		} catch {}
	}

	/**
	 * @param {string} symbol
	 * @param {any} indexMapIdentifier
	 */
	export async function addSetRow(symbol, indexMapIdentifier) {
		try {
			setIndexes.set(indexMapIdentifier, $set.length);
			set.update((x) => [
				...x,
				{
					left: symbol,
					right: [],
					showRight: false,
					rightProps: [{ value: ' ', opacity: 0 }],
					note: useNote ? indexMapIdentifier.toString() : ''
				}
			]);

			await wait(0);

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
		} catch {}
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
				<span in:setItemIn={{ duration: 500, delay: 100 }}>{'{'}</span>

				{#each item.rightProps as text, ri (`${index}-${ri}`)}
					<p
						style="transition: opacity 0.5s 0.2s, width 0.5s;width: {charWidth *
							(text.value === '' ? 1 : text.value.length)}px;opacity:{text.opacity};{text.value ===
						''
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

				<span in:setItemIn={{ duration: 500, delay: 200 }}>{'}'}</span>
			{/if}
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
