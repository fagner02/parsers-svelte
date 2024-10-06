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
	import { onMount } from 'svelte';

	/**@type {StackCard}*/
	let joinStackElement;
	/**@type {SetsCard}*/
	let firstSetElement;
	/**@type {SetsCard}*/
	let joinSetElement;
	/**@type {SvgLines}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;

	/**@type {string}*/
	export let instruction;
	/** @type {Array<import('@/types').GrammarItem>} */
	export let rules;
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let joinStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>} */
	export let firstSet = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>} */
	export let joinSet = writable([]);

	/**@type {Map<number,number>}*/
	let firstIndexes = new Map();
	/**@type {Map<number,number>}*/
	let joinIndexes = new Map();

	/**@type {Array<string>}*/
	export let nt;

	export const reset = () => {
		joinStack.update(() => []);
		joinSet.update(() => []);
		firstSet.update(() => []);
		svgLines?.setHideOpacity();
		firstIndexes.clear();
		joinIndexes.clear();
		first();
	};
	setResetCall(reset);

	async function first() {
		const id = newRunningCall();

		try {
			/** @type {Map<string, boolean>}*/
			let nullable = new Map();

			for (let i = 0; i < rules.length; i++) {
				if (rules[i].right[0] == '') {
					nullable.set(rules[i].left, true);
				} else {
					nullable.set(rules[i].left, nullable.get(rules[i].left) ?? false);
				}
			}

			let changed = false;
			while (changed) {
				for (let j = 0; j < rules.length; j++) {
					if (nullable.get(rules[j].left)) continue;
					let isnull = true;
					for (let k = 0; k < rules[j].right.length; k++) {
						if (!nullable.get(rules[j].right[k])) {
							isnull = false;
							break;
						}
					}
					if (isnull) {
						changed = true;
						nullable.set(rules[j].left, true);
					}
				}
			}

			await wait(0);
			await loadGrammar();
			if (currentlyRunning !== id) return;
			await addPause();

			instruction = 'Since this thing is like that we have add to the stack';
			for (let i = 0; i < rules.length; i++) {
				if (currentlyRunning !== id) return;
				await firstSetElement.addSetRow(rules[i].left, i);

				let isNull = true;
				for (let j = 0; j < rules[i].right.length; j++) {
					let symbol = rules[i].right[j];
					if (nt.includes(symbol)) {
						if (!joinIndexes.has(i)) {
							await joinSetElement.addSetRow(rules[i].left, i);
						}

						const matchingRules = rules.filter((x) => x.left === symbol);
						if (currentlyRunning !== id) return;
						await joinSetElement.joinSets(
							matchingRules.map((x) => x.index),
							matchingRules.map((x) => x.left),
							i
						);
					} else {
						if (currentlyRunning !== id) return;
						await firstSetElement.joinSets([symbol], [symbol], i);
					}
					if (!(nullable.get(symbol) ?? false)) {
						isNull = false;
						break;
					}
				}
				if (isNull) {
					if (currentlyRunning !== id) return;
					await firstSetElement.joinSets([''], [''], i);
				}
			}

			for (let item of $joinSet.keys()) {
				if ($joinSet[item].right.length === 0) {
					continue;
				}
				if (currentlyRunning !== id) return;
				await joinStackElement.addToStack(item, rules[item].left, '', item.toString());

				while ($joinStack.length > 0) {
					const topKey = $joinStack[$joinStack.length - 1].data;
					const top = /**@type {Array<number>}*/ (joinSetElement.get(topKey));
					const topValue = top[0];

					let nextSet = joinSetElement.get(topValue);
					if (nextSet !== undefined && !(nextSet.length === 0)) {
						if (currentlyRunning !== id) return;
						await joinStackElement.addToStack(
							topValue,
							rules[topValue].left,
							topValue.toString(),
							topValue.toString()
						);
						continue;
					}

					const setToJoin = /**@type {Array<String>}*/ (firstSetElement.get(topValue)).filter(
						(x) => x !== ''
					);

					if (currentlyRunning !== id) return;
					await firstSetElement.joinSets(setToJoin, setToJoin, topKey);
					await addPause();
					if (currentlyRunning !== id) return;
					await joinSetElement.remove(topKey, topValue);
					await addPause();

					if (joinSetElement.get(topKey)?.length === 0) {
						if (currentlyRunning !== id) return;
						await joinStackElement.removeFromStack($joinStack.length - 1);
					}
				}
			}
			if (currentlyRunning !== id) return;
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
	<SetsCard
		setId="join"
		set={joinSet}
		setIndexes={joinIndexes}
		color={'blue'}
		label={'join set'}
		bind:this={joinSetElement}
	></SetsCard>
	<StackCard
		stack={joinStack}
		stackId="join"
		label="join stack"
		color="blue"
		bind:this={joinStackElement}
		bind:svgLines
	></StackCard>
</div>
