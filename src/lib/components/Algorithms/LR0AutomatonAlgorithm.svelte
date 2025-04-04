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
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import Lr0AutomatonInfo from '@/Info/LR0AutomatonInfo.svelte';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {StateCard | undefined}*/
	let originStateElem;
	/**@type {StateCard | undefined}*/
	let targetStateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem;
	/**@type {PseudoCode | undefined}*/
	let codeCard;
	/**@type {PseudoCode | undefined}*/
	let closureCodeCard;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let targetState = writable([]);
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
		return new Promise(async (resolve, reject) => {
			try {
				await closureCodeCard?.highlightLines([0]); // Lines 0-2: Initialize closure and items_to_check
				await closureCodeCard?.highlightLines([1]);
				await closureCodeCard?.highlightLines([2]);

				let itemsToCheck = [...$targetState];
				while (itemsToCheck.length > 0) {
					await closureCodeCard?.highlightLines([3]); // Line 3: While items_to_check not empty
					await closureCodeCard?.highlightLines([4]); // Line 4: Get first item
					let item = itemsToCheck[0];
					let index = $targetState.findIndex(
						(x) => x.ruleIndex === item.ruleIndex && x.pos === item.pos
					);
					await targetStateSelection.selectFor(`state-${targetStateElem?.getId()}-${index}`);
					let symbol = augRules[item.ruleIndex].right[item.pos];
					await closureCodeCard?.highlightLines([5]); // Line 6: Check if symbol is non-terminal
					if (!nt.includes(symbol)) {
						await closureCodeCard?.highlightLines([6, 7]); // Lines 7-8: Remove item and continue
						itemsToCheck.shift();
						continue;
					}

					await closureCodeCard?.highlightLines([8]); // Line 9: Loop through productions
					for (let rule of augRules) {
						await closureCodeCard?.highlightLines([9]); // Line 10: Check production left side
						if (!(rule.left === symbol)) continue;
						await closureCodeCard?.highlightLines([11]); // Line 12: Check for existing item
						if ($targetState.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;

						await selectSymbol(
							`state-${targetStateElem?.getId()}-${index}-${item.pos}`,
							colors.pink,
							false
						);
						await closureCodeCard?.highlightLines([13, 14]); // Lines 14-15: Add new items
						await targetStateElem?.addItem(rule.index, 0, null, `gl${rule.index}`);
						itemsToCheck.push({ ruleIndex: rule.index, pos: 0, lookahead: null });
					}
					await deselectSymbol(`state-${targetStateElem?.getId()}-${index}-${item.pos}`);
					await closureCodeCard?.highlightLines([15]); // Line 16: Remove processed item
					itemsToCheck.shift();
				}
				targetStateSelection.hideSelect();
				await closureCodeCard?.highlightLines([]);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}
	async function buildAutomaton() {
		try {
			await loadGrammar();
			await wait(500);

			await codeCard?.highlightLines([0]); // Line 0: Algorithm header
			/**@type {import('@/types').LR0Automaton}*/
			let automaton = { states: [], transitions: new Map() };
			await codeCard?.highlightLines([1]); // Line 1: Initialize automaton

			await codeCard?.highlightLines([2]); // Line 2: Create estado0
			await targetStateElem?.addItem(0, 0, null, `gl0`);

			await codeCard?.highlightLines([3]); // Line 3: Initialize filaEstados
			// (State stack initialized implicitly)

			await codeCard?.highlightLines([4]); // Line 4: Apply closure
			await closure();

			await codeCard?.highlightLines([5, 6]); // Lines 5-6: Add to automaton/queue
			automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
			automatonElem?.addNode(null, 0, automaton.states[automaton.states.length - 1], null);
			await addPause();
			await stateStackElem?.addToStack(0, 's0', '', `label-${targetStateElem?.getId()}`);

			while ($stateStack.length > 0) {
				await codeCard?.highlightLines([7]); // Line 7: While queue not empty
				await originStateElem?.resetState();
				await originStateElem?.loadState(automaton.states[stateStackElem?.first()]);

				for (let [symbolIndex, symbol] of alphabet.entries()) {
					await codeCard?.highlightLines([8]); // Line 8: For each symbol
					await symbolsSelection.selectFor(`stack-symbolList-${symbolIndex}`);
					await targetStateElem?.resetState();

					await codeCard?.highlightLines([9]); // Line 9: Initialize estado1
					// (targetStateElem reset above does this)

					for (let [prodIndex, prod] of automaton.states[stateStackElem?.first()].items.entries()) {
						await codeCard?.highlightLines([10]); // Line 10: Process items
						await stateSelection.selectFor(`state-origem-${prodIndex}`);

						await codeCard?.highlightLines([11]); // Lines 11-12: Symbol check
						if (
							prod.pos >= augRules[prod.ruleIndex].right.length ||
							augRules[prod.ruleIndex].right[prod.pos] !== symbol
						) {
							await codeCard?.highlightLines([12]);
							continue;
						}
						await selectSymbol(
							`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`,
							colors.pink,
							false
						);
						await codeCard?.highlightLines([13]); // Lines 13-14: End position check
						if (prod.pos === augRules[prod.ruleIndex].right.length - 1) {
							await codeCard?.highlightLines([14]);
							continue;
						}

						await codeCard?.highlightLines([15]); // Lines 15-16: Duplicate check
						if (
							$targetState.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1)
						) {
							await codeCard?.highlightLines([16]);
							deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`);
							continue;
						}
						deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`);
						await codeCard?.highlightLines([17]); // Line 17: Add item
						await targetStateElem?.addItem(prod.ruleIndex, prod.pos + 1);
					}

					await codeCard?.highlightLines([18]); // Lines 18-19: Empty check
					await stateSelection.hideSelect();
					if ($targetState.length === 0) {
						await codeCard?.highlightLines([19]);
						continue;
					}

					await codeCard?.highlightLines([20]); // Line 20: Closure
					await closure();

					await codeCard?.highlightLines([21]); // Line 21: State existence check
					let existent = automaton.states.findIndex((x) => {
						// ... state comparison logic ...
					});

					await codeCard?.highlightLines([22]); // Lines 22-26
					if (existent === -1) {
						await codeCard?.highlightLines([23]);
						automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
						automatonElem?.addNode(
							stateStackElem?.first(),
							automaton.states.length - 1,
							automaton.states[automaton.states.length - 1],
							symbol
						);
						await codeCard?.highlightLines([24]);
						await codeCard?.highlightLines([25]);
						await stateStackElem?.addToStack(
							automaton.states.length - 1,
							`s${automaton.states.length - 1}`,
							'',
							`label-${targetStateElem?.getId()}`
						);
						await codeCard?.highlightLines([26]);
						await addPause();
						continue;
					}

					await codeCard?.highlightLines([27, 28]); // Lines 27-28
					automatonElem?.addNode(stateStackElem?.first(), existent, null, symbol);
					await addPause();
				}

				await codeCard?.highlightLines([29]); // Line 29: Remove state
				await stateStackElem?.removeFromStack(0);
			}

			limitHit();
			automatonElem?.update(undefined, 10);
			await addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		symbolsSelection = getSelectionFunctions('symbolList');
		stateSelection = getSelectionFunctions('origem');
		targetStateSelection = getSelectionFunctions('destino');
		fetch('./lr0automaton.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		fetch('./lr0closure.txt').then((data) =>
			data.text().then((text) => closureCodeCard?.setPseudoCode(text))
		);
		setInfoComponent(Lr0AutomatonInfo);
		buildAutomaton();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="unit grid">
	<div class="cards-box unit" style="max-width: inherit;">
		<GrammarCard isAugmented={true} bind:loadGrammar></GrammarCard>
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
		<Automaton id="lr0" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
