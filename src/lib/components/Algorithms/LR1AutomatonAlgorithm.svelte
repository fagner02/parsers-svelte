<script>
	import { writable } from 'svelte/store';
	import { addPause, setCurrentStep, setStepCall } from '$lib/flowControl';
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
	import { id, saves, elemIds, functionCalls } from '$lib/lr1automaton';
	import { stackCard } from '@/Tabs/dataToComp';

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
	/**@type {StackCard | undefined}*/
	let alphabetElem = $state();

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let targetState = writable([]);

	/** @type {{
	 * firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>,
	 * results: import("@/types").ResultsTabItem[]}} */
	let { firstSet, results = $bindable() } = $props();
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
	let currentStep = 0;
	let stepChanged = false;

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

	/**
	 * @param {number} step
	 */
	function setStep(step) {
		const save = saves[step];
		if (save === undefined) {
			console.error(`Step ${step} not found`);
			console.log(saves);
			return;
		}
		svgLines?.hideLine(false, id);
		grammarSelection.hideSelect();
		stateSelection.hideSelect();
		targetStateSelection.hideSelect();
		alphabetSelection.hideSelect();
		originStateName = save.originStateName;
		targetStateName = save.targetStateName;
		originStateElem?.loadState(save.originState);
		targetStateElem?.loadState(save.targetState);
		stateStackElem?.loadStack(stackCard(save.stateStack, { key: (a) => `s${a}` }));
		automatonElem?.reset();
		automatonElem?.loadAutomaton(save.automaton);
		currentStep = step;
		setCurrentStep(currentStep);
		stepChanged = true;
	}
	setStepCall(setStep, saves.length - 1, id, () => currentStep);

	/**@type {any}*/
	export const obj = {
		highlightLines: () => codeCard?.highlightLines,
		addItem: () => targetStateElem?.addItem,
		updateLookahead: () => targetStateElem?.updateLookahead,
		deselectSymbol: () => deselectSymbol,
		selectSymbol: () => selectSymbol,
		lookaheadRemoveAll: () => lookaheadElem?.removeAll,
		selectForGrammar: () => grammarSelection.selectFor,
		selectForTargetState: () => targetStateSelection.selectFor,
		highlightDotTarget: () => targetStateElem?.highlightDot,
		highlightDotOrigin: () => originStateElem?.highlightDot,
		addPause: () => addPause,
		addLookahead: () => lookaheadElem?.addToStack,
		hideSelectGrammar: () => grammarSelection.hideSelect,
		hideSelectTargetState: () => targetStateSelection.hideSelect,
		originStateName: () => {
			return (/**@type {string}*/ value) => {
				originStateName = value;
			};
		},
		addNode: () => automatonElem?.addNode,
		resetOriginState: () => originStateElem?.resetState,
		loadOriginState: () => originStateElem?.loadState,
		selectForAlphabet: () => alphabetSelection.selectFor,
		hideSelectAlphabet: () => alphabetSelection.hideSelect,
		selectForOriginalState: () => stateSelection.selectFor,
		hideSelectOriginal: () => stateSelection.hideSelect,
		highlightDotOriginal: () => originStateElem?.highlightDot,
		addToStack: () => stateStackElem?.addToStack,
		removeFromStack: () => stateStackElem?.removeFromStack,
		targetStateReset: () => targetStateElem?.resetState,
		highlightLinesClosure: () => closureCodeCard?.highlightLines
	};

	async function executeSteps() {
		try {
			loadGrammar?.();
			let i = 0;
			while (i < functionCalls.length || stepChanged) {
				if (stepChanged) {
					stepChanged = false;
					i = saves[currentStep].functionCall;
					continue;
				}
				const call = functionCalls[i];
				try {
					if (!obj[call.name]) {
						console.error(`Function ${call.name} not found`);
						console.log(obj[call.name], call, obj);
						return executeSteps();
					}
					if (call.skip) obj[call.name]()(...call.args);
					else await obj[call.name]()(...call.args);
				} catch (e) {
					continue;
				}
				if (call.name === 'addPause') {
					currentStep++;
					setCurrentStep(currentStep);
				}
				i++;
			}
		} catch (e) {}
	}

	onMount(() => {
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		stateSelection = getSelectionFunctions(elemIds.originState);
		targetStateSelection = getSelectionFunctions(elemIds.targetState);
		alphabetSelection = getSelectionFunctions(elemIds.alphabet);

		fetch('./lr1automaton.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		fetch('./lr1closure.txt').then((data) =>
			data.text().then((text) => closureCodeCard?.setPseudoCode(text))
		);

		setInfoComponent(Lr1AutomatonInfo);
		executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard
			bind:this={grammarElem}
			{id}
			cardId={elemIds.grammar}
			isAugmented={true}
			bind:loadGrammar
		></GrammarCard>
		<SetsCard {id} set={firstSet} label="first" setId={elemIds.firstSet} hue={colors.blue}
		></SetsCard>
		<StateCard
			{id}
			state={targetState}
			stateId={elemIds.targetState}
			label={'estado destino'}
			hue={colors.pink}
			bind:this={targetStateElem}
			bind:svgLines
			stateName={targetStateName}
		></StateCard>
		<StateCard
			{id}
			state={originState}
			stateId={elemIds.originState}
			label={'estado origem'}
			hue={colors.pink}
			bind:this={originStateElem}
			bind:svgLines
			stateName={originStateName}
		></StateCard>
		<StackCard
			{id}
			stack={stateStack}
			stackId={elemIds.stateStack}
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
		<StackCard
			{id}
			bind:this={lookaheadElem}
			stack={lookaheadStack}
			stackId={elemIds.lookahead}
			label="lookahead"
			hue={colors.green}
			bind:svgLines
		></StackCard>
		<StackCard
			{id}
			bind:this={alphabetElem}
			stack={alphabetStack}
			stackId={elemIds.alphabet}
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
