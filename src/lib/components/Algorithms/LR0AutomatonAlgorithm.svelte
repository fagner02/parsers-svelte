<script>
	import { addPause } from '$lib/flowControl';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { elemIds, functionCalls, id, saves } from '$lib/lr0automaton';
	import { colors, deselectSymbol, selectSymbol } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import StackCard from '@/Cards/StackCard.svelte';
	import StateCard from '@/Cards/StateCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import Automaton from '@/Structures/Automaton.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { stackCard } from '@/Tabs/dataToComp';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { StepExecution } from './exucuteSteps.svelte';

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

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR0StateItem>>} */
	let targetState = writable([]);
	let { alphabet } = getAugGrammar();
	alphabet = alphabet.filter((x) => x !== '$');
	let {} = $props();

	let originStateName = $state('');
	let targetStateName = $state('s?');

	/**@type {number[]}*/
	let autBreakpoints = $state([]);
	/**@type {number[]}*/
	let closureBreakpoints = $state([]);

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
	let originStateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let targetStateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let stateStackSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let grammarSelection;

	/**
	 * @param {typeof saves[0]} save
	 */
	function setStepCallback(save) {
		symbolsSelection.hideSelect();
		originStateSelection.hideSelect();
		targetStateSelection.hideSelect();
		grammarSelection.hideSelect();
		svgLines?.hideLine(false, id);
		stateStackElem?.loadStack(stackCard(save.stateStack, { key: (a) => `s${a}` }));
		originStateName = save.originStateName;
		originStateElem?.loadState(save.originState, false);
		targetStateElem?.loadState(save.targetState, false);
		automatonElem?.reset();
		automatonElem?.loadAutomaton(save.automaton);
	}

	const obj = {
		addPause: () => addPause,
		highlightLinesClosure: () => closureCodeCard?.highlightLines,
		highlightLines: () => codeCard?.highlightLines,
		deselectSymbol: () => deselectSymbol,
		selectSymbol: () => selectSymbol,
		highlightDotTarget: () => targetStateElem?.highlightDot,
		highlightDotOrigin: () => originStateElem?.highlightDot,
		addItemTarget: () => targetStateElem?.addItem,
		addState: () => automatonElem?.addNode,
		addToStack: () => stateStackElem?.addToStack,
		selectForTarget: () => targetStateSelection.selectFor,
		selectForStack: () => stateStackSelection.selectFor,
		selectForAlphabet: () => symbolsSelection.selectFor,
		selectForOrigin: () => originStateSelection.selectFor,
		selectForGrammar: () => grammarSelection.selectFor,
		hideSelectOrigin: () => originStateSelection.hideSelect,
		hideSelectStack: () => stateStackSelection.hideSelect,
		hideSelectTarget: () => targetStateSelection.hideSelect,
		hideSelectAlphabet: () => symbolsSelection.hideSelect,
		hideSelectGrammar: () => grammarSelection.hideSelect,
		removeFromStack: () => stateStackElem?.removeFromStack,
		resetStateOrigin: () => originStateElem?.resetState,
		resetStateTarget: () => targetStateElem?.resetState,
		loadState: () => originStateElem?.loadState,
		stateName: () => {
			return (/** @type {string} */ value) => {
				originStateName = value;
			};
		}
	};

	let stepExecution = new StepExecution(
		saves,
		functionCalls,
		[
			{ func: obj.highlightLines, breakpoints: () => autBreakpoints },
			{ func: obj.highlightLinesClosure, breakpoints: () => closureBreakpoints }
		],
		obj,
		id,
		setStepCallback
	);

	onMount(async () => {
		symbolsSelection = getSelectionFunctions(elemIds.alphabet);
		originStateSelection = getSelectionFunctions(elemIds.originState);
		targetStateSelection = getSelectionFunctions(elemIds.targetState);
		stateStackSelection = getSelectionFunctions(elemIds.stateStack);
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		fetch('./lr0automaton.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		fetch('./lr0closure.txt').then((data) =>
			data.text().then((text) => closureCodeCard?.setPseudoCode(text))
		);

		loadGrammar();
		stepExecution.executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="unit grid">
	<div class="cards-box unit" id="card-box{id}" style="max-width: inherit;">
		<GrammarCard {id} cardId={elemIds.grammar} isAugmented={true} bind:loadGrammar></GrammarCard>
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
			stack={symbolList}
			stackId={elemIds.alphabet}
			label="alfabeto"
			hue={colors.green}
			reversed={false}
			bind:svgLines
		></StackCard>
	</div>
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode
			bind:breakpoints={closureBreakpoints}
			title={'Closure LR(0)'}
			bind:this={closureCodeCard}
			id="{id}-code-closure"
		></PseudoCode>
		<PseudoCode
			bind:breakpoints={autBreakpoints}
			title={'Autômato LR(0)'}
			bind:this={codeCard}
			id="{id}-code-lr0"
		></PseudoCode>
		<Automaton id={elemIds.automaton} bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
