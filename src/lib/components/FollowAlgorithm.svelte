<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/SvgLines.svelte';
	import {
		wait,
		addPause,
		limitHit,
		setResetCall,
		newRunningCall,
		currentlyRunning
	} from '$lib/flowControl';
	import { colors, selectRSymbol } from '$lib/selectSymbol';
	import { onMount } from 'svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import { getGrammar } from '$lib/utils';
	import PseudoCode from './PseudoCode.svelte';
	import { circIn } from 'svelte/easing';

	/**@type {SetsCard | undefined}*/
	let followSetElement;
	/**@type {SetsCard | undefined}*/
	let joinSetElement;
	/**@type {StackCard | undefined}*/
	let joinStackElement;
	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {PseudoCode}*/
	let codeCard;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {string}*/
	export let instruction;

	let { nt, rules } = getGrammar();
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

	/**@type {Map<string, number>}*/
	let followIndexes = new Map();
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions|undefined}*/
	let grammarFuncs;

	function reset() {
		followSet.update(() => []);
		followIndexes = new Map();
		joinSet.update(() => []);
		joinIndexes = new Map();
		joinStack.update(() => []);
		svgLines?.setHideOpacity();
		grammarFuncs?.hideSelect();
		follow();
	}
	setResetCall(reset);

	async function follow() {
		const id = newRunningCall();
		try {
			await wait(100);
			await loadGrammar();
			await addPause();
			instruction = 'Since this thing is like that we have add to the stack';
			await codeCard.highlightLines([0, 1]);
			if (currentlyRunning != id) return;
			await followSetElement?.addSetRow(rules[0].left, rules[0].left);
			await codeCard.highlightLines([2]);
			if (currentlyRunning != id) return;
			await followSetElement?.joinSets(['$'], ['$'], null, rules[0].left);

			for (let i = 0; i < rules.length; i++) {
				await codeCard.highlightLines([3]);
				if (currentlyRunning != id) return;
				await grammarFuncs?.selectFor(`gset${i}`);
				for (let j = 0; j < rules[i].right.length; j++) {
					await codeCard.highlightLines([4]);
					if (currentlyRunning != id) return;
					const symbol = rules[i].right[j];

					await codeCard.highlightLines([5]);
					let followingSymbolIndex = j + 1;
					let followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

					await codeCard.highlightLines([6]);
					if (!nt.includes(symbol)) {
						await codeCard.highlightLines([7]);
						if (currentlyRunning != id) return;
						await selectRSymbol('g', i, j, colors.green, false);
						continue;
					}
					await codeCard.highlightLines([8]);
					if (currentlyRunning != id) return;
					await selectRSymbol('g', i, j, colors.blue, false);

					if (!followIndexes.has(symbol)) {
						await codeCard.highlightLines([9]);
						if (currentlyRunning != id) return;
						await followSetElement?.addSetRow(symbol, symbol, `gr${i}-${j}`);
					}

					await codeCard.highlightLines([10]);
					let pos = 1;
					while (true) {
						await codeCard.highlightLines([11]);
						await codeCard.highlightLines([12]);
						if (followingSymbol === null) {
							await codeCard.highlightLines([13]);
							if (!joinSetElement?.has(symbol)) {
								await codeCard.highlightLines([14]);
								if (currentlyRunning != id) return;
								await joinSetElement?.addSetRow(symbol, symbol, `gr${i}-${j}`);
							}
							await codeCard.highlightLines([15]);
							if (currentlyRunning != id) return;
							await joinSetElement?.joinSets(
								[rules[i].left],
								[rules[i].left],
								null,
								symbol,
								`gl${i}`
							);
							await codeCard.highlightLines([16]);
							break;
						}
						await codeCard.highlightLines([17]);
						if (currentlyRunning != id) return;
						await selectRSymbol('g', i, j + 1, colors.orange, false);
						if (nt.includes(followingSymbol)) {
							await codeCard.highlightLines([18]);
							let empty = false;

							for (let [key, item] of $firstSet.entries()) {
								await codeCard.highlightLines([19]);
								await codeCard.highlightLines([20]);
								if (item.left === followingSymbol) {
									await codeCard.highlightLines([21]);
									if (item.right.includes('')) {
										await codeCard.highlightLines([22, 23]);
										empty = true;
										continue;
									}
									await codeCard.highlightLines([24, 25]);
									if (currentlyRunning != id) return;
									await followSetElement?.joinSets(
										item.right,
										item.right,
										null,
										symbol,
										`firstl${key}`
									);
								}
							}
							await codeCard.highlightLines([26]);
							if (!empty) {
								await codeCard.highlightLines([27]);
								break;
							}
							await codeCard.highlightLines([28, 29]);
							followingSymbolIndex = j + 1 + pos;
							followingSymbol =
								j + 1 + pos == rules[i].right.length ? null : rules[i].right[j + 1 + pos];
							pos++;
							await codeCard.highlightLines([30]);
						} else {
							await codeCard.highlightLines([30]);
							await codeCard.highlightLines([31]);
							if (currentlyRunning != id) return;
							await followSetElement?.joinSets(
								[followingSymbol],
								[followingSymbol],
								null,
								symbol,
								`gr${i}-${followingSymbolIndex}`
							);
							await codeCard.highlightLines([32]);
							break;
						}
					}
					if (currentlyRunning != id) return;
					await selectRSymbol('g', i, j, colors.green, false);
				}
			}
			grammarFuncs?.hideSelect();
			for (let item of joinIndexes.keys()) {
				await codeCard.highlightLines([33]);
				await codeCard.highlightLines([34]);
				if (joinSetElement?.get(item)?.length === 0) {
					await codeCard.highlightLines([35]);
					continue;
				}
				await codeCard.highlightLines([36]);
				await codeCard.highlightLines([37]);
				if (currentlyRunning != id) return;
				await joinStackElement?.addToStack(
					item,
					item,
					'',
					item,
					`${joinSetElement?.getSetId()}l${joinIndexes.get(item)}`
				);
				await addPause();

				while ($joinStack.length > 0) {
					await codeCard.highlightLines([38]);
					await codeCard.highlightLines([39, 40]);
					const topKey = $joinStack[$joinStack.length - 1].data;
					const top = /**@type {Array<string>}*/ (joinSetElement?.get(topKey));

					await codeCard.highlightLines([41]);
					let nextSet = joinSetElement?.get(top[0]);
					if (nextSet !== undefined && !(nextSet.length === 0)) {
						await codeCard.highlightLines([42]);
						if (currentlyRunning != id) return;
						await joinStackElement?.addToStack(
							top[0],
							top[0],
							'',
							top[0],
							`${joinSetElement?.getSetId()}l${joinIndexes.get(top[0])}`
						);
						await codeCard.highlightLines([43]);
						continue;
					}

					if (currentlyRunning != id) return;
					await selectRSymbol(
						/**@type {string}*/ (joinSetElement?.getSetId()),
						/**@type {number}*/ (joinIndexes.get(topKey)),
						0,
						colors.green
					);

					const setToJoin = /**@type {Array<string>}*/ (followSetElement?.get(top[0]));
					await codeCard.highlightLines([44, 45]);
					if (currentlyRunning != id) return;
					await followSetElement?.joinSets(
						setToJoin,
						setToJoin,
						null,
						topKey,
						`${followSetElement.getSetId()}l${followIndexes.get(top[0])}`
					);
					await codeCard.highlightLines([46]);

					if (currentlyRunning != id) return;
					await joinSetElement?.remove(topKey, top[0]);

					await codeCard.highlightLines([47]);
					if (joinSetElement?.get(topKey)?.length === 0) {
						await codeCard.highlightLines([48]);
						if (currentlyRunning != id) return;
						await joinStackElement?.removeFromStack($joinStack.length - 1);
					}
				}
			}
			if (currentlyRunning != id) return;
			limitHit();
			addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		grammarFuncs = getSelectionFunctions('g');
		codeCard.setPseudoCode(await (await fetch('./follow.txt')).text());
		reset();
	});
</script>

<SvgLines svgId="follow-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit">
	<PseudoCode bind:this={codeCard}></PseudoCode>
	<GrammarCard bind:loadGrammar></GrammarCard>
	<SetsCard
		setId="follow"
		useNote={false}
		set={followSet}
		setIndexes={followIndexes}
		hue={colors.blue}
		label={'follow set'}
		bind:this={followSetElement}
		bind:svgLines
	></SetsCard>
	<SetsCard
		setId="first"
		useNote={false}
		set={firstSet}
		setIndexes={followIndexes}
		hue={colors.blue}
		label={'first set'}
		bind:svgLines
	></SetsCard>
	<SetsCard
		setId="join"
		useNote={false}
		set={joinSet}
		setIndexes={joinIndexes}
		hue={colors.blue}
		label={'join set'}
		bind:this={joinSetElement}
		bind:svgLines
	></SetsCard>
	<StackCard
		stack={joinStack}
		stackId="join"
		label="join stack"
		hue={colors.blue}
		bind:this={joinStackElement}
		bind:svgLines
	></StackCard>
</div>
