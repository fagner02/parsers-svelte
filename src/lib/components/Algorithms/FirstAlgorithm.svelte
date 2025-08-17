<script>
	import { elemIds, functionCalls, id, saves } from '$lib/stepCalc/first';
	import { addPause } from '$lib/flowControl';
	import { colors, deselectSymbol, resetAllSymbols, selectSymbol } from '$lib/selectSymbol';
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
	import { resetTooltips, setUpTooltip, showTooltip } from '@/Layout/tooltip.svelte';
	import AlgoLayout from './AlgoLayout.svelte';

	/**@type {StackCard | undefined}*/
	let joinStackElement = $state();
	/**@type {SetsCard | undefined}*/
	let firstSetElement = $state();
	/**@type {SetsCard | undefined}*/
	let joinSetElement = $state();
	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

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

	/**@type {number[]}*/
	let breakpoints = $state([]);

	export const obj = {
		addPause: () => addPause,
		showTooltip: () => showTooltip,
		setUpTooltip: () => setUpTooltip,
		selectSymbol: () => selectSymbol,
		deselectSymbol: () => deselectSymbol,
		highlightLines: () => codeCard?.highlightLines,
		selectForGrammar: () => grammarSelection?.selectFor,
		hideSelectGrammar: () => grammarSelection?.hideSelect,
		addSetRow: () => firstSetElement?.addSetRow,
		addSetRowJoin: () => joinSetElement?.addSetRow,
		addToStack: () => joinStackElement?.addToStack,
		removeFromStack: () => joinStackElement?.removeFromStack,
		joinSets: () => firstSetElement?.joinSets,
		joinSetsJoin: () => joinSetElement?.joinSets,
		removeSet: () => joinSetElement?.remove
	};
	async function setStepCallback(/**@type {typeof saves[0]}*/ save) {
		svgLines?.hideLine(false, id);
		joinStackElement?.loadStack(stackCard(save.joinStack, { key: (a) => rules[a].left }));
		joinSetElement?.loadSets(save.join);
		firstSetElement?.loadSets(save.first);
		resetAllSymbols(id, save.symbolIds);
		resetTooltips(save.functionCall, functionCalls);
		resetSelectFor(obj, functionCalls, save.functionCall);
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
		fetch('./first.html').then((data) => data.text().then((text) => codeCard?.setPseudoCode(text)));

		stepExecution.executeSteps();
	});
</script>

<AlgoLayout {id} bind:svgLines>
	{#snippet floats()}
		<PseudoCode bind:breakpoints title="First" bind:this={codeCard} id="first"></PseudoCode>
	{/snippet}

	{#snippet cards()}
		<GrammarCard {id} cardId={elemIds.grammar}></GrammarCard>
		<SetsCard
			setId={elemIds.first}
			set={firstSet}
			convert={{
				left: (value) => rules[value].left,
				noteLeft: (value) => value.toString()
			}}
			hue={colors.blue}
			label={'first set'}
			labelTooltip="first set é o conjunto de terminais iniciais gerados por um não terminal. Como é necessário saber o número da regra da grámatica para a construção da tabela LL(1) o conjunto first aqui é separado pelos números das regras e não pelos símbolos."
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
	{/snippet}
</AlgoLayout>
