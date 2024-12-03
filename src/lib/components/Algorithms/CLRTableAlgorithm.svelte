<script>
	import { writable } from 'svelte/store';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
	import { colors } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import { onMount } from 'svelte';
	import TableCard from '@/Cards/TableCard.svelte';
	import StackCard from '@/Cards/StackCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import StateCard from '@/Cards/StateCard.svelte';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import Automaton from '@/Structures/Automaton.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {TableCard | undefined}*/
	let tableElem;
	/**@type {StateCard | undefined}*/
	let stateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let state = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>}*/
	let table = writable(new Map());
	/**@type {import('@/types').LR1Automaton}*/
	export let automaton;
	let { t, nt, rules, alphabet } = getGrammar();

	let rows = Array.from({ length: automaton.states.length }, (value, index) => `s${index}`);

	let columns = [...alphabet];
	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let symbolsSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stateSelection;

	function reset() {
		try {
			stateStack.update(() => []);
			stateElem?.resetState(false);
			svgLines?.hideLine(false);
			symbolsSelection?.hideSelect();
			stateSelection?.hideSelect();
			tableElem?.resetTable();
		} catch (e) {}
		clrTable();
	}
	setResetCall(reset);

	async function clrTable() {
		if (stateElem) stateSelection = getSelectionFunctions(stateElem.getId());
		try {
			await loadGrammar();
			await wait(500);

			for (let s of automaton.states) {
				for (let i of s.items) {
					await addPause();
					if (i.pos === rules[i.ruleIndex].right.length || rules[i.ruleIndex].right[0] === '') {
						if (i.ruleIndex === 0) {
							await tableElem?.addToTable(
								{ action: 'a', state: i.ruleIndex },
								`a`,
								`s${s.index}`,
								'$'
							);
							continue;
						}
						for (let symbol of i.lookahead) {
							await tableElem?.addToTable(
								{ action: 'r', state: i.ruleIndex },
								`r${i.ruleIndex}`,
								`s${s.index}`,
								symbol
							);
						}
						continue;
					}
					let transition = automaton.transitions.get(s.index)?.get(rules[i.ruleIndex].right[i.pos]);

					if (nt.includes(rules[i.ruleIndex].right[i.pos])) {
						await tableElem?.addToTable(
							{ action: 'g', state: transition },
							`g${transition}`,
							`s${s.index}`,
							`${rules[i.ruleIndex].right[i.pos]}`
						);
					} else {
						await tableElem?.addToTable(
							{ action: 's', state: transition },
							`s${transition}`,
							`s${s.index}`,
							`${rules[i.ruleIndex].right[i.pos]}`
						);
					}
				}
			}
			limitHit();
			await addPause();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		symbolsSelection = getSelectionFunctions('symbolList');
		stateSelection = getSelectionFunctions('origem');
		tableElem?.resetTable();
		automatonElem?.loadAutomaton(automaton);
		clrTable();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="unit grid" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div class="cards-box unit">
		<TableCard
			{rows}
			{columns}
			{svgLines}
			bind:table
			label="tabela clr"
			hue={colors.blue}
			tableId="slrtable"
			bind:this={tableElem}
		></TableCard>
		<GrammarCard bind:loadGrammar></GrammarCard>
		<StateCard
			{state}
			stateId={'destino'}
			label={'estado destino'}
			hue={colors.pink}
			bind:this={stateElem}
			bind:svgLines
		></StateCard>
		<StackCard
			stack={stateStack}
			stackId="temp"
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
	</div>
	<div class="unit" style="padding: 5px; padding-bottom: 10px;flex: 1; height: 100%;">
		<Automaton id="clr" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
