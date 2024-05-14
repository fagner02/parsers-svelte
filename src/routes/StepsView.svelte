<script>
	import { writable } from 'svelte/store';
	import {
		getTextWidth,
		wait,
		pause,
		killPause,
		jumpWaitTrue,
		jumpWaitFalse,
		killAllWaits
	} from '$lib/utils';
	import { onMount, setContext } from 'svelte';
	import PlaySkipBack from './Icons/PlaySkipBack.svelte';
	import PlaySkipForward from './Icons/PlaySkipForward.svelte';
	import Reload from './Icons/Reload.svelte';
	import Restore from './Icons/Restore.svelte';
	import Stack from './StackCard.svelte';
	import SetsCard from './SetsCard.svelte';
	import GrammarCard from './GrammarCard.svelte';
	import Restart from './Icons/Restart.svelte';

	// jumpWaitTrue();
	// ========== Components ====================
	/**@type {Stack}*/
	let symbolStackElement;
	/**@type {Stack}*/
	let posStackElement;
	/**@type {SetsCard}*/
	let firstSet;
	/**@type {(() => Promise<void>)} */
	let loadGrammar;
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
	let animating = false;
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

	function reset() {
		killAllWaits();

		rules.update(() => []);
		symbolStack.update(() => []);
		posStack.update(() => []);
		first.update(() => []);
		firstIndexes = new Map();

		try {
			firstAlg();
		} catch (e) {}
	}

	async function addPause() {
		animating = false;
		try {
			await pause();
		} catch {}
		animating = true;
	}

	/**
	 * @param {string} currentSymbol
	 */
	async function addProdToStacks(currentSymbol) {
		for (let i = 0; i < $rules.length; i++) {
			if ($rules[i].left === currentSymbol) {
				await symbolStackElement.addToStack(
					i,
					$rules[i].left,
					$rules[i].index.toString(),
					$rules[i].left.length * charWidth,
					$rules[i].index.toString()
				);

				await addPause();

				await posStackElement.addToStack(
					-1,
					'-1',
					'',
					$rules[i].left.length * charWidth,
					$rules[i].index.toString()
				);
			}
		}
	}

	/**@type {(reason?: any) => void}*/
	let reje;
	async function firstAlg() {
		try {
			new Promise((resolve, reject) => {
				reje = reject;
			});
			await wait(1000);
			await loadGrammar();

			animating = true;
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
							for (let i = 0; i < nt.length; i++) {
								if (!firstIndexes.has(nt[i])) {
									await addProdToStacks(nt[i]);
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
			animating = false;
		} catch (e) {}
	}

	onMount(async () => {
		charWidth = getTextWidth('P', fontSize);
		subCharWidth = getTextWidth('P', subFontSize);

		try {
			firstAlg();
		} catch (e) {}
	});

	function forward() {
		killPause();
	}
</script>

<div class="steps {$$props.class}" style="position: relative;">
	<div class="controls">
		<button style="filter: brightness({animating ? 80 : 100}%);">
			<PlaySkipBack color="hsl(200,60%,50%)" size={15} strokeWidth={3} />
		</button>
		<button on:click={reset} style="filter: brightness({animating ? 80 : 100}%);">
			<Restart color="hsl(200,60%,50%)" size={15} strokeWidth={3}></Restart>
		</button>
		<button on:click={forward} style="filter: brightness({animating ? 80 : 100}%);">
			<PlaySkipForward color="hsl(200,60%,50%)" size={15} strokeWidth={3} />
		</button>
	</div>
	<div class="cards-box">
		<div class="card" style="font-size: 40px; font-weight: 500;height: 35px;">hi</div>

		<GrammarCard {fontSize} {lineHeight} {charWidth} {rules} bind:loadGrammar></GrammarCard>

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

<style>
	@import 'block.css';
	@import 'card.css';
	.steps {
		display: flex;
		justify-content: start;
		align-items: center;
		flex-wrap: wrap;
		flex-direction: column;
	}
	.cards-box {
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
	.controls {
		display: flex;
		gap: 10px;
		margin: 5px;
	}

	button {
		box-shadow: 0px 0px 5px 0px hsl(200, 100%, 40%, 30%);
		border: 1px solid hsl(200, 60%, 60%);
		background: hsl(200, 100%, 95%);
		transition:
			filter 0.5s,
			scale 0.1s;
	}
</style>
