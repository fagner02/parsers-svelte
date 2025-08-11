<script>
	import { addPause } from '$lib/flowControl';
	import { stackFloatingWindows } from '@/Layout/interactiveElem';
	import { elemIds, functionCalls, id, saves } from '$lib/stepCalc/lltable';
	import { colors, deselectSymbol, removeAllSymbols, selectSymbol } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import SetsCard from '@/Cards/SetsCard.svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { tableCard } from '@/Tabs/dataToComp';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { StepExecution } from './exucuteSteps.svelte';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();
	/**@type {PseudoCode | undefined}*/
	let codeCard = $state();
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions | undefined}*/
	let firstFuncs;

	let tableElement = /**@type {TableCard}*/ ($state());
	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());

	/**@type {number[]}*/
	let breakpoints = $state([]);
	let { nt, t, rules } = getGrammar();

	/** @type {{
	 * table?: import('svelte/store').Writable<Map<string, import('@/types').tableCol<any>>>,
	 * instruction: string,
	 * firstSet: import('svelte/store').Writable<import('@/types').SetRow[]>,
	 * followSet: import('svelte/store').Writable<import('@/types').SetRow[]>}} */
	let {
		table = $bindable(writable(new Map())),
		instruction = $bindable(),
		firstSet,
		followSet
	} = $props();

	const obj = {
		addPause: () => addPause,
		selectSymbol: () => selectSymbol,
		deselectSymbol: () => deselectSymbol,
		highlightLines: () => codeCard?.highlightLines,
		selectFirst: () => firstFuncs?.selectFor,
		showConflict: () => tableElement?.showConflict,
		addToTable: () => tableElement?.addToTable,
		setConflictTooltip: () => tableElement?.setConflictTooltip,
		highlightOn: () => tableElement?.highlightOn,
		highlightOff: () => tableElement?.highlightOff
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

	/**@param {typeof saves[0]} save
	 */
	async function setStepCallback(save) {
		svgLines?.setHideOpacity();
		tableElement.resetTable();
		table.set(tableCard(save.table, {}));
		const conflict = save.conflict;
		if (conflict) {
			await tableElement.showConflict(conflict.row, conflict.col);
			tableElement.setConflictTooltip(conflict.tooltip);
		}
		save.firstSelect === '' ? firstFuncs?.hideSelect() : firstFuncs?.selectFor(save.firstSelect);

		removeAllSymbols(id, save.symbolIds);
	}

	onMount(async () => {
		firstFuncs = getSelectionFunctions(elemIds.firstSet);
		tableElement?.resetTable();
		fetch('./lltable.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);

		loadGrammar();
		stepExecution.executeSteps();
	});
</script>

<SvgLines svgId="{id}-svg" {id} bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode bind:breakpoints title="Tabela LL(1)" bind:this={codeCard} id="lltable"
		></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={elemIds.grammar} bind:loadGrammar></GrammarCard>
		<TableCard
			{id}
			rows={nt}
			columns={t}
			bind:table
			bind:svgLines
			bind:this={tableElement}
			convert={(v) =>
				v > -1
					? `${rules[v].left} -> ${rules[v].right[0] === '' ? 'ε' : rules[v].right.join(' ')}`
					: ''}
			tableId={elemIds.table}
			label="tabela ll(1)"
			hue={colors.blue}
		></TableCard>
		<SetsCard {id} setId={elemIds.followSet} set={followSet} hue={colors.blue} label={'follow set'}
		></SetsCard>
		<SetsCard
			{id}
			setId={elemIds.firstSet}
			set={firstSet}
			convert={{
				left: (value) => rules[value].left,
				noteLeft: (value) => value.toString()
			}}
			hue={colors.blue}
			label={'first set'}
		></SetsCard>
	</div>
</div>

<style>
</style>
