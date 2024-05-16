<script>
	import { getContext } from 'svelte';
	import { wait } from '../lib/utils';

	const { selectLSymbol } = getContext('StepsView');

	/** @type {import('svelte/store').Writable<Array<import('./typedefs').SetRow>>}*/
	export let set;
	/**@type {Map<string, number>}*/
	export let firstIndexes;

	/**@type {number}*/
	export let charWidth;
	/**@type {number}*/
	export let lineHeight;
	export let fontSize;
	export let color;

	export let label;

	/**@type {HTMLElement}*/
	let firstCard;

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
		for (let i3 = 0; i3 < symbols.length; i3++) {
			if ($set[index].right.find((x) => x === symbols[i3]) === undefined) {
				set.update((x) => {
					x[index].right = [...x[index].right, symbols[i3]];
					return x;
				});
				if ($set[index].rightAnim.length > 0) {
					await addSetItem(index, ',');
				}

				await addSetItem(index, symbols[i3], $set[index].rightAnim.length === 0);
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

		firstCard.style.maxHeight = `${lineHeight * $set.length}px`;
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

<div class="set-box">
	<div
		class="card set-card"
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
	<div class="set-label {color}">{label}</div>
</div>

<style>
	@import './block.css';
	@import 'card.css';
	.set-card {
		height: fit-content;
	}
	.set-card > p > span:nth-child(2) {
		margin-left: 5px;
	}
	.set-card > p {
		padding: 0px;
		display: flex;
	}

	.set-label {
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		color: white;
	}

	.set-box {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
</style>
