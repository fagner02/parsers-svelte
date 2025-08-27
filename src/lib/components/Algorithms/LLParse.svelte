<script>
	import { addPause } from '$lib/flowControl';
	import { elemIds, functionCalls, id, llParsing, saves } from '$lib/stepCalc/llparse';
	import { inputString } from '@/Layout/parseString';
	import { colors } from '$lib/selectSymbol';
	import { getTree } from '@/Structures/treeFunctions';
	import { rules, nt, t, startingSymbol } from '$lib/utils';
	import StackCard from '@/Cards/StackCard.svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { stackCard } from '@/Tabs/dataToComp';
	import { getContext, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { StepExecution } from './exucuteSteps.svelte';
	import { resetTooltips, showTooltip } from '@/Layout/tooltip.svelte';
	import AlgoLayout from './AlgoLayout.svelte';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/** @type {{
	 * table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<number>>>
	 * tableData: Map<string, Map<string, number>>,
	 * setParseResult: (result: string, input: string)=> void}} */
	let { table, tableData, setParseResult } = $props();
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let inputStack = $state(writable([]));
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let symbolStack = $state(writable([]));

	let codeCard = /**@type {PseudoCode}*/ ($state());

	let symbolStackElement = /** @type {StackCard}*/ ($state());
	let inputStackElement = /** @type {StackCard}*/ ($state());
	let context = getContext('parseView');

	/**@type {number[]}*/
	let breakpoints = $state([]);
	let tree = getTree();

	/**@param {typeof saves[0]} save*/
	function setStepCallback(save) {
		symbolStackElement.loadStack(stackCard(save.symbolStack, {}));
		inputStackElement.loadStack(stackCard(save.inputStack, {}));
		svgLines?.setHideOpacity();
		save.accept === undefined ? context.setAccept(null) : context.setAccept(save.accept);
		tree.resetTree();
		tree.loadSyntaxTree(save.tree, startingSymbol);
		resetTooltips(save.functionCall, functionCalls);
	}

	export const obj = {
		highlightLines: () => codeCard?.highlightLines,
		addToStackSymbols: () => symbolStackElement.addToStack,
		removeFromStackSymbols: () => symbolStackElement.removeFromStack,
		addToStackInput: () => inputStackElement.addToStack,
		removeFromStackInput: () => inputStackElement.removeFromStack,
		addToTree: () => tree.addToTree,
		resetTree: () => tree.resetTree,
		initializeTree: () => tree.initializeTree,
		addPause: () => addPause,
		setAccept: () => context.setAccept,
		showTooltip: () => showTooltip
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
		setStepCallback,
		() => {
			setParseResult(llParsing(startingSymbol, inputString, tableData), inputString.join(' '));
			stepExecution.saves = saves;
			stepExecution.functionCalls = functionCalls;
		}
	);
	onMount(async () => {
		fetch('./llparse.html').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);

		stepExecution.executeSteps();
	});
</script>

<AlgoLayout {id} bind:svgLines>
	{#snippet floats()}
		<PseudoCode bind:breakpoints title="Análise sintática LL(1)" bind:this={codeCard} id="llparse"
		></PseudoCode>
	{/snippet}
	{#snippet cards()}
		<TableCard
			{id}
			rows={nt}
			columns={t}
			{table}
			bind:svgLines
			tableId={elemIds.table}
			label="tabela ll(1)"
			hue={colors.blue}
			convert={(v) =>
				v > -1
					? `${rules[v].left} -> ${rules[v].right[0] === '' ? 'ε' : rules[v].right.join(' ')}`
					: ''}
		></TableCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={inputStack}
			bind:this={inputStackElement}
			stackId={elemIds.input}
			hue={colors.green}
			label="entrada"
		></StackCard>
		<StackCard
			{id}
			bind:svgLines
			bind:stack={symbolStack}
			bind:this={symbolStackElement}
			stackId={elemIds.states}
			hue={colors.green}
			label="pilha de símbolos"
		></StackCard>
	{/snippet}
</AlgoLayout>
