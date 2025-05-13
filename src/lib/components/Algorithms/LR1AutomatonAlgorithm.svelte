<script>
	import { writable } from 'svelte/store';
	import { addPause, limitHit, setResetCall } from '$lib/flowControl';
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
	import { stackFloatingWindows } from '$lib/interactiveElem';

	/**@type {StackCard | undefined}*/
	let stateStackElem = $state();
	/**@type {StateCard | undefined}*/
	let originStateElem = $state();
	/**@type {StateCard | undefined}*/
	let targetStateElem = $state();
	/**@type {Automaton | undefined}*/
	let automatonElem = $state();
	/**@type {StackCard | undefined}*/
	let lookaheadElem = $state();
	/**@type {GrammarCard | undefined}*/
	let grammarElem = $state();
	/**@type {SetsCard | undefined}*/
	let firstElem = $state();
	/**@type {StackCard | undefined}*/
	let alphabetElem = $state();

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let targetState = writable([]);

	/** @type {{id: string, firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>}} */
	let { id, firstSet } = $props();
	let { nt, augRules, alphabet } = getAugGrammar();
	alphabet = alphabet.filter((x) => x !== '$');
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let alphabetStack = writable(
		alphabet.toReversed().map((x, i) => ({
			data: x,
			text: x,
			note: '',
			id: i
		}))
	);

	let originStateName = $state('');
	let targetStateName = $state('s?');

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let lookaheadStack = writable([]);

	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();
	/**@type {PseudoCode | undefined}*/
	let closureCodeCard = $state();

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let grammarSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let stateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let targetStateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let alphabetSelection;

	function reset() {
		try {
			stateStack.update(() => []);
			originStateElem?.resetState(false);
			targetStateElem?.resetState(false);
			svgLines?.hideLine(false, id);
			automatonElem?.reset();
			grammarSelection.hideSelect();
			stateSelection.hideSelect();
			targetStateSelection.hideSelect();
			alphabetSelection.hideSelect();
			originStateName = '';
		} catch (e) {}
		buildAutomaton();
	}
	setResetCall(reset, id);

	async function closure() {
		let itemsToCheck = [...$targetState.keys()];
		await closureCodeCard?.highlightLines([0]);
		let itemSymbolId = '';
		while (itemsToCheck.length > 0) {
			if ($lookaheadStack.length > 0) await lookaheadElem?.removeAll();
			await closureCodeCard?.highlightLines([1]);
			const item = $targetState[itemsToCheck[0]];
			await closureCodeCard?.highlightLines([2]);

			let index = $targetState.findIndex(
				(x) => x.ruleIndex === item.ruleIndex && x.pos === item.pos
			);
			await targetStateSelection.selectFor(`state-${targetStateElem?.getId()}-${index}`);

			await closureCodeCard?.highlightLines([3]);
			let symbol = augRules[item.ruleIndex].right[item.pos];
			itemSymbolId = `state-${targetStateElem?.getId()}-${index}-${item.pos}`;
			await selectSymbol(itemSymbolId, colors.pink, id, false);

			await closureCodeCard?.highlightLines([4]);
			if (!nt.includes(symbol)) {
				await closureCodeCard?.highlightLines([5]);
				await closureCodeCard?.highlightLines([6]);
				itemsToCheck.shift();
				continue;
			}

			await closureCodeCard?.highlightLines([7]);
			/**@type {Set<string>}*/
			let lookahead = new Set();

			await closureCodeCard?.highlightLines([8]);
			if (augRules[item.ruleIndex].right.length - 1 === item.pos) {
				await closureCodeCard?.highlightLines([9]);
				await targetStateElem?.highlightDot(index);
				for (let l of item.lookahead) {
					if ($lookaheadStack.findIndex((x) => x.data === l) === -1) {
						await lookaheadElem?.addToStack(l, l, '', `look-${targetStateElem?.getId()}-${index}`);
					}
				}
				lookahead = new Set(item.lookahead);
				await closureCodeCard?.highlightLines([10]);
			} else {
				await closureCodeCard?.highlightLines([10]);
				await closureCodeCard?.highlightLines([11]);
				let nullable = true;
				let betaId = null;
				for (let i = 1; item.pos + i < augRules[item.ruleIndex].right.length; i++) {
					await closureCodeCard?.highlightLines([12]);
					const beta = augRules[item.ruleIndex].right[item.pos + i];
					betaId = `state-${targetStateElem?.getId()}-${index}-${item.pos + i}`;
					await selectSymbol(betaId, colors.pink, id, false);
					await closureCodeCard?.highlightLines([13]);
					if (!nt.includes(beta)) {
						await closureCodeCard?.highlightLines([14]);
						await closureCodeCard?.highlightLines([15]);
						await closureCodeCard?.highlightLines([16]);
						lookahead.add(beta);

						if ($lookaheadStack.findIndex((x) => x.data === beta) === -1) {
							await lookaheadElem?.addToStack(beta, beta, '', betaId);
						}
						nullable = false;
						break;
					} else {
						await closureCodeCard?.highlightLines([17]);
						await closureCodeCard?.highlightLines([18]);
						await closureCodeCard?.highlightLines([19]);
						let firstIndex = $firstSet.findIndex((x) => x.left === beta);
						let first = /**@type {string[]}*/ ($firstSet[firstIndex].right);
						for (let [i, l] of first.entries()) {
							if (l === '') continue;
							if ($lookaheadStack.findIndex((x) => x.data === l) === -1) {
								await lookaheadElem?.addToStack(
									l,
									l,
									'',
									`${firstElem?.getSetId()}-${firstIndex}-${i}`
								);
							}
						}
						lookahead.union(new Set(first.filter((x) => x !== '')));

						await closureCodeCard?.highlightLines([20]);
						if (!first.includes('')) {
							await closureCodeCard?.highlightLines([21]);
							await closureCodeCard?.highlightLines([22]);
							nullable = false;
							break;
						}
					}
					await deselectSymbol(betaId, id);
				}
				if (betaId) await deselectSymbol(betaId, id);

				await closureCodeCard?.highlightLines([23]);
				if (nullable) {
					await closureCodeCard?.highlightLines([24]);
					for (let l of item.lookahead) {
						if ($lookaheadStack.findIndex((x) => x.data === l) === -1) {
							await lookaheadElem?.addToStack(
								l,
								l,
								'',
								`look-${targetStateElem?.getId()}-${index}`
							);
						}
					}
					lookahead.union(item.lookahead);
				}
			}

			for (let rule of augRules) {
				await closureCodeCard?.highlightLines([25]);
				await grammarSelection.selectFor(`${grammarElem?.getCardId()}gset${rule.index}`);

				await closureCodeCard?.highlightLines([26]);
				if (!(rule.left === symbol)) continue;

				await targetStateElem?.highlightDot(index);
				let ruleId = `${grammarElem?.getCardId()}gl${rule.index}`;
				await selectSymbol(ruleId, colors.blue, id, false);

				await closureCodeCard?.highlightLines([27]);
				let existent = $targetState.findIndex((x) => x.ruleIndex === rule.index && x.pos === 0);

				await closureCodeCard?.highlightLines([28]);
				if (existent === -1) {
					await closureCodeCard?.highlightLines([29]);
					await targetStateElem?.addItem(
						rule.index,
						0,
						lookahead,
						`${grammarElem?.getCardId()}gl${rule.index}`
					);

					await closureCodeCard?.highlightLines([30]);
					await closureCodeCard?.highlightLines([31]);
					itemsToCheck.push($targetState.length - 1);
					await addPause(id);
					await deselectSymbol(ruleId, id);
					continue;
				}

				await closureCodeCard?.highlightLines([32]);
				await closureCodeCard?.highlightLines([33]);
				let size = $targetState[existent].lookahead.size;
				await targetStateElem?.updateLookahead(lookahead, existent, index === existent);

				await deselectSymbol(ruleId, id);
				await closureCodeCard?.highlightLines([34]);
				if ($targetState[existent].lookahead.size === size) continue;

				await closureCodeCard?.highlightLines([35]);
				itemsToCheck.push(existent);
			}
			grammarSelection.hideSelect();

			await closureCodeCard?.highlightLines([36]);
			itemsToCheck.shift();
			deselectSymbol(itemSymbolId, id);
		}
		deselectSymbol(itemSymbolId, id);
		if ($lookaheadStack.length > 0) await lookaheadElem?.removeAll();
		targetStateSelection.hideSelect();
	}

	async function buildAutomaton() {
		try {
			await loadGrammar();
			await addPause(id);

			/**@type {import('@/types').LR1Automaton}*/
			let automaton = { states: [], transitions: new Map() };
			await codeCard?.highlightLines([1]);

			await codeCard?.highlightLines([2]);
			await targetStateElem?.addItem(0, 0, new Set(['$']), `${id}gl0`);

			await codeCard?.highlightLines([3]);
			await closure();

			await codeCard?.highlightLines([4]);
			originStateName = 's0';
			automaton.states.push({ index: 0, items: [...$targetState] });
			automatonElem?.addNode(null, 0, automaton.states[0], null);

			await addPause(id);

			let count = 0;

			await codeCard?.highlightLines([5]);
			await stateStackElem?.addToStack(0, 's0', '', `label-${targetStateElem?.getId()}`);

			await codeCard?.highlightLines([6]);
			while ($stateStack.length > 0) {
				await codeCard?.highlightLines([7]);
				await originStateElem?.resetState();
				originStateName = `s${$stateStack[0].data}`;
				await originStateElem?.loadState(automaton.states[stateStackElem?.first()]);

				await codeCard?.highlightLines([8]);
				for (let [symbolIndex, symbol] of alphabet.entries()) {
					await alphabetSelection.selectFor(`stack-${alphabetElem?.getId()}-${symbolIndex}`);
					await targetStateElem?.resetState();

					await codeCard?.highlightLines([9]);
					await codeCard?.highlightLines([10]);

					count++;
					for (let [prodIndex, prod] of automaton.states[stateStackElem?.first()].items.entries()) {
						await stateSelection.selectFor(`state-${originStateElem?.getId()}-${prodIndex}`);

						await codeCard?.highlightLines([11]);
						if (
							prod.pos >= augRules[prod.ruleIndex].right.length ||
							augRules[prod.ruleIndex].right[prod.pos] !== symbol
						) {
							continue;
						}
						await originStateElem?.highlightDot(prodIndex);
						await selectSymbol(
							`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`,
							colors.pink,
							id,
							false
						);

						await codeCard?.highlightLines([12]);
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

						deselectSymbol(`state-${originStateElem?.getId()}-${prodIndex}-${prod.pos}`, id);
					}
					stateSelection.hideSelect();
					await codeCard?.highlightLines([13]);
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

					await codeCard?.highlightLines([14]);
					if (existent !== -1) {
						await codeCard?.highlightLines([15]);
						await codeCard?.highlightLines([16]);
					} else {
						await codeCard?.highlightLines([16]);
						await codeCard?.highlightLines([17]);
						await codeCard?.highlightLines([18]);

						automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
						automatonElem?.addNode(
							stateStackElem?.first(),
							automaton.states.length - 1,
							automaton.states[automaton.states.length - 1],
							symbol
						);

						await codeCard?.highlightLines([19]);
						await stateStackElem?.addToStack(
							automaton.states.length - 1,
							`s${automaton.states.length - 1}`,
							'',
							`label-${targetStateElem?.getId()}`
						);
						await addPause(id);
						continue;
					}
				}
				alphabetSelection.hideSelect();

				await codeCard?.highlightLines([20]);
				await stateStackElem?.removeFromStack(0);
			}

			limitHit(id);
			automatonElem?.update(undefined, 10);
			await addPause(id);
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		grammarSelection = getSelectionFunctions(grammarElem?.getCardId() ?? '');
		stateSelection = getSelectionFunctions(originStateElem?.getId() ?? '');
		targetStateSelection = getSelectionFunctions(targetStateElem?.getId() ?? '');
		alphabetSelection = getSelectionFunctions(alphabetElem?.getId() ?? '');

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

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard bind:this={grammarElem} {id} cardId="g{id}" isAugmented={true} bind:loadGrammar
		></GrammarCard>
		<SetsCard
			bind:this={firstElem}
			{id}
			set={firstSet}
			label="first"
			setId="first{id}"
			hue={colors.blue}
		></SetsCard>
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
			stackId="stateStack{id}"
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
		<StackCard
			{id}
			bind:this={lookaheadElem}
			stack={lookaheadStack}
			stackId="lookahead{id}"
			label="lookahead"
			hue={colors.green}
			bind:svgLines
		></StackCard>
		<StackCard
			{id}
			bind:this={alphabetElem}
			stack={alphabetStack}
			stackId="alphabet{id}"
			label="alfabeto"
			hue={colors.cyan}
			bind:svgLines
			horizontal={true}
		></StackCard>
	</div>
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Closure LR(1)" bind:this={closureCodeCard} id="lr1closure"></PseudoCode>
		<PseudoCode title="Autômato LR(1)" bind:this={codeCard} id="lr1"></PseudoCode>

		<Automaton id="lr1" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
