<script>
	import { addPause } from '$lib/flowControl';
	import { elemIds, functionCalls, id, saves } from '$lib/stepCalc/follow';
	import { stackFloatingWindows } from '@/Layout/interactiveElem';
	import { colors, resetAllSymbols, selectSymbol } from '$lib/selectSymbol';
	import { rules } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { getSelectionFunctions, resetSelectFor } from '@/Cards/selectionFunction';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { stackCard } from '@/Tabs/dataToComp';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { StepExecution } from './exucuteSteps.svelte';
	import { hideTooltip, resetTooltips, setUpTooltip, showTooltip } from '@/Layout/tooltip.svelte';

	/**@type {SetsCard | undefined}*/
	let followSetElement = $state();
	/**@type {SetsCard | undefined}*/
	let joinSetElement = $state();
	/**@type {StackCard | undefined}*/
	let joinStackElement = $state();
	/**@type {SvgLines | undefined}*/
	let svgLines = $state();
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();

	/**@type {number[]}*/
	let breakpoints = $state([]);

	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let joinSet = writable([]);
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let joinStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>}*/
	let followSet = writable([]);

	/** @type {{
	 * instruction: string,
	 * firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>}} */
	let { instruction = $bindable(), firstSet } = $props();

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions|undefined}*/
	let grammarSelection;

	/**
	 * @param {typeof saves[0]} save
	 */
	function setStepCallback(save) {
		svgLines?.hideLine(false, id);
		followSetElement?.loadSets(save.follow);
		joinSetElement?.loadSets(save.join);
		joinStackElement?.loadStack(stackCard(save.joinStack, {}));
		resetAllSymbols(id, save.symbolIds);
		resetTooltips(save.functionCall, functionCalls);
		resetSelectFor(obj, functionCalls, save.functionCall);
	}

	export const obj = {
		addPause: () => addPause,
		selectSymbol: () => selectSymbol,
		highlightLines: () => codeCard?.highlightLines,
		showTooltip: () => showTooltip,
		setUpTooltip: () => setUpTooltip,
		hideTooltip: () => hideTooltip,
		selectForGrammar: () => grammarSelection?.selectFor,
		hideSelectGrammar: () => grammarSelection?.hideSelect,
		joinSetsFollow: () => followSetElement?.joinSets,
		addSetRowFollow: () => followSetElement?.addSetRow,
		addToStack: () => joinStackElement?.addToStack,
		removeFromStack: () => joinStackElement?.removeFromStack,
		addSetRowJoin: () => joinSetElement?.addSetRow,
		joinSetsJoin: () => joinSetElement?.joinSets,
		removeSet: () => joinSetElement?.remove
	};
	let stepExecution = new StepExecution(
		saves,
		functionCalls,
		[
			{
				func: obj.highlightLines,
				breakpoints: () => breakpoints
			}
		],
		obj,
		id,
		setStepCallback
	);

	onMount(async () => {
		grammarSelection = getSelectionFunctions(elemIds.grammar);
		fetch('./follow.html').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);

		stepExecution.executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows style="pointer-events:none;">
		<PseudoCode bind:breakpoints title="Follow" bind:this={codeCard} id="follow"></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar}></GrammarCard>
		<SetsCard
			{id}
			setId={elemIds.follow}
			set={followSet}
			hue={colors.blue}
			label={'follow set'}
			bind:this={followSetElement}
			bind:svgLines
		></SetsCard>
		<SetsCard
			{id}
			convert={{
				left: (value) => rules[value].left,
				noteLeft: (value) => value.toString()
			}}
			setId={elemIds.first}
			set={firstSet}
			hue={colors.blue}
			label={'first set'}
			labelTooltip="first set é o conjunto usado para pegar os terminais iniciais gerados por um não-terminal. Dado um símbolo não-terminal seguido de outro não-terminal, o first do não-terminal à frente é adicionado ao follow do não-terminal anterior"
			bind:svgLines
		></SetsCard>
		<SetsCard
			{id}
			setId={elemIds.join}
			set={joinSet}
			hue={colors.blue}
			label={'join set'}
			labelTooltip="join set é o conjunto usado para guardar a informação de quais conjuntos follow devem ser mesclados"
			bind:this={joinSetElement}
			bind:svgLines
		></SetsCard>
		<StackCard
			{id}
			labelTooltip="join stack é a pilha usada para processar os conjuntos join dos símbolos não terminais mesclando os seus conjuntos follow"
			stack={joinStack}
			stackId={elemIds.joinStack}
			label="join stack"
			hue={colors.blue}
			bind:this={joinStackElement}
			bind:svgLines
		></StackCard>
	</div>
</div>
