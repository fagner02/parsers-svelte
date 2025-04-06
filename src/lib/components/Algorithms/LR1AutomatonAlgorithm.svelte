<script>
	import { writable } from 'svelte/store';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
	import { colors, deselectSymbol, selectSymbol } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
	import { onMount } from 'svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import StateCard from '@/Cards/StateCard.svelte';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import Automaton from '@/Structures/Automaton.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import Lr1AutomatonInfo from '@/Info/LR1AutomatonInfo.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {StateCard | undefined}*/
	let originStateElem;
	/**@type {StateCard | undefined}*/
	let targetStateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let targetState = writable([]);
	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let firstSet;
	let { nt, augRules, alphabet } = getAugGrammar();
	alphabet = alphabet.filter((x) => x !== '$');
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let symbolList = writable(
		alphabet.map((x, index) => ({
			data: x,
			text: x,
			note: '',
			id: index
		}))
	);

	/**@type {PseudoCode | undefined}*/
	let codeCard;
	/**@type {PseudoCode | undefined}*/
	let closureCodeCard;

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let symbolsSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let stateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let targetStateSelection;

	function reset() {
		try {
			stateStack.update(() => []);
			originStateElem?.resetState(false);
			targetStateElem?.resetState(false);
			svgLines?.hideLine(false);
			automatonElem?.reset();
			symbolsSelection.hideSelect();
			stateSelection.hideSelect();
			targetStateSelection.hideSelect();
		} catch (e) {}
		buildAutomaton();
	}
	setResetCall(reset);

	async function closure() {
		let itemsToCheck = [...$targetState];
		await closureCodeCard?.highlightLines([0]); // Line 0: Initialize itemsParaVerificar

		while (itemsToCheck.length > 0) {
			await closureCodeCard?.highlightLines([1]); // Line 1: While loop
			const item = itemsToCheck[0];
			await closureCodeCard?.highlightLines([2]); // Line 2: Get first item

			let index = $targetState.findIndex(
				(x) => x.ruleIndex === item.ruleIndex && x.pos === item.pos
			);
			await targetStateSelection.selectFor(`state-${targetStateElem?.getId()}-${index}`);

			await closureCodeCard?.highlightLines([3]); // Line 3: Get symbol
			let symbol = augRules[item.ruleIndex].right[item.pos];

			await closureCodeCard?.highlightLines([4]); // Line 4: Non-terminal check
			if (!nt.includes(symbol)) {
				await closureCodeCard?.highlightLines([5, 6]); // Lines 5-6: Remove item
				itemsToCheck.shift();
				continue;
			}

			await closureCodeCard?.highlightLines([7]); // Line 7: Initialize lookahead
			let lookahead = new Set();

			await closureCodeCard?.highlightLines([8]); // Line 8: End position check
			if (augRules[item.ruleIndex].right.length - 1 === item.pos) {
				await closureCodeCard?.highlightLines([9]); // Line 9: Copy lookahead
				lookahead = new Set(item.lookahead);
			} else {
				await closureCodeCard?.highlightLines([10, 11]); // Lines 10-11: Else clause
				/**@type {string[]}*/
				let betaFirst = [];
				let nullable = true;

				await closureCodeCard?.highlightLines([12, 13]); // Lines 12-13: Initialize variables
				for (let i = 1; item.pos + i < augRules[item.ruleIndex].right.length; i++) {
					await closureCodeCard?.highlightLines([14]); // Line 14: Beta loop
					let beta = augRules[item.ruleIndex].right[item.pos + i];

					await closureCodeCard?.highlightLines([15]); // Line 15: Terminal check
					if (!nt.includes(beta)) {
						await closureCodeCard?.highlightLines([16, 17, 18]); // Lines 16-18
						betaFirst.push(beta);
						nullable = false;
						break;
					} else {
						await closureCodeCard?.highlightLines([19]); // Line 19: Non-terminal case
						let first = /**@type {string[]}*/ ($firstSet.find((x) => x.left === beta)?.right);

						await closureCodeCard?.highlightLines([20, 21]); // Lines 20-21
						betaFirst = betaFirst.concat(first.filter((x) => x !== ''));

						await closureCodeCard?.highlightLines([22, 23, 24]); // Lines 22-24
						if (!first.includes('')) {
							nullable = false;
							break;
						}
					}
				}

				await closureCodeCard?.highlightLines([25]); // Line 25: Nullable check
				if (nullable) {
					await closureCodeCard?.highlightLines([26]); // Line 26: Union lookaheads
					lookahead = new Set([...betaFirst, ...item.lookahead]);
				} else {
					await closureCodeCard?.highlightLines([27]); // Line 27: BetaFirst only
					lookahead = new Set(betaFirst);
				}
			}

			await closureCodeCard?.highlightLines([28]); // Line 28: Rule loop
			for (let rule of augRules) {
				await closureCodeCard?.highlightLines([29]); // Line 29: Rule check
				if (!(rule.left === symbol)) continue;

				await closureCodeCard?.highlightLines([30]); // Line 30: Find existing
				let existent = $targetState.findIndex((x) => x.ruleIndex === rule.index && x.pos === 0);

				await selectSymbol(
					`state-${targetStateElem?.getId()}-${index}-${item.pos}`,
					colors.pink,
					false
				);

				await closureCodeCard?.highlightLines([31]); // Line 31: New item check
				if (existent === -1) {
					await closureCodeCard?.highlightLines([32, 33]); // Lines 32-33
					await targetStateElem?.addItem(rule.index, 0, lookahead, `gl${rule.index}`);
					itemsToCheck.push({ ruleIndex: rule.index, pos: 0, lookahead });
					continue;
				}

				await closureCodeCard?.highlightLines([34, 35]); // Lines 34-35: Update lookahead
				await targetStateElem?.updateLookahead(lookahead, existent);
			}

			await closureCodeCard?.highlightLines([36]); // Line 36: Remove item
			itemsToCheck.shift();
		}

		targetStateSelection.hideSelect();
	}

	async function buildAutomaton() {
		try {
			await codeCard?.highlightLines([0]); // Line 0: Algorithm header
			await loadGrammar();
			await wait(500);

			/**@type {import('@/types').LR1Automaton}*/
			let automaton = { states: [], transitions: new Map() };
			await codeCard?.highlightLines([1]); // Line 1: Initialize automaton

			await codeCard?.highlightLines([2]); // Line 2: Create initial state
			await targetStateElem?.addItem(0, 0, new Set(['$']), `gl0`);

			await codeCard?.highlightLines([3]); // Line 3: Apply closure
			await closure();

			await codeCard?.highlightLines([4]); // Line 4: Add to automaton
			automaton.states.push({ index: 0, items: [...$targetState] });
			automatonElem?.addNode(null, 0, automaton.states[0], null);

			await addPause();

			await codeCard?.highlightLines([5]); // Line 5: Initialize stack
			await stateStackElem?.addToStack(0, 's0', '', `label-${targetStateElem?.getId()}`);

			await codeCard?.highlightLines([6]); // Line 6: While stack not empty
			while ($stateStack.length > 0) {
				await codeCard?.highlightLines([7]); // Line 7: Get current state
				await originStateElem?.resetState();
				await originStateElem?.loadState(automaton.states[stateStackElem?.first()]);

				await codeCard?.highlightLines([8]); // Line 8: Symbol loop
				for (let [symbolIndex, symbol] of alphabet.entries()) {
					await symbolsSelection.selectFor(`stack-symbolList-${symbolIndex}`);
					await targetStateElem?.resetState();

					await codeCard?.highlightLines([9]); // Line 9: Initialize new state
					await codeCard?.highlightLines([10]); // Line 10: Item loop
					for (let [prodIndex, prod] of automaton.states[stateStackElem?.first()].items.entries()) {
						await stateSelection.selectFor(`state-origem-${prodIndex}`);

						await codeCard?.highlightLines([11]); // Line 11: Symbol match check
						if (
							prod.pos >= augRules[prod.ruleIndex].right.length ||
							augRules[prod.ruleIndex].right[prod.pos] !== symbol
						) {
							continue;
						}
						await selectSymbol(
							`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`,
							colors.pink,
							false
						);

						await codeCard?.highlightLines([12]); // Line 12: Add advanced item
						let existent = $targetState.findIndex(
							(x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1
						);
						if (existent === -1) {
							await targetStateElem?.addItem(
								prod.ruleIndex,
								prod.pos + 1,
								prod.lookahead,
								`state-${originStateElem?.getId()}-${prodIndex}`
							);
						} else {
							await targetStateElem?.updateLookahead(prod.lookahead, existent);
						}

						deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`);
					}
					await stateSelection.hideSelect();
					await codeCard?.highlightLines([13]); // Line 13: Apply closure
					if ($targetState.length === 0) continue;
					await closure();

					await codeCard?.highlightLines([14]); // Line 14: State existence check
					let existent = automaton.states.findIndex((x) => {
						if (x.items.length != $targetState.length) return false;
						let eq = true;
						for (let k = 0; k < x.items.length; k++) {
							let match = false;

							for (let m = 0; m < $targetState.length; m++) {
								match =
									match ||
									(x.items[k].pos === $targetState[m].pos &&
										x.items[k].ruleIndex === $targetState[m].ruleIndex &&
										x.items[k].lookahead.size === $targetState[m].lookahead?.size &&
										x.items[k].lookahead.values().every((x) => $targetState[m].lookahead.has(x)));
								if (match) break;
							}
							eq = match;
							if (!eq) break;
						}
						return eq;
					});

					if (existent === -1) {
						await codeCard?.highlightLines([16, 17, 18]); // Lines 16-18: New state handling
						automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
						automatonElem?.addNode(
							stateStackElem?.first(),
							automaton.states.length - 1,
							automaton.states[automaton.states.length - 1],
							symbol
						);
						await stateStackElem?.addToStack(
							automaton.states.length - 1,
							`s${automaton.states.length - 1}`,
							'',
							`label-${targetStateElem?.getId()}`
						);
						await addPause();
						continue;
					}

					await codeCard?.highlightLines([15]); // Line 15: Existing transition
					automatonElem?.addNode(
						stateStackElem?.first(),
						existent,
						automaton.states[automaton.states.length - 1],
						symbol
					);
					await addPause();
				}

				await codeCard?.highlightLines([20]); // Line 20: Remove state
				await stateStackElem?.removeFromStack(0);
			}

			limitHit();
			automatonElem?.update(undefined, 10);
			await addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		symbolsSelection = getSelectionFunctions('symbolList');
		stateSelection = getSelectionFunctions('origem');
		targetStateSelection = getSelectionFunctions('destino');

		fetch('./lr1automaton.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		fetch('./lr1closure.txt').then((data) =>
			data.text().then((text) => closureCodeCard?.setPseudoCode(text))
		);

		setInfoComponent(Lr1AutomatonInfo);
		buildAutomaton();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="grid unit" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div class="cards-box unit">
		<GrammarCard isAugmented={true} bind:loadGrammar></GrammarCard>
		<SetsCard set={firstSet} label="first" setId="first" hue={colors.blue}></SetsCard>
		<StateCard
			state={targetState}
			stateId={'destino'}
			label={'estado destino'}
			hue={colors.pink}
			bind:this={targetStateElem}
			bind:svgLines
		></StateCard>
		<StateCard
			state={originState}
			stateId={'origem'}
			label={'estado origem'}
			hue={colors.pink}
			bind:this={originStateElem}
			bind:svgLines
		></StateCard>
		<StackCard
			stack={stateStack}
			stackId="temp"
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
		<StackCard
			stack={symbolList}
			stackId="symbolList"
			label="alfabeto"
			hue={colors.green}
			reversed={false}
			bind:svgLines
		></StackCard>
	</div>
	<div class="unit">
		<PseudoCode bind:this={closureCodeCard} id="closure"></PseudoCode>
		<PseudoCode bind:this={codeCard}></PseudoCode>

		<Automaton id="lr1" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
