<script>
	import { clrparsing, elemIds, functionCalls, id, saves } from '$lib/stepCalc/clrparse';
	import { addPause } from '$lib/flowControl';
	import { inputString } from '@/Layout/parseString';
	import { colors } from '$lib/selectSymbol';
	import { getTree } from '@/Structures/treeFunctions';
	import { t, nt } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { stackCard } from '@/Tabs/dataToComp';
	import { getContext, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { StepExecution } from './exucuteSteps.svelte';
	import AlgoLayout from './AlgoLayout.svelte';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let inputStack = $state(writable([]));
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let stateStack = $state(writable([]));
	/** @type {{
	 * table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>,
	 * stateList: any,
	 * tableData: Map<number, Map<string, string>>,
	 * setParseResult: (result: string, input: string)=> void}} */
	let { table, tableData, stateList, setParseResult } = $props();

	let codeCard = /**@type {PseudoCode}*/ ($state());
	let stateStackElement = /** @type {StackCard}*/ ($state());
	let inputStackElement = /** @type {StackCard}*/ ($state());

	let alphabet = [...t, ...nt];
	let context = getContext('parseView');
	/**@type {number[]}*/
	let breakpoints = $state([]);

	let tree = getTree();

	/**@param {typeof saves[0]} save*/
	function setStepCallback(save) {
		stateStackElement.loadStack(stackCard(save.stateStack, {}));
		inputStackElement.loadStack(stackCard(save.inputStack, {}));
		svgLines?.setHideOpacity();
		save.accept === undefined ? context.setAccept(null) : context.setAccept(save.accept);
		tree.resetTree();
		tree.loadFloatingTree(save.tree);
	}

	export const obj = {
		addPause: () => addPause,
		addFloatingNode: () => tree.addFloatingNode,
		addParent: () => tree.addParent,
		addToStackState: () => stateStackElement.addToStack,
		addToStackInput: () => inputStackElement.addToStack,
		removeFromStackState: () => stateStackElement.removeFromStack,
		removeFromStackInput: () => inputStackElement.removeFromStack,
		setAccept: () => context.setAccept,
		highlightLines: () => codeCard?.highlightLines
	};

	let stepExecution = new StepExecution(
		saves,
		functionCalls,
		[{ func: obj.highlightLines, breakpoints: () => breakpoints }],
		obj,
		id,
		setStepCallback,
		() => {
			setParseResult(clrparsing(inputString, tableData), inputString.join(' '));
			stepExecution.saves = saves;
			stepExecution.functionCalls = functionCalls;
		}
	);

	onMount(async () => {
		fetch('./clrparse.html').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		stepExecution.executeSteps();
	});
</script>

<AlgoLayout {id} bind:svgLines>
	{#snippet floats()}
		<PseudoCode bind:breakpoints title="Análise sintática LR(1)" bind:this={codeCard} id="clrparse"
		></PseudoCode>
	{/snippet}
	{#snippet cards()}
		<GrammarCard {id} cardId={elemIds.grammar} isAugmented={true}></GrammarCard>
		<TableCard
			{id}
			rows={stateList}
			columns={alphabet}
			{table}
			bind:svgLines
			tableId={elemIds.table}
			label="tabela lr1"
			hue={colors.blue}
		></TableCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={inputStack}
			bind:this={inputStackElement}
			stackId={elemIds.inputStack}
			hue={colors.green}
			label="entrada"
		></StackCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={stateStack}
			bind:this={stateStackElement}
			stackId={elemIds.stateStack}
			hue={colors.green}
			label="pilha de símbolos"
		></StackCard>
	{/snippet}
</AlgoLayout>
