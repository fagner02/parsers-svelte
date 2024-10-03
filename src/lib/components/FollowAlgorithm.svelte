<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/SvgLines.svelte';
	import { wait, addPause, limitHit, setResetCall, newRunningCall } from '$lib/flowControl';
	import { selectRSymbol } from '$lib/selectSymbol';
	import { onMount } from 'svelte';

	/**@type {SetsCard}*/
	let followSetElement;
	/**@type {SetsCard}*/
	let joinSetElement;
	/**@type {StackCard}*/
	let joinStackElement;
	/**@type {SvgLines}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {string}*/
	export let instruction;

	/** @type {Array<import('@/types').GrammarItem>} */
	export let rules;
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	export let followSet = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let joinSet = writable([]);
	/**@type {Map<string, number>}*/
	let joinIndexes = new Map();
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let joinStack = writable([]);

	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let firstSet;

	let nt = ['S', 'A', 'Bb'];
	/**@type {Map<string, number>}*/
	let followIndexes = new Map();

	export function reset() {
		followSet.update(() => []);
		followIndexes = new Map();
		joinSet.update(() => []);
		joinIndexes = new Map();
		svgLines.setHideOpacity();
		follow();
	}
	setResetCall(reset);
	/**
	 * @type {(() => void) | null}
	 */
	export let callback = null;

	/**
	 * @param {string} symbol
	 * @param {string[]} values
	 */
	async function addToJoinSet(symbol, values) {
		let joinIndex = joinIndexes.get(symbol);

		if (joinIndex === undefined) {
			await joinSetElement.addSetRow(symbol, symbol);
			joinIndex = /**@type {number}*/ (joinIndexes.get(symbol));
		}

		await joinSetElement.joinSets(values, values, joinIndex);
	}

	async function follow() {
		const id = newRunningCall();
		try {
			await wait(100);
			await loadGrammar();
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';
			await followSetElement.addSetRow(rules[0].left, rules[0].left);
			await followSetElement.joinSets(
				['$'],
				['$'],
				/**@type {number}*/ (followIndexes.get(rules[0].left))
			);

			for (let i = 0; i < rules.length; i++) {
				for (let j = 0; j < rules[i].right.length; j++) {
					await selectRSymbol('g', i, j, 'green', true);

					const symbol = rules[i].right[j];
					const followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

					if (nt.includes(symbol)) {
						if (!followIndexes.has(symbol)) {
							await followSetElement.addSetRow(symbol, symbol);
						}
						if (followingSymbol === null) {
							await addToJoinSet(symbol, [rules[i].left]);
						} else {
							await selectRSymbol('g', i, j + 1, 'yellow', true);
							if (nt.includes(followingSymbol)) {
								let empty = false;
								for (let item of $firstSet) {
									if (item.left === followingSymbol) {
										if (item.right.includes('')) {
											empty = true;
											continue;
										}
										const followIndex = /**@type {number}*/ (followIndexes.get(symbol));
										await followSetElement.joinSets(item.right, item.right, followIndex);
									}
								}

								if (empty) {
									await addToJoinSet(symbol, [rules[i].right[j]]);
								}
							} else {
								let followIndex = /**@type {number}*/ (followIndexes.get(symbol));
								if (followIndex === undefined) {
									await followSetElement.addSetRow(symbol, symbol);
									followIndex = /**@type {number}*/ (followIndexes.get(symbol));
								}
								await followSetElement.joinSets([followingSymbol], [followingSymbol], followIndex);
							}
						}
						// await addPause();
					}
				}
			}
			for (let item of joinIndexes.keys()) {
				await joinStackElement.addToStack(item, item, '', item);
				// await addPause();
			}
			// await joinStackElement.addToStack($joinSet[0].left, $joinSet[0].left, '', $joinSet[0].left);
			// await addPause();
			while ($joinStack.length > 0) {
				const top =
					$joinSet[/**@type {number}*/ (joinIndexes.get($joinStack[$joinStack.length - 1].data))];

				if (joinIndexes.has(top.right[0])) {
					await joinStackElement.addToStack(top.right[0], top.right[0], '', top.right[0]);
					continue;
				}
				const followIndex = /**@type {number}*/ (followIndexes.get(top.left));
				const joinIndex = /**@type {number}*/ (followIndexes.get(top.right[0]));
				await followSetElement.joinSets(
					$followSet[joinIndex].right,
					$followSet[joinIndex].right,
					followIndex
				);

				top.right.splice(0, 1);
				joinSet.update((x) => {
					x[
						/**@type {number}*/ (joinIndexes.get($joinStack[$joinStack.length - 1].data))
					].rightProps.splice(0, 1);
					return x;
				});

				if (top.right.length === 0) {
					await joinStackElement.removeFromStack($joinStack.length - 1);
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

	async function setup() {
		reset();
	}

	onMount(() => {
		setup();
	});
</script>

<SvgLines svgId="follow-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit">
	<GrammarCard {rules} bind:loadGrammar></GrammarCard>
	<SetsCard
		setId="follow"
		useNote={false}
		set={followSet}
		setIndexes={followIndexes}
		color={'blue'}
		label={'follow set'}
		bind:this={followSetElement}
	></SetsCard>
	<SetsCard
		setId="first"
		useNote={false}
		set={firstSet}
		setIndexes={followIndexes}
		color={'blue'}
		label={'first set'}
	></SetsCard>
	<SetsCard
		setId="join"
		useNote={false}
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
