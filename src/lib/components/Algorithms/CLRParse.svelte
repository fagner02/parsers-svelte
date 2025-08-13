<script>
	import { clrparsing, elemIds, functionCalls, id, saves } from '$lib/stepCalc/clrparse';
	import { addPause } from '$lib/flowControl';
	import { stackFloatingWindows } from '@/Layout/interactiveElem';
	import { inputString } from '@/Layout/parseString';
	import { colors } from '$lib/selectSymbol';
	import { getTree } from '@/Structures/treeFunctions';
	import { getAugGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { stackCard } from '@/Tabs/dataToComp';
	import { getContext, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { StepExecution } from './exucuteSteps.svelte';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let inputStack = $state(writable([]));
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let stateStack = $state(writable([]));
	/** @type {{
	 * table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>,
	 * stateList: any,
	 * tableData: Map<number, Map<string, string>>}} */
	let { table, tableData, stateList } = $props();

	let codeCard = /**@type {PseudoCode}*/ ($state());
	let stateStackElement = /** @type {StackCard}*/ ($state());
	let inputStackElement = /** @type {StackCard}*/ ($state());

	let { augRules, alphabet } = getAugGrammar();
	let context = getContext('parseView');
	/**@type {number[]}*/
	let breakpoints = $state([]);

	let loadGrammar = /**@type {() => Promise<any>}*/ ($state());
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
			clrparsing(inputString, augRules, tableData);
			stepExecution.saves = saves;
			stepExecution.functionCalls = functionCalls;
		}
	);

	onMount(async () => {
		fetch('./clrparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		loadGrammar();
		stepExecution.executeSteps();
	});
</script>

<SvgLines bind:this={svgLines} svgId="{id}-svg" {id}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode bind:breakpoints title="Análise sintática LR(1)" bind:this={codeCard} id="clrparse"
		></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} isAugmented={true} bind:loadGrammar></GrammarCard>
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
	</div>
</div>
