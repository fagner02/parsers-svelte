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
	import { stackFloatingWindows } from '$lib/interactiveElem';

	/** @type {{id: string}} */
	let { id } = $props();
	/**@type {StackCard | undefined}*/
	let stateStackElem = $state();
	/**@type {StateCard | undefined}*/
	let originStateElem = $state();
	/**@type {StateCard | undefined}*/
	let targetStateElem = $state();
	/**@type {Automaton | undefined}*/
	let automatonElem = $state();
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();
	/**@type {PseudoCode | undefined}*/
	let closureCodeCard = $state();
	/**@type {StackCard | undefined}*/
	let symbolListElem = $state();

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let targetState = writable([]);
	let { nt, augRules, alphabet } = getAugGrammar();
	alphabet = alphabet.filter((x) => x !== '$');

	let originStateName = $state('');
	let targetStateName = $state('s?');

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
	let svgLines = $state();

	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());
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
			svgLines?.hideLine(false, id);
			automatonElem?.reset();
			symbolsSelection.hideSelect();
			stateSelection.hideSelect();
			targetStateSelection.hideSelect();
			originStateName = '';
		} catch (e) {}
		buildAutomaton();
	}
	setResetCall(reset, id);

	async function closure() {
		return new Promise(async (resolve, reject) => {
			try {
				await closureCodeCard?.highlightLines([0]);
				await closureCodeCard?.highlightLines([1]);
				await closureCodeCard?.highlightLines([2]);

				let itemsToCheck = [...$targetState];
				while (itemsToCheck.length > 0) {
					await closureCodeCard?.highlightLines([3]);
					await closureCodeCard?.highlightLines([4]);
					let item = itemsToCheck[0];
					let index = $targetState.findIndex(
						(x) => x.ruleIndex === item.ruleIndex && x.pos === item.pos
					);
					await targetStateSelection.selectFor(`state-${targetStateElem?.getId()}-${index}`);
					let symbol = augRules[item.ruleIndex].right[item.pos];
					await closureCodeCard?.highlightLines([5]);
					if (!nt.includes(symbol)) {
						await closureCodeCard?.highlightLines([6]);
						await closureCodeCard?.highlightLines([7]);
						itemsToCheck.shift();
						continue;
					}

					await closureCodeCard?.highlightLines([8]);
					for (let rule of augRules) {
						await closureCodeCard?.highlightLines([9]);
						if (!(rule.left === symbol)) continue;
						await closureCodeCard?.highlightLines([11]);
						if ($targetState.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;

						await targetStateElem?.highlightDot(index);
						await selectSymbol(
							`state-${targetStateElem?.getId()}-${index}-${item.pos}`,
							colors.pink,
							id,
							false
						);
						await closureCodeCard?.highlightLines([13, 14]);
						await targetStateElem?.addItem(rule.index, 0, null, `${id}gl${rule.index}`);
						itemsToCheck.push({ ruleIndex: rule.index, pos: 0, lookahead: null });
					}
					await deselectSymbol(`state-${targetStateElem?.getId()}-${index}-${item.pos}`, id);
					await closureCodeCard?.highlightLines([15]);
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
			await addPause(id);

			await codeCard?.highlightLines([0]);
			/**@type {import('@/types').LR0Automaton}*/
			let automaton = { states: [], transitions: new Map() };
			await codeCard?.highlightLines([1]);

			await codeCard?.highlightLines([2]);
			await targetStateElem?.addItem(0, 0, null, `${id}gl0`);

			await codeCard?.highlightLines([3]);

			await codeCard?.highlightLines([4]);
			await closure();

			await codeCard?.highlightLines([5, 6]);
			originStateName = `s${automaton.states.length}`;
			automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
			automatonElem?.addNode(null, 0, automaton.states[automaton.states.length - 1], null);
			await addPause(id);
			await stateStackElem?.addToStack(0, 's0', '', `state-${targetStateElem?.getId()}-title`);

			while ($stateStack.length > 0) {
				await codeCard?.highlightLines([7]);
				await originStateElem?.resetState();
				originStateName = `s${automaton.states[stateStackElem?.first()].index}`;
				await originStateElem?.loadState(automaton.states[stateStackElem?.first()]);

				for (let [symbolIndex, symbol] of alphabet.entries()) {
					await codeCard?.highlightLines([8]);
					await symbolsSelection.selectFor(`stack-${symbolListElem?.getId()}-${symbolIndex}`);
					await targetStateElem?.resetState();

					await codeCard?.highlightLines([9]);

					for (let [prodIndex, prod] of automaton.states[stateStackElem?.first()].items.entries()) {
						await codeCard?.highlightLines([10]);
						await stateSelection.selectFor(`state-${originStateElem?.getId()}-${prodIndex}`);

						await codeCard?.highlightLines([11]);
						if (
							prod.pos >= augRules[prod.ruleIndex].right.length ||
							augRules[prod.ruleIndex].right[prod.pos] !== symbol
						) {
							await codeCard?.highlightLines([12]);
							continue;
						}

						await originStateElem?.highlightDot(prodIndex);
						await selectSymbol(
							`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`,
							colors.pink,
							id,
							false
						);
						await codeCard?.highlightLines([13]);

						await codeCard?.highlightLines([15]);
						if (
							$targetState.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1)
						) {
							await codeCard?.highlightLines([16]);
							deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`, id);
							continue;
						}
						deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`, id);
						await codeCard?.highlightLines([17]);
						await targetStateElem?.addItem(prod.ruleIndex, prod.pos + 1);
					}

					await codeCard?.highlightLines([18]);
					await stateSelection.hideSelect();
					if ($targetState.length === 0) {
						await codeCard?.highlightLines([19]);
						continue;
					}

					await codeCard?.highlightLines([20]);
					await closure();

					await codeCard?.highlightLines([21]);
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

					await codeCard?.highlightLines([22]);
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
							`state-${targetStateElem?.getId()}-title`
						);
						await codeCard?.highlightLines([26]);
						await addPause(id);
						continue;
					}

					await codeCard?.highlightLines([27, 28]);
					automatonElem?.addNode(stateStackElem?.first(), existent, null, symbol);
					await addPause(id);
				}

				await codeCard?.highlightLines([29]);
				await stateStackElem?.removeFromStack(0);
			}

			limitHit(id);
			automatonElem?.update(undefined, 10);
			await addPause(id);
		} catch (e) {
			console.log(e);
		}
	}

	onMount(async () => {
		symbolsSelection = getSelectionFunctions(`symbolList${id}`);
		stateSelection = getSelectionFunctions('origem' + id);
		targetStateSelection = getSelectionFunctions('destino' + id);
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

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="unit grid">
	<div class="cards-box unit" id="card-box{id}" style="max-width: inherit;">
		<GrammarCard {id} cardId={id} isAugmented={true} bind:loadGrammar></GrammarCard>
		<StateCard
			{id}
			state={targetState}
			stateId="destino{id}"
			label={'estado destino'}
			hue={colors.pink}
			bind:this={targetStateElem}
			bind:svgLines
			stateName={targetStateName}
		></StateCard>
		<StateCard
			{id}
			state={originState}
			stateId="origem{id}"
			label={'estado origem'}
			hue={colors.pink}
			bind:this={originStateElem}
			bind:svgLines
			stateName={originStateName}
		></StateCard>
		<StackCard
			{id}
			stack={stateStack}
			stackId="temp{id}"
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
		<StackCard
			{id}
			bind:this={symbolListElem}
			stack={symbolList}
			stackId="symbolList{id}"
			label="alfabeto"
			hue={colors.green}
			reversed={false}
			bind:svgLines
		></StackCard>
	</div>
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title={'Closure LR(0)'} bind:this={closureCodeCard} id="lr0closure"></PseudoCode>
		<PseudoCode title={'Autômato LR(0)'} bind:this={codeCard} id="lr0"></PseudoCode>
		<Automaton id="lr0" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
