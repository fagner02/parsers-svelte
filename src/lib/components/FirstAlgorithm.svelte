<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { wait, addPause, limitHit, setResetCall, swapAlgorithm } from '$lib/flowControl';
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

	/**
	 * @type {(() => void) | null}
	 */
	export let callback = null;
	let count = 0;
	/**
	 * @type {number[]}
	 */
	let running = [];
	/**@type {Map<number,number>}*/
	let firstIndexes = new Map();
	let nt = ['S', 'A', 'Bb'];

	if (callback !== null) {
		swapAlgorithm(() => {});
	}
	/**
	 * @param {number} currentRule
	 */
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

	async function first() {
		if (count > 100) count = 0;
		const id = count;
		count++;
		running.splice(0, running.length);
		running.push(id);
		try {
			if (running[running.length - 1] !== id) return;
			await wait(0);
			if (running[running.length - 1] !== id) return;
			await loadGrammar();
			if (running[running.length - 1] !== id) return;
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';
			for (let i = 0; i < rules.length; i++) {
				if (running[running.length - 1] !== id) return;
				await symbolStackElement.addToStack(
					i,
					rules[i].left,
					rules[i].index.toString(),
					rules[i].index.toString(),
					`#gl${i}`
				);
			}

			while ($symbolStack.length > 0) {
				if (running[running.length - 1] !== id) return;
				await selectLSymbol('g', $symbolStack[$symbolStack.length - 1].data, 'blue', false);

				if (!firstIndexes.has($symbolStack[$symbolStack.length - 1].data)) {
					if (running[running.length - 1] !== id) return;
					await firstSetElement.addSetRow(
						$symbolStack[$symbolStack.length - 1].text,
						$symbolStack[$symbolStack.length - 1].data
					);
				}
				if (running[running.length - 1] !== id) return;
				let symbol = await getProdSymbol($symbolStack[$symbolStack.length - 1].data);

				if (nt.includes(symbol)) {
					const matchingRules = rules.filter((x) => x.left === symbol);

					let complete = true;
					for (let rule of matchingRules) {
						const firstIndex = firstIndexes.get(rule.index);
						if (firstIndex !== undefined) {
							if (running[running.length - 1] !== id) return;
							await firstSetElement.joinSets(
								$firstSet[firstIndex].right.filter((x) => x !== ''),
								/**@type {number}*/ (firstIndexes.get($symbolStack[$symbolStack.length - 1].data))
							);
						} else {
							await wait(1000);
							if (running[running.length - 1] !== id) return;
							await addProdToStacks(symbol);
							complete = false;
						}
					}
					if (complete) {
						if (running[running.length - 1] !== id) return;
						await symbolStackElement.removeFromStack($symbolStack.length - 1);
					}
				} else {
					let index = firstIndexes.get($symbolStack[$symbolStack.length - 1].data);

					while (index !== undefined) {
						if (running[running.length - 1] !== id) return;
						await firstSetElement.joinSets([symbol], index);
						if (running[running.length - 1] !== id) return;
						await symbolStackElement.removeFromStack($symbolStack.length - 1);
						if (symbol === '') break;
						index = firstIndexes.get($symbolStack[$symbolStack.length - 1].data);
					}
				}
			}
			if (callback !== null) {
				callback();
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
