<script>
	import { writable } from 'svelte/store';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, setCurrentStep, setStepCall } from '$lib/flowControl';
	import { onMount } from 'svelte';
	import {
		colors,
		deselectSymbol,
		selectLSymbol,
		selectRSymbol,
		selectSymbol
	} from '$lib/selectSymbol';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { setInfoComponent } from '$lib/infoText';
	import FistInfo from '@/Info/FirstInfo.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, saves, elemIds, functionCalls, first } from '$lib/first';
	import { getGrammar } from '$lib/utils';
	import { stackCard } from '@/Tabs/dataToComp';
	import { StepExecution } from './exucuteSteps.svelte';

	/**@type {StackCard | undefined}*/
	let joinStackElement = $state();
	/**@type {SetsCard | undefined}*/
	let firstSetElement = $state();
	/**@type {SetsCard | undefined}*/
	let joinSetElement = $state();
	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let joinStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let firstSet = writable([]);
	/** @type { import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let joinSet = writable([]);

	/** @type {{ instruction: string,}} */
	let { instruction = $bindable() } = $props();

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions | undefined}*/
	let grammarSelection;

	let { rules } = getGrammar();

	/**@type {number[]}*/
	let breakpoints = $state([]);

	const obj = {
		addPause: () => addPause,
		selectSymbol: () => selectSymbol,
		selectRSymbol: () => selectRSymbol,
		selectLSymbol: () => selectLSymbol,
		deselectSymbol: () => deselectSymbol,
		highlightLines: () => codeCard?.highlightLines,
		selectGrammar: () => grammarSelection?.selectFor,
		hideSelectGrammar: () => grammarSelection?.hideSelect,
		addSetRow: () => firstSetElement?.addSetRow,
		addSetRowJoin: () => joinSetElement?.addSetRow,
		addToStack: () => joinStackElement?.addToStack,
		removeFromStack: () => joinStackElement?.removeFromStack,
		joinSets: () => firstSetElement?.joinSets,
		joinSetsJoin: () => joinSetElement?.joinSets,
		removeSet: () => joinSetElement?.remove
	};
	function setStepCallback(/**@type {typeof saves[0]}*/ save) {
		svgLines?.hideLine(false, id);
		save.grammarSelect === ''
			? grammarSelection?.hideSelect()
			: grammarSelection?.selectFor(save.grammarSelect);
		joinStackElement?.loadStack(stackCard(save.joinStack, { key: (a) => rules[a].left }));
		joinSetElement?.loadSets(save.join);
		firstSetElement?.loadSets(save.first);
	}
	let stepExecution = new StepExecution(
		saves,
		functionCalls,
		[{ func: obj.highlightLines, breakpoints: () => breakpoints }],
		obj,
		id,
		setStepCallback
	);

	onMount(async () => {
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		fetch('./first.txt').then((data) => data.text().then((text) => codeCard?.setPseudoCode(text)));

		setInfoComponent(FistInfo);
		loadGrammar();
		stepExecution.executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode bind:breakpoints title="First" bind:this={codeCard} id="first"></PseudoCode>
	</div>
	<div class="unit cards-box" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} bind:loadGrammar></GrammarCard>
		<SetsCard
			setId={elemIds.first}
			set={firstSet}
			convert={{
				left: (value) => rules[value].left,
				noteLeft: (value) => value.toString()
			}}
			hue={colors.blue}
			label={'first set'}
			bind:this={firstSetElement}
			bind:svgLines
			{id}
		></SetsCard>
		<SetsCard
			setId={elemIds.join}
			set={joinSet}
			convert={{
				left: (v) => rules[v].left,
				noteLeft: (v) => v.toString(),
				right: (v) => rules[v].left,
				noteRight: (v) => v.toString()
			}}
			hue={colors.blue}
			label={'join set'}
			bind:this={joinSetElement}
			bind:svgLines
			{id}
		></SetsCard>
		<StackCard
			stack={joinStack}
			stackId={elemIds.joinStack}
			label="join stack"
			hue={colors.blue}
			bind:this={joinStackElement}
			bind:svgLines
			{id}
		></StackCard>
	</div>
</div>
