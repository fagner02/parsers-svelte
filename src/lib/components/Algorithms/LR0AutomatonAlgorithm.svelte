<script>
	import { writable } from 'svelte/store';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
	import { colors, deselectSymbol, selectSymbol } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import { onMount } from 'svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import StateCard from '@/Cards/StateCard.svelte';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import Automaton from '@/Structures/Automaton.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';

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
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let targetState = writable([]);
	let { nt, rules, alphabet } = getGrammar();
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
		} catch (e) {}
		buildAutomaton();
	}
	setResetCall(reset);

	async function closure() {
		return new Promise(async (resolve, reject) => {
			try {
				let itemsToCheck = [...$targetState];
				while (itemsToCheck.length > 0) {
					let item = itemsToCheck[0];
					let index = $targetState.findIndex(
						(x) => x.ruleIndex === item.ruleIndex && x.pos === item.pos
					);
					await targetStateSelection.selectFor(`state-${targetStateElem?.getId()}-${index}`);
					let symbol = rules[item.ruleIndex].right[item.pos];
					if (!nt.includes(symbol)) {
						itemsToCheck.shift();
						continue;
					}

					for (let rule of rules) {
						if (!(rule.left === symbol)) continue;
						if ($targetState.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;

						await selectSymbol(
							`state-${targetStateElem?.getId()}-${index}-${item.pos}`,
							colors.pink,
							false
						);
						await targetStateElem?.addItem(rule.index, 0, null, `gl${rule.index}`);
						itemsToCheck.push({ ruleIndex: rule.index, pos: 0, lookahead: null });
					}
					await deselectSymbol(`state-${targetStateElem?.getId()}-${index}-${item.pos}`);
					itemsToCheck.shift();
				}
				targetStateSelection.hideSelect();
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

			/**@type {import('@/types').LR0Automaton}*/
			let automaton = { states: [], transitions: new Map() };

			await targetStateElem?.addItem(0, 0, null, `gl0`);

			await closure();

			automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
			automatonElem?.addNode(null, 0, automaton.states[automaton.states.length - 1], null);
			await addPause();

			await stateStackElem?.addToStack(0, 's0', '', `label-${targetStateElem?.getId()}`);

			while ($stateStack.length > 0) {
				await originStateElem?.resetState();
				await originStateElem?.loadState(automaton.states[stateStackElem?.first()]);
				for (let [symbolIndex, symbol] of alphabet.entries()) {
					await symbolsSelection.selectFor(`stack-symbolList-${symbolIndex}`);
					await targetStateElem?.resetState();

					for (let [prodIndex, prod] of automaton.states[stateStackElem?.first()].items.entries()) {
						await stateSelection.selectFor(`state-origem-${prodIndex}`);
						if (
							prod.pos >= rules[prod.ruleIndex].right.length ||
							rules[prod.ruleIndex].right[prod.pos] !== symbol
						) {
							continue;
						}
						await selectSymbol(
							`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`,
							colors.pink,
							false
						);
						if (
							$targetState.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1)
						) {
							deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`);
							continue;
						}
						deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`);
						await targetStateElem?.addItem(prod.ruleIndex, prod.pos + 1);
					}
					await stateSelection.hideSelect();
					if ($targetState.length === 0) continue;
					await closure();
					let existent = automaton.states.findIndex((x) => {
						if (x.items.length != $targetState.length) return false;
						let eq = true;
						for (let k = 0; k < x.items.length; k++) {
							let match = false;
							for (let m = 0; m < $targetState.length; m++) {
								match =
									match ||
									(x.items[k].pos === $targetState[m].pos &&
										x.items[k].ruleIndex === $targetState[m].ruleIndex);
								if (match) break;
							}
							eq = match;
							if (!eq) break;
						}
						return eq;
					});
					if (existent === -1) {
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

					automatonElem?.addNode(stateStackElem?.first(), existent, null, symbol);
					await addPause();
				}

				await stateStackElem?.removeFromStack(0);
			}
			limitHit();
			await addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		symbolsSelection = getSelectionFunctions('symbolList');
		stateSelection = getSelectionFunctions('origem');
		targetStateSelection = getSelectionFunctions('destino');
		buildAutomaton();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div style="flex: 0;display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap">
		<GrammarCard bind:loadGrammar></GrammarCard>
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
	<div style="padding: 5px; padding-bottom: 10px;flex: 1; height: 100%;">
		<Automaton bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
