<script>
	import { writable } from 'svelte/store';
	import { addPause, setCurrentStep, setStepCall } from '$lib/flowControl';
	import { colors, deselectSymbol, selectSymbol } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
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
	import { setInfoComponent } from '$lib/infoText';
	import SlrTableInfo from '@/Info/SLRTableInfo.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, elemIds, saves, functionCalls, slrTable } from '$lib/slrtable';
	import { tableCard } from '@/Tabs/dataToComp';

	/**@type {TableCard | undefined}*/
	let tableElem = $state();
	/**@type {StateCard | undefined}*/
	let stateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem = $state();
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();
	let stateName = $state('');
	let currentStep = 0;
	let stepChanged = false;

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
	let { alphabet } = getAugGrammar();

	let rows = Array.from({ length: automaton.states.length }, (_, index) => `s${index}`);
	let columns = [...alphabet];
	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let followSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stackSelection;

	/**
	 * @param {number} step
	 */
	function setStep(step) {
		const save = saves[step];
		if (save === undefined) {
			console.error(`Step ${step} not found`);
			return;
		}
		stateName = save.stateName;
		stateElem?.loadState(save.state);
		svgLines?.hideLine(false, id);
		try {
			save.followSelect === ''
				? followSelection?.hideSelect()
				: followSelection?.selectFor(save.followSelect);
			save.stateSelect === ''
				? stateSelection?.hideSelect()
				: stateSelection?.selectFor(save.stateSelect);
			save.stackSelect === ''
				? stackSelection?.hideSelect()
				: stackSelection?.selectFor(save.stackSelect);
		} catch (e) {
			console.log(e);
		}
		table.set(tableCard(save.table, { key: (a) => `s${a}` }));
		currentStep = step;
		setCurrentStep(currentStep);
		stepChanged = true;
	}
	setStepCall(setStep, saves.length - 1, id, () => currentStep);

	/**@type {any}*/
	const obj = {
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

	async function executeSteps() {
		try {
			await loadGrammar();
			let i = 0;
			while (i < functionCalls.length || stepChanged) {
				if (stepChanged) {
					stepChanged = false;
					i = saves[currentStep].functionCall;
					continue;
				}
				const call = functionCalls[i];
				try {
					if (call.skip !== undefined) obj[call.name]()(...call.args);
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
		} catch (e) {
			console.log(e);
		}
	}
	onMount(async () => {
		fetch('./slrtable.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(SlrTableInfo);
		followSelection = getSelectionFunctions(elemIds.follow);
		stateSelection = getSelectionFunctions(elemIds.state);
		stackSelection = getSelectionFunctions(elemIds.stateStack);
		tableElem?.resetTable();
		automatonElem?.loadAutomaton(automaton);

		executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Tabela SLR" bind:this={codeCard} id="slrtable"></PseudoCode>
		<Automaton {id} bind:this={automatonElem}></Automaton>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} isAugmented={true} bind:loadGrammar></GrammarCard>
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
