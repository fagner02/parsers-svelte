<script>
	import { writable } from 'svelte/store';
	import { addPause, setResetCall, wait, limitHit, swapAlgorithm } from '$lib/flowControl';
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
	import { id, elemIds, saves, functionCalls } from '$lib/slrtable';
	import { tableCard } from '@/Tabs/dataToComp';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
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

	let rows = Array.from({ length: automaton.states.length }, (value, index) => `s${index}`);
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
		stateName = saves[step].stateName;
		stateElem?.loadState(saves[step].state);
		svgLines?.hideLine(false, id);
		saves[step].followSelect === ''
			? followSelection?.hideSelect()
			: followSelection?.selectFor(saves[step].followSelect);
		saves[step].stateSelect === ''
			? stateSelection?.hideSelect()
			: stateSelection?.selectFor(saves[step].stateSelect);
		saves[step].stackSelect === ''
			? stackSelection?.hideSelect()
			: stackSelection?.selectFor(saves[step].stackSelect);
		table.set(tableCard(saves[step].table, {}));
		currentStep = step;
		stepChanged = true;
	}
	setResetCall(setStep, saves.length - 1, id, () => currentStep);

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

	async function slrTable() {
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
					if (call.skip) obj[call.name]()(...call.args);
					else await obj[call.name]()(...call.args);
				} catch (e) {
					continue;
				}
				if (call.name === 'addPause') {
					currentStep++;
				}
				i++;
			}
			// await addPause(id);

			// await codeCard?.highlightLines([0]);
			// await codeCard?.highlightLines([1]);
			// await codeCard?.highlightLines([2]);
			// await codeCard?.highlightLines([3]);
			// await codeCard?.highlightLines([4]);

			// for (let s of automaton.states) {
			// 	await codeCard?.highlightLines([5]);
			// 	for (let i of s.items) {
			// 		await codeCard?.highlightLines([6]);
			// 		await addPause(id);

			// 		await codeCard?.highlightLines([7]);
			// 		if (
			// 			i.pos === augRules[i.ruleIndex].right.length ||
			// 			augRules[i.ruleIndex].right[0] === ''
			// 		) {
			// 			await codeCard?.highlightLines([8]);
			// 			let follow = $followSet.find((x) => x.left === augRules[i.ruleIndex].left);

			// 			await codeCard?.highlightLines([9]);
			// 			if (!follow) continue;

			// 			await codeCard?.highlightLines([11]);
			// 			if (i.ruleIndex === 0) {
			// 				await codeCard?.highlightLines([12]);
			// 				await tableElem?.addToTable(
			// 					{ action: 'a', state: i.ruleIndex },
			// 					`a`,
			// 					`s${s.index}`,
			// 					'$'
			// 				);
			// 				await codeCard?.highlightLines([13]);
			// 				continue;
			// 			}

			// 			await codeCard?.highlightLines([14]);
			// 			for (let symbol of follow.right) {
			// 				await codeCard?.highlightLines([15]);
			// 				await tableElem?.addToTable(
			// 					{ action: 'r', state: i.ruleIndex },
			// 					`r${i.ruleIndex}`,
			// 					`s${s.index}`,
			// 					symbol
			// 				);
			// 			}
			// 			await codeCard?.highlightLines([16]);
			// 			continue;
			// 		}

			// 		await codeCard?.highlightLines([17]);
			// 		const currentSymbol = augRules[i.ruleIndex].right[i.pos];

			// 		await codeCard?.highlightLines([18]);
			// 		let transition = automaton.transitions.get(s.index)?.get(currentSymbol);

			// 		await codeCard?.highlightLines([19]);
			// 		if (nt.includes(currentSymbol)) {
			// 			await codeCard?.highlightLines([20]);
			// 			await tableElem?.addToTable(
			// 				{ action: 'g', state: transition },
			// 				`g${transition}`,
			// 				`s${s.index}`,
			// 				currentSymbol
			// 			);
			// 		} else {
			// 			await codeCard?.highlightLines([21]);
			// 			await codeCard?.highlightLines([22]);
			// 			await tableElem?.addToTable(
			// 				{ action: 's', state: transition },
			// 				`s${transition}`,
			// 				`s${s.index}`,
			// 				currentSymbol
			// 			);
			// 		}
			// 	}
			// }

			// await codeCard?.highlightLines([23]);
			// limitHit(id);
			// await addPause(id);
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

		slrTable();
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
