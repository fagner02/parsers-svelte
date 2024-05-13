<script>
	import { getContext } from 'svelte';
	import { wait } from '../lib/textwidth';

	/**
	 * @type {import('svelte/store').Writable<Array<import('./typedefs').SetRow>>}
	 */
	export let set;
	const { selectLSymbol } = getContext('StepsView');
	/**@type {number}*/
	export let charWidth;
	/**@type {Map<string, number>}*/
	export let firstIndexes;
	/**@type {HTMLElement}*/
	let firstCard;
	/**@type {number}*/
	export let lineHeight;
	export let fontSize;

	/**
	 * @param {any} node
	 * @param {{duration: number, delay: number}} params
	 */
	export function setItemIn(node, { duration, delay }) {
		return {
			delay,
			duration,
			/**
			 * @param {number} t
			 */
			css: (t) => `opacity: ${t < 0.5 ? 0 : (t - 0.5) / 0.5};
			width: ${charWidth * t}px;`
		};
	}

	/**
	 * @param {number} index
	 * @param {string} symbol
	 * @param {boolean} replace
	 */
	export async function addSetItem(index, symbol, replace = false) {
		set.update((x) => {
			x[index].rightAnim = [
				...x[index].rightAnim,
				{ value: symbol, width: replace ? charWidth : 0, opacity: 0 }
			];
			return x;
		});
		await wait(50);
		set.update((x) => {
			x[index].rightAnim[x[index].rightAnim.length - 1] = {
				value: symbol,
				width: charWidth,
				opacity: 1
			};
			return x;
		});
		await wait(500);
	}

	/**
	 * @param {Array<string>} symbols
	 * @param {number} index
	 */
	export async function joinSets(symbols, index) {
		if ($set[index].rightAnim[0].value === ' ') {
			$set[index].rightAnim.pop();
		}
		for (let i = 0; i < symbols.length; i++) {
			if ($set[index].right.find((x) => x === symbols[i]) === undefined) {
				set.update((x) => {
					x[index].right = [...x[index].right, symbols[i]];
					return x;
				});
				if ($set[index].rightAnim.length > 0) {
					await addSetItem(index, ',');
				}

				await addSetItem(index, symbols[i], $set[index].rightAnim.length === 0);
			}
		}
	}

	/**
	 * @param {string} symbol
	 * @param {number} index
	 */
	export async function addSetRow(index, symbol) {
		firstIndexes.set(symbol, $set.length);
		set.update((x) => [
			...x,
			{
				left: symbol,
				right: [],
				showRight: false,
				rightAnim: [{ value: ' ', width: charWidth, opacity: 0 }]
			}
		]);

		firstCard.style.height = `${lineHeight * $set.length}px`;
		await wait(0);

		await selectLSymbol('f', /**@type {number}*/ (firstIndexes.get(symbol)), 'blue', false);

		set.update((x) => {
			x[/**@type {number}*/ (firstIndexes.get(symbol))].showRight = true;
			return x;
		});
		await wait(0);
	}

	/**
	 * @param {HTMLElement} node
	 */
	function setCard(node) {
		firstCard = node;
	}
</script>

<div
	class="card first-card"
	style="min-width: {charWidth}px; min-height: {lineHeight}px"
	use:setCard
>
	{#each $set as f, index}
		<p
			id="fset{index}"
			style="line-height: {lineHeight}px;font-size:{fontSize}px; padding: 0px; width: fit-content"
		>
			<span id="fl{index}">{f.left}</span>
			{#if f.showRight}
				<span in:setItemIn={{ duration: 500, delay: 0 }}>{':'}</span>
				<span in:setItemIn={{ duration: 500, delay: 100 }}>{'{'}</span>

				{#each f.rightAnim as text, ri (`${index}-${ri}`)}
					<span style="width: {text.width}px;opacity:{text.opacity};" id="fr{index}-{ri}">
						{#if text.value != ' '}
							{text.value}
						{:else}
							&nbsp;
						{/if}</span
					>
				{/each}

				<span in:setItemIn={{ duration: 500, delay: 200 }}>{'}'}</span>
			{/if}
		</p>
	{/each}
</div>

<style>
	@import './block.css';
	@import 'card.css';
	.first-card > p > span:nth-child(2) {
		margin-left: 5px;
	}
	.first-card > p {
		padding: 0px;
		display: flex;
	}
</style>
