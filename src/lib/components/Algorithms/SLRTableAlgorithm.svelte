<script>
	import { writable } from 'svelte/store';
	import { addPause } from '$lib/flowControl';
	import { colors, deselectSymbol, resetAllSymbols, selectSymbol } from '$lib/selectSymbol';
	import { nt, t } from '$lib/utils';
	import { onMount } from 'svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import StateCard from '@/Cards/StateCard.svelte';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import Automaton from '@/Structures/Automaton.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { stackFloatingWindows } from '@/Layout/interactiveElem';
	import { id, elemIds, saves, functionCalls } from '$lib/stepCalc/slrtable';
	import { tableCard } from '@/Tabs/dataToComp';
	import { StepExecution } from './exucuteSteps.svelte';
	import { resetSelectFor } from '@/Cards/selectionFunction';
	import { augmentedGrammarTooltip } from '@/Layout/tooltip.svelte';

	/**@type {TableCard | undefined}*/
	let tableElem = $state();
	/**@type {StateCard | undefined}*/
	let stateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem = $state();
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();
	let stateName = $state('');

	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let slrState = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>}*/
	let table = $state(writable(new Map()));

	/** @type {{
	 * followSet: import('svelte/store').Writable<import('@/types').SetRow[]>,
	 * automaton: import('@/types').LR0Automaton}} */
	let { followSet, automaton } = $props();
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<any>>>} */
	let stateList = writable([
		...automaton.states.map((x, index) => ({
			text: `s${x.index}`,
			note: '',
			data: x.index,
			id: index
		}))
	]);
	let alphabet = [...t, ...nt];

	let rows = Array.from({ length: automaton.states.length }, (_, index) => `s${index}`);
	let columns = [...alphabet];
	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let followSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stackSelection;
	/**@type {number[]}*/
	let breakpoints = $state([]);

	/**
	 * @param {typeof saves[0]} save
	 */
	function setStepCallback(save) {
		stateName = save.stateName;
		stateElem?.loadState(save.state);
		svgLines?.hideLine(false, id);
		table.set(tableCard(save.table, { key: (a) => `s${a}` }));
		resetAllSymbols(id, save.symbolIds);
		resetSelectFor(obj, functionCalls, save.functionCall);
	}

	export const obj = {
		highlightLines: () => codeCard?.highlightLines,
		addToTable: () => tableElem?.addToTable,
		selectForStack: () => stackSelection?.selectFor,
		selectFor: () => stateSelection?.selectFor,
		selectForFollow: () => followSelection?.selectFor,
		hideSelectStack: () => stackSelection?.hideSelect,
		hideSelect: () => stateSelection?.hideSelect,
		hideSelectFollow: () => followSelection?.hideSelect,
		addPause: () => addPause,
		selectSymbol: () => selectSymbol,
		deselectSymbol: () => deselectSymbol,
		stateName: () => {
			return (/** @type {string} */ value) => (stateName = value);
		},
		resetState: () => stateElem?.resetState,
		loadState: () => stateElem?.loadState,
		highlightOn: () => tableElem?.highlightOn,
		highlightOff: () => tableElem?.highlightOff,
		highlightDot: () => stateElem?.highlightDot
	};

	let stepExecution = new StepExecution(
		saves,
		functionCalls,
		[{ func: obj.highlightLines, breakpoints: () => breakpoints }],
		obj,
		id,
		setStepCallback
	);

	onMount(async () => {
		fetch('./slrtable.html').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		followSelection = getSelectionFunctions(elemIds.follow);
		stateSelection = getSelectionFunctions(elemIds.state);
		stackSelection = getSelectionFunctions(elemIds.stateStack);
		tableElem?.resetTable();
		automatonElem?.loadAutomaton(automaton);

		stepExecution.executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows style="pointer-events:none;">
		<PseudoCode bind:breakpoints title="Tabela SLR" bind:this={codeCard} id="slrtable"></PseudoCode>
		<Automaton {id} bind:this={automatonElem}></Automaton>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard
			labelTooltip={augmentedGrammarTooltip('SLR')}
			{id}
			cardId={elemIds.grammar}
			isAugmented={true}
		></GrammarCard>
		<TableCard
			{id}
			{rows}
			{columns}
			{svgLines}
			bind:table
			label="tabela slr"
			hue={colors.blue}
			tableId={elemIds.table}
			bind:this={tableElem}
		></TableCard>
		<StateCard
			{id}
			bind:this={stateElem}
			state={slrState}
			stateId={elemIds.state}
			label="estado"
			hue={colors.pink}
			bind:svgLines
			{stateName}
		></StateCard>
		<SetsCard {id} setId={elemIds.follow} set={followSet} label="follow" hue={200}></SetsCard>
		<StackCard
			{id}
			stack={stateList}
			stackId={elemIds.stateStack}
			label="estados novos"
			hue={colors.blue}
			bind:svgLines
		></StackCard>
	</div>
</div>

<style>
</style>
