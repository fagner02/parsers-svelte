<script>
	import { elemIds, functionCalls, id, saves } from '$lib/stepCalc/clr_table';
	import { addPause, noJumpWait, wait } from '$lib/flowControl';
	import { stackFloatingWindows } from '@/Layout/interactiveElem';
	import { colors, deselectSymbol, removeAllSymbols, selectSymbol } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import StackCard from '@/Cards/StackCard.svelte';
	import StateCard from '@/Cards/StateCard.svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import Automaton from '@/Structures/Automaton.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { tableCard } from '@/Tabs/dataToComp';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { StepExecution } from './exucuteSteps.svelte';

	let tableElem = /**@type {TableCard | undefined}*/ ($state());
	let stateElem = /**@type {StateCard | undefined}*/ ($state());
	let automatonElem = /**@type {Automaton | undefined}*/ ($state());
	let codeCard = /**@type {PseudoCode | undefined}*/ ($state());
	/**@type {number[]}*/
	let breakpoints = $state([]);

	/** @type {{
	 * automaton: import('@/types').LR1Automaton}} */
	let { automaton } = $props();
	let { alphabet } = getAugGrammar();

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable(
		automaton.states
			.map((s, i) => {
				return {
					data: i,
					text: `s${s.index}`,
					note: '',
					id: i
				};
			})
			.toReversed()
	);

	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let clrState = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>}*/
	let table = $state(writable(new Map()));

	let rows = Array.from({ length: automaton.states.length }, (_, index) => `s${index}`);
	let columns = [...alphabet];
	let stateName = $state('');
	let svgLines = /**@type {SvgLines | undefined}*/ ($state());
	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stateStackSelection;
	/**
	 * @param {typeof saves[0]} save
	 */
	async function setStepCallback(save) {
		svgLines?.hideLine(false, id);
		stateSelection?.hideSelect();
		stateStackSelection?.hideSelect();
		stateElem?.loadState(save.state, false);
		table.set(tableCard(save.table, { key: (a) => `s${a}` }));
		stateName = save.stateName;
		await noJumpWait(5000);
		removeAllSymbols(id, save.symbolIds);
	}

	const obj = {
		addPause: () => addPause,
		highlightLines: () => codeCard?.highlightLines,
		selectForStack: () => stateStackSelection?.selectFor,
		selectFor: () => stateSelection?.selectFor,
		resetState: () => stateElem?.resetState,
		loadState: () => stateElem?.loadState,
		highlightDot: () => stateElem?.highlightDot,
		highlightOff: () => tableElem?.highlightOff,
		highlightOn: () => tableElem?.highlightOn,
		addToTable: () => tableElem?.addToTable,
		hideSelect: () => stateSelection?.hideSelect,
		hideSelectStack: () => stateStackSelection?.hideSelect,
		selectSymbol: () => selectSymbol,
		deselectSymbol: () => deselectSymbol,
		stateName: () => {
			return (/** @type {string} */ value) => {
				stateName = value;
			};
		}
	};
	let stepExecution = new StepExecution(
		saves,
		functionCalls,
		[{ func: obj.highlightLines, breakpoints: () => breakpoints }],
		obj,
		id,
		setStepCallback
	);

	onMount(() => {
		stateSelection = getSelectionFunctions(elemIds.state);
		stateStackSelection = getSelectionFunctions(elemIds.stateStack);
		tableElem?.resetTable();
		automatonElem?.loadAutomaton(automaton);

		fetch('./lr1table.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);

		loadGrammar();
		stepExecution.executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="unit grid" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div class="cards-box unit" id="card-box{id}">
		<TableCard
			{id}
			{rows}
			{columns}
			{svgLines}
			bind:table
			label="tabela clr"
			hue={colors.blue}
			tableId={elemIds.table}
			bind:this={tableElem}
		></TableCard>
		<GrammarCard {id} cardId={elemIds.grammar} bind:loadGrammar></GrammarCard>
		<StateCard
			{id}
			state={clrState}
			stateId={elemIds.state}
			label={'estado destino'}
			hue={colors.pink}
			bind:this={stateElem}
			bind:svgLines
			{stateName}
		></StateCard>
		<StackCard
			{id}
			stack={stateStack}
			stackId={elemIds.stateStack}
			label="estados novos"
			hue={colors.blue}
			bind:svgLines
		></StackCard>
	</div>
	<div use:stackFloatingWindows class="unit" style="padding: 5px; padding-bottom: 10px;flex: 1; ">
		<PseudoCode bind:breakpoints title="Tabela LR(1)" bind:this={codeCard} id="clrtable"
		></PseudoCode>
		<Automaton id="clr" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
