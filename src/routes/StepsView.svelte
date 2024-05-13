<script>
	import { writable } from 'svelte/store';
	import { getTextWidth, wait } from '$lib/textwidth';
	import { onMount, setContext } from 'svelte';
	import Stack from './Stack.svelte';
	import SetsCard from './SetsCard.svelte';
	import GrammarCard from './GrammarCard.svelte';

	// ========== Components ====================
	/**@type {Stack}*/
	let symbolStackElement;
	/**@type {Stack}*/
	let posStackElement;
	/**@type {SetsCard}*/
	let firstSet;
	// ========== Components ====================

	// ========= stores ================================================================================
	/** @type {import('svelte/store').Writable<Array.<import('./typedefs').GrammarItem>>} */
	let rules = writable([]);
	/** @type {import("svelte/store").Writable<Array<import('./typedefs').StackItem<number>>>} */
	let symbolStack = writable([]);
	/** @type {import("svelte/store").Writable<Array<import('./typedefs').StackItem<number>>>} */
	let posStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('./typedefs').SetRow>>}*/
	let first = writable([]);
	let nt = ['S', 'A', 'Bb'];
	let firstIndexes = new Map();
	// ========= stores ================================================================================

	// ========= Style ======================================
	const fontSize = 15;
	const subFontSize = 10;
	const lineHeight = 26;
	let charWidth = 0;
	let subCharWidth = 0;
	// ========= Style ======================================

	let hi = 'Hi';
	setContext('StepsView', { selectLSymbol, selectRSymbol, hi });

	/**
	 * @param {string} card
	 * @param {number} index1
	 * @param {string} color
	 * @param {boolean} empty
	 */
	async function selectLSymbol(card, index1, color, empty) {
		let symbol = /** @type {HTMLElement} */ (document.querySelector(`#${card}l${index1}`));
		symbol.classList.add(empty ? 'empty' : 'block');
		symbol.classList.add(`${color}-after`);
		await wait(500);
	}

	/**
	 * @param {string} card
	 * @param {number} index1
	 * @param {number} index2
	 * @param {string} color
	 * @param {boolean} empty
	 */
	async function selectRSymbol(card, index1, index2, color, empty) {
		let symbol = /** @type {HTMLElement} */ (
			document.querySelector(`#${card}r${index1}-${index2}`)
		);
		symbol.classList.add(empty ? 'empty' : 'block');
		symbol.classList.add(`${color}-after`);
		await wait(500);
	}

	/**
	 * @param {number} currentRule
	 */
	async function nextProdSymbol(currentRule) {
		await posStackElement.updateItem(
			$posStack[$posStack.length - 1].data + 1,
			`${$posStack[$posStack.length - 1].data + 1}`.toString(),
			$posStack.length - 1
		);

		let prodPos = $posStack[$posStack.length - 1].data;
		if (prodPos >= $rules[currentRule].right.length) {
			return null;
		}
		await selectRSymbol('g', currentRule, prodPos, 'green', true);
		return $rules[currentRule].right[prodPos];
	}

	onMount(async () => {
		charWidth = getTextWidth('P', fontSize);
		subCharWidth = getTextWidth('P', subFontSize);

		let c = 0;
		let currentSymbol = $rules[c].left;
		let count = 0;
		for (let i = 0; i < $rules.length; i++) {
			if ($rules[i].left === currentSymbol) {
				await symbolStackElement.addToStack(
					i,
					$rules[i].left,
					$rules[i].index.toString(),
					$rules[i].left.length * charWidth,
					$rules[i].index.toString()
				);
				await posStackElement.addToStack(
					-1,
					'-1',
					'',
					$rules[i].left.length * charWidth,
					$rules[i].index.toString()
				);
			}
		}

		// await posStackElement.addToStack(-1, '-1', '', 2 * charWidth, $rules[0].left);

		while ($symbolStack.length > 0) {
			if ($posStack[$posStack.length - 1].data == -1) {
				await selectLSymbol('g', $symbolStack[$symbolStack.length - 1].data, 'blue', false);
			}
			if (!firstIndexes.has($rules[$symbolStack[$symbolStack.length - 1].data]?.left)) {
				await firstSet.addSetRow(
					$symbolStack[$symbolStack.length - 1].data,
					$symbolStack[$symbolStack.length - 1].text
				);
			}

			while (true) {
				let symbol = await nextProdSymbol($symbolStack[$symbolStack.length - 1].data);

				if (symbol === null) {
					await posStackElement.removeFromStack($posStack.length - 1);

					let topRule = $rules[$symbolStack[$symbolStack.length - 1].data];
					await symbolStackElement.removeFromStack($symbolStack.length - 1);
					await wait(1000);
					if ($symbolStack.length > 0) {
						let lastRule = $rules[$symbolStack[$symbolStack.length - 1].data];
						await firstSet.joinSets(
							$first[firstIndexes.get(topRule.left)].right,
							firstIndexes.get(lastRule.left)
						);
					}
					break;
				}
				if (nt.includes(symbol)) {
					if (firstIndexes.has(symbol)) {
						await firstSet.joinSets(
							$first[firstIndexes.get(symbol)].right,
							firstIndexes.get($rules[$symbolStack[$symbolStack.length - 1].data].left)
						);
					} else {
						await wait(1000);
						const ruleIndex = $rules.findIndex((x) => x.left === symbol);
						await symbolStackElement.addToStack(
							ruleIndex,
							$rules[ruleIndex].left,
							$rules[0].index.toString(),
							$rules[ruleIndex].left.length * charWidth,
							$rules[ruleIndex].left
						);
						await posStackElement.addToStack(-1, '-1', '', 2 * charWidth, $rules[ruleIndex].left);
						break;
					}
				} else {
					let index = firstIndexes.get($rules[$symbolStack[$symbolStack.length - 1].data].left);
					await firstSet.joinSets([symbol], index);
				}
			}
		}
	});
</script>

<div class="steps {$$props.class}" style="position: relative;">
	<div class="card" style="font-size: 40px; font-weight: 500;height: 35px;">
		{hi}
	</div>
	<GrammarCard {fontSize} {lineHeight} {rules}></GrammarCard>

	<SetsCard set={first} {charWidth} {firstIndexes} {fontSize} {lineHeight} bind:this={firstSet}
	></SetsCard>

	<Stack
		{lineHeight}
		{charWidth}
		{subCharWidth}
		{subFontSize}
		stack={symbolStack}
		{fontSize}
		stackId="symbol"
		label="symbol stack"
		color="blue"
		bind:this={symbolStackElement}
	></Stack>

	<Stack
		{lineHeight}
		{charWidth}
		{subCharWidth}
		{subFontSize}
		stack={posStack}
		{fontSize}
		stackId="pos"
		label="position stack"
		color="green"
		bind:this={posStackElement}
	></Stack>
</div>

<style>
	@import 'block.css';
	@import 'card.css';
	.steps {
		display: flex;
		justify-content: center;
		align-items: start;
		flex-wrap: wrap;
	}

	.floating {
		position: absolute;
		width: fit-content;
		background: hsl(200, 60%, 50%);
		color: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 6px;
		transition:
			top 0.5s,
			left 0.5s,
			opacity 0.5s;
	}
</style>
