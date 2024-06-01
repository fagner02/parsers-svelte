<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { wait } from '$lib/utils';
	import { selectLSymbol, selectRSymbol } from '$lib/selectSymbol';
	import { onMount } from 'svelte';

	/**@type {StackCard}*/
	let symbolStackElement;
	/**@type {StackCard}*/
	let posStackElement;
	/**@type {SetsCard}*/
	let firstSetElement;
	/**@type {SvgLines}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {() => Promise<void>}*/
	export let addPause;
	/**@type {() => void}*/
	export let limitHit;
	/**@type {string}*/
	export let instruction;

	/** @type {import('svelte/store').Writable<Array<import('@/types').GrammarItem>>} */
	let rules = writable([]);
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let symbolStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>} */
	export let firstSet = writable([]);

	export let fontSize;
	export let subFontSize;
	export let lineHeight;
	export let charWidth;
	export let subCharWidth;

	/**@type {Map<number,number>}*/
	let firstIndexes = new Map();
	let nt = ['S', 'A', 'Bb'];

	/**
	 * @param {number} currentRule
	 */
	async function getProdSymbol(currentRule) {
		await selectRSymbol('g', currentRule, 0, 'green', true);
		return $rules[currentRule].right[0];
	}

	export const reset = () => {
		rules.update(() => []);
		symbolStack.update(() => []);
		firstSet.update(() => []);
		svgLines.setHideOpacity();
		firstIndexes.clear();
		first();
	};

	/**
	 * @param {string} currentSymbol
	 */
	async function addProdToStacks(currentSymbol) {
		for (let i1 = 0; i1 < $rules.length; i1++) {
			if ($rules[i1].left === currentSymbol) {
				await symbolStackElement.addToStack(
					i1,
					$rules[i1].left,
					$rules[i1].index.toString(),
					$rules[i1].index.toString(),
					`#gl${i1}`
				);
			}
		}
	}

	async function first() {
		try {
			await wait(0);
			await loadGrammar();
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';
			for (let i = 0; i < $rules.length; i++) {
				await symbolStackElement.addToStack(
					i,
					$rules[i].left,
					$rules[i].index.toString(),
					$rules[i].index.toString(),
					`#gl${i}`
				);
			}

			while ($symbolStack.length > 0) {
				await selectLSymbol('g', $symbolStack[$symbolStack.length - 1].data, 'blue', false);

				if (!firstIndexes.has($symbolStack[$symbolStack.length - 1].data)) {
					await firstSetElement.addSetRow(
						$symbolStack[$symbolStack.length - 1].text,
						$symbolStack[$symbolStack.length - 1].data
					);
				}

				let symbol = await getProdSymbol($symbolStack[$symbolStack.length - 1].data);

				if (nt.includes(symbol)) {
					const matchingRules = $rules.filter((x) => x.left === symbol);

					let complete = true;
					for (let rule of matchingRules) {
						const firstIndex = firstIndexes.get(rule.index);
						if (firstIndex !== undefined) {
							await firstSetElement.joinSets(
								$firstSet[firstIndex].right.filter((x) => x !== ''),
								/**@type {number}*/ (firstIndexes.get($symbolStack[$symbolStack.length - 1].data))
							);
						} else {
							await wait(1000);
							await addProdToStacks(symbol);
							complete = false;
						}
					}
					if (complete) {
						await symbolStackElement.removeFromStack($symbolStack.length - 1);
					}
				} else {
					let index = firstIndexes.get($symbolStack[$symbolStack.length - 1].data);

					while (index !== undefined) {
						await firstSetElement.joinSets([symbol], index);
						await symbolStackElement.removeFromStack($symbolStack.length - 1);
						if (symbol === '') break;
						index = firstIndexes.get($symbolStack[$symbolStack.length - 1].data);
					}
				}
			}

			limitHit();
			addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		await first();
	});
</script>

<SvgLines svgId="first-svg" {lineHeight} bind:this={svgLines}></SvgLines>
<div class="cards-box unit">
	<GrammarCard {fontSize} {lineHeight} {charWidth} {subCharWidth} {rules} bind:loadGrammar
	></GrammarCard>
	<SetsCard
		setId="first"
		set={firstSet}
		{charWidth}
		{subCharWidth}
		{fontSize}
		{subFontSize}
		{lineHeight}
		setIndexes={firstIndexes}
		color={'blue'}
		label={'first set'}
		bind:this={firstSetElement}
	></SetsCard>
	<StackCard
		{lineHeight}
		{charWidth}
		{subCharWidth}
		{subFontSize}
		{fontSize}
		stack={symbolStack}
		stackId="symbol"
		label="symbol stack"
		color="blue"
		bind:this={symbolStackElement}
		bind:svgLines
	></StackCard>
	<!-- <StackCard
		{lineHeight}
		{charWidth}
		{subCharWidth}
		{subFontSize}
		{fontSize}
		stack={posStack}
		stackId="pos"
		label="position stack"
		color="green"
		bind:this={posStackElement}
		bind:svgLines
	></StackCard> -->
</div>
