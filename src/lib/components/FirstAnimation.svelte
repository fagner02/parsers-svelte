<script>
	import { writable } from 'svelte/store';
	import { getTextWidth, wait } from '$lib/utils';
	import { onMount, setContext } from 'svelte';
	import Stack from './Cards/StackCard.svelte';
	import SetsCard from './Cards/SetsCard.svelte';
	import GrammarCard from './Cards/GrammarCard.svelte';
	import AlgorithmTab from './Tabs/AlgorithmTab.svelte';
	import anime from 'animejs';

	// ========== Components ====================
	/**@type {Stack}*/
	let symbolStackElement;
	/**@type {Stack}*/
	let posStackElement;
	/**@type {SetsCard}*/
	let firstSet;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {() => Promise<void>}*/
	let addPause;
	/**@type {() => void}*/
	let limitHit;
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

	setContext('StepsView', { selectLSymbol, selectRSymbol });

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
		if (prodPos >= 1) {
			return null;
		}
		await selectRSymbol('g', currentRule, prodPos, 'green', true);
		return $rules[currentRule].right[prodPos];
	}

	export function reset() {
		rules.update(() => []);
		symbolStack.update(() => []);
		posStack.update(() => []);
		first.update(() => []);
		firstIndexes = new Map();

		firstAlg();
	}

	/**
	 * @param {string} currentSymbol
	 */
	async function addProdToStacks(currentSymbol) {
		for (let i1 = 0; i1 < $rules.length; i1++) {
			if ($rules[i1].left === currentSymbol) {
				let elemRect = /**@type {DOMRect}*/ (
					document.querySelector(`#gl${i1}`)?.getBoundingClientRect()
				);
				let parentRect = /**@type {DOMRect}*/ (
					document.querySelector('.cards-box')?.getBoundingClientRect()
				);
				let pos = {
					x: elemRect.x - parentRect.x + elemRect.height,
					y: elemRect.y - parentRect.y + elemRect.height
				};
				await symbolStackElement.addToStack(
					i1,
					$rules[i1].left,
					$rules[i1].index.toString(),
					$rules[i1].index.toString(),
					pos
				);

				await addPause();

				await posStackElement.addToStack(
					-1,
					'-1',
					$rules[i1].index.toString(),
					$rules[i1].index.toString()
				);
			}
		}
	}

	async function firstAlg() {
		try {
			await wait(100);
			await loadGrammar();
			await addPause();

			await addProdToStacks($rules[0].left);

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
						if ($symbolStack.length == 0) {
							for (let i0 = 0; i0 < nt.length; i0++) {
								if (!firstIndexes.has(nt[i0])) {
									await addProdToStacks(nt[i0]);
								}
							}
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
							await addProdToStacks(symbol);
							break;
						}
					} else {
						let index = firstIndexes.get($rules[$symbolStack[$symbolStack.length - 1].data].left);
						await firstSet.joinSets([symbol], index);
					}
				}
			}
			limitHit();
			addPause();
		} catch {}
	}
	let code = '';
	onMount(async () => {
		code = await (await fetch('first.js')).text();
		charWidth = getTextWidth('P', fontSize);
		subCharWidth = getTextWidth('P', subFontSize);

		firstAlg();
	});
</script>

<AlgorithmTab resetCall={reset} bind:addPause bind:limitHit {code}>
	<div class="grid">
		<svg xmlns="http://www.w3.org/2000/svg" class="unit" overflow="visible">
			<defs>
				<path
					stroke-dasharray="6,10"
					id="line"
					d="M 0 0 C 20 20, 50 0, 60 10"
					stroke-linecap="round"
					fill="none"
				/>

				<path
					id="arrow"
					d="M 1 13 L 16 15 L 14.5 1"
					stroke-linejoin="round"
					stroke-linecap="round"
					fill="none"
				/>
			</defs>
			<g opacity="0" id="lines" style="transition: all 0.2s;">
				<use xlink:href="#line" stroke-width="12" stroke="white" />
				<use xlink:href="#line" stroke="black" stroke-width="4" />
				<use xlink:href="#arrow" stroke-width="12" stroke="white" />
				<use xlink:href="#arrow" stroke="black" stroke-width="4"></use>
			</g>
		</svg>
		<div class="cards-box unit">
			<GrammarCard {fontSize} {lineHeight} {charWidth} {subCharWidth} {rules} bind:loadGrammar
			></GrammarCard>
			<SetsCard
				set={first}
				{charWidth}
				{firstIndexes}
				{fontSize}
				{lineHeight}
				color={'blue'}
				label={'first set'}
				bind:this={firstSet}
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
	</div>
</AlgorithmTab>

<style>
	@import '@/block.css';
	svg {
		filter: drop-shadow(0px 3px 2px hsl(0, 0%, 0%, 30%));
		width: -webkit-fill-available;
		height: -webkit-fill-available;
		pointer-events: none;
		z-index: 1;
	}
	.cards-box {
		display: flex;
		justify-content: center;
		align-items: start;
		flex-wrap: wrap;
	}
</style>
