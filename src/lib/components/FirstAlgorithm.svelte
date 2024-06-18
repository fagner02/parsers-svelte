<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import {
		wait,
		addPause,
		limitHit,
		setResetCall,
		newRunningCall,
		currentlyRunning
	} from '$lib/flowControl';
	import { selectLSymbol, selectRSymbol } from '$lib/selectSymbol';
	import { onMount } from 'svelte';

	/**@type {StackCard}*/
	let symbolStackElement;
	/**@type {SetsCard}*/
	let firstSetElement;
	/**@type {SvgLines}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;

	/**@type {string}*/
	export let instruction;
	/** @type {Array<import('@/types').GrammarItem>} */
	export let rules;
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let symbolStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>} */
	export let firstSet = writable([]);

	/**@type {Map<number,number>}*/
	let firstIndexes = new Map();

	let nt = ['S', 'A', 'Bb'];

	/** @param {number} currentRule */
	async function getProdSymbol(currentRule) {
		await selectRSymbol('g', currentRule, 0, 'green', true);
		return rules[currentRule].right[0];
	}

	export const reset = () => {
		symbolStack.update(() => []);
		firstSet.update(() => []);
		svgLines.setHideOpacity();
		firstIndexes.clear();
		first();
	};
	setResetCall(reset);

	/**
	 * @param {string} currentSymbol
	 */
	async function addProdToStacks(currentSymbol) {
		for (let i1 = 0; i1 < rules.length; i1++) {
			if (rules[i1].left === currentSymbol) {
				await symbolStackElement.addToStack(
					i1,
					rules[i1].left,
					rules[i1].index.toString(),
					rules[i1].index.toString(),
					`#gl${i1}`
				);
			}
		}
	}

	function nullable(
		/** @type {Array<import('@/types').GrammarItem>} */ rules,
		/** @type {string} */ symbol
	) {
		const matchingRules = rules.filter((x) => x.left === symbol);
		for (let rule of matchingRules) {
			if (rule.right[0] === '') {
				return true;
			}
		}
		return false;
	}

	async function first() {
		const id = newRunningCall();

		try {
			await wait(0);
			await loadGrammar();
			if (currentlyRunning !== id) return;
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';
			for (let i = 0; i < rules.length; i++) {
				if (currentlyRunning !== id) return;
				await symbolStackElement.addToStack(
					i,
					rules[i].left,
					rules[i].index.toString(),
					rules[i].index.toString(),
					`#gl${i}`
				);
			}

			while ($symbolStack.length > 0) {
				if (currentlyRunning !== id) return;
				await selectLSymbol('g', $symbolStack[$symbolStack.length - 1].data, 'blue', false);

				if (!firstIndexes.has($symbolStack[$symbolStack.length - 1].data)) {
					if (currentlyRunning !== id) return;
					await firstSetElement.addSetRow(
						$symbolStack[$symbolStack.length - 1].text,
						$symbolStack[$symbolStack.length - 1].data
					);
				}
				if (currentlyRunning !== id) return;
				let symbol = await getProdSymbol($symbolStack[$symbolStack.length - 1].data);

				if (nt.includes(symbol)) {
					const matchingRules = rules.filter((x) => x.left === symbol);

					let complete = true;
					for (let rule of matchingRules) {
						const firstIndex = firstIndexes.get(rule.index);
						if (firstIndex !== undefined) {
							if (rule.right[0] === '') {
								let isNullable = true;
								for (let s of rules[/**@type {number}*/ ($symbolStack.at(-1)?.data)].right) {
									if (!nullable(rules, s)) {
										isNullable = false;
										break;
									}
								}
								if (isNullable) {
									const currentIndex = /**@type {number}*/ (
										firstIndexes.get($symbolStack[$symbolStack.length - 1].data)
									);
									if (currentlyRunning !== id) return;
									if (!$firstSet[currentIndex].right.includes(''))
										await firstSetElement.joinSets([''], currentIndex);
								}
							}
							if (currentlyRunning !== id) return;
							await firstSetElement.joinSets(
								$firstSet[firstIndex].right.filter((x) => x !== ''),
								/**@type {number}*/ (firstIndexes.get($symbolStack[$symbolStack.length - 1].data))
							);
						} else {
							await wait(1000);
							if (currentlyRunning !== id) return;
							await addProdToStacks(symbol);
							complete = false;
						}
					}
					if (complete) {
						if (currentlyRunning !== id) return;
						await symbolStackElement.removeFromStack($symbolStack.length - 1);
					}
				} else {
					let index = firstIndexes.get($symbolStack[$symbolStack.length - 1].data);

					while (index !== undefined) {
						if (currentlyRunning !== id) return;
						await firstSetElement.joinSets([symbol], index);
						if (currentlyRunning !== id) return;
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
		first();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit">
	<GrammarCard {rules} bind:loadGrammar></GrammarCard>
	<SetsCard
		setId="first"
		set={firstSet}
		setIndexes={firstIndexes}
		color={'blue'}
		label={'first set'}
		bind:this={firstSetElement}
	></SetsCard>
	<StackCard
		stack={symbolStack}
		stackId="symbol"
		label="symbol stack"
		color="blue"
		bind:this={symbolStackElement}
		bind:svgLines
	></StackCard>
</div>
