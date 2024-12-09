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
		while (itemsToCheck.length > 0) {
			const item = itemsToCheck[0];
			let index = $targetState.findIndex(
				(x) => x.ruleIndex === item.ruleIndex && x.pos === item.pos
			);

			await targetStateSelection.selectFor(`state-${targetStateElem?.getId()}-${index}`);
			let symbol = augRules[item.ruleIndex].right[item.pos];
			if (!nt.includes(symbol)) {
				itemsToCheck.shift();
				continue;
			}
			let lookahead = new Set();
			if (augRules[item.ruleIndex].right.length - 1 === item.pos) {
				lookahead = new Set(item.lookahead);
			} else {
				/**@type {string[]}*/
				let betaFirst = [];
				let nullable = true;
				for (let i = 1; item.pos + i < augRules[item.ruleIndex].right.length; i++) {
					let beta = augRules[item.ruleIndex].right[item.pos + i];
					if (!nt.includes(beta)) {
						betaFirst.push(beta);
						nullable = false;
						break;
					} else {
						let first = /**@type {string[]}*/ ($firstSet.find((x) => x.left === beta)?.right);
						betaFirst = betaFirst.concat(first.filter((x) => x !== ''));

						if (!first.includes('')) {
							nullable = false;
							break;
						}
					}
				}
				if (nullable) {
					lookahead = new Set([...betaFirst, ...item.lookahead]);
				} else {
					lookahead = new Set(betaFirst);
				}
			}
			for (let rule of augRules) {
				if (!(rule.left === symbol)) continue;
				let existent = $targetState.findIndex((x) => x.ruleIndex === rule.index && x.pos === 0);
				await selectSymbol(
					`state-${targetStateElem?.getId()}-${index}-${item.pos}`,
					colors.pink,
					false
				);
				if (existent === -1) {
					await targetStateElem?.addItem(rule.index, 0, lookahead, `gl${rule.index}`);
					itemsToCheck.push({ ruleIndex: rule.index, pos: 0, lookahead });
					continue;
				}
				await targetStateElem?.updateLookahead(lookahead, existent);
			}
			itemsToCheck.shift();
		}
		targetStateSelection.hideSelect();
	}

	async function buildAutomaton() {
		try {
			await loadGrammar();
			await wait(500);

			/**@type {import('@/types').LR1Automaton}*/
			let automaton = { states: [], transitions: new Map() };

			await targetStateElem?.addItem(0, 0, new Set(['$']), `gl0`);

			await closure();

			automaton.states.push({ index: 0, items: [...$targetState] });
			automatonElem?.addNode(null, 0, automaton.states[0], null);

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

					automatonElem?.addNode(
						stateStackElem?.first(),
						existent,
						automaton.states[automaton.states.length - 1],
						symbol
					);
					await addPause();
				}

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
		<Automaton id="lr1" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
