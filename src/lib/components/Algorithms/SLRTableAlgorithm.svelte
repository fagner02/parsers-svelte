<script>
	import { writable } from 'svelte/store';
	import { addPause, setResetCall, wait } from '$lib/flowControl';
	import { colors } from '$lib/selectSymbol';
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

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {StackCard | undefined}*/
	let symbolListElem;
	/**@type {TableCard | undefined}*/
	let tableElem;
	/**@type {StateCard | undefined}*/
	let stateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem;
	/**@type {PseudoCode | undefined}*/
	let codeCard;

	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let state = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>}*/
	let table = writable(new Map());
	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let followSet;
	/**@type {import('@/types').LR0Automaton}*/
	export let automaton;
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<any>>>} */
	let stateList = writable([
		...automaton.states.map((x, index) => ({
			text: `s${x.index}`,
			note: '',
			data: x.index,
			id: index
		}))
	]);
	let { nt, augRules, alphabet } = getAugGrammar();

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
			stateElem?.resetState(false);
			svgLines?.hideLine(false);
			symbolsSelection?.hideSelect();
			stateSelection?.hideSelect();
			tableElem?.resetTable();
		} catch (e) {}
		slrTable();
	}
	setResetCall(reset);

	async function slrTable() {
		if (stateElem) stateSelection = getSelectionFunctions(stateElem.getId());
		if (symbolListElem) symbolsSelection = getSelectionFunctions(symbolListElem.getId());
		try {
			await loadGrammar();
			await wait(500);

			for (let s of automaton.states) {
				for (let i of s.items) {
					await addPause();
					if (
						i.pos === augRules[i.ruleIndex].right.length ||
						augRules[i.ruleIndex].right[0] === ''
					) {
						if (i.ruleIndex === 0) {
							await tableElem?.addToTable(
								{ action: 'a', state: i.ruleIndex },
								`a`,
								`s${s.index}`,
								'$'
							);
							continue;
						}
						let follow = $followSet.find((x) => x.left === augRules[i.ruleIndex].left);
						if (!follow) continue;

						for (let symbol of follow.right) {
							await tableElem?.addToTable(
								{ action: 'r', state: i.ruleIndex },
								`r${i.ruleIndex}`,
								`s${s.index}`,
								symbol
							);
						}
						continue;
					}
					let transition = automaton.transitions
						.get(s.index)
						?.get(augRules[i.ruleIndex].right[i.pos]);

					if (nt.includes(augRules[i.ruleIndex].right[i.pos])) {
						await tableElem?.addToTable(
							{ action: 'g', state: transition },
							`g${transition}`,
							`s${s.index}`,
							`${augRules[i.ruleIndex].right[i.pos]}`
						);
					} else {
						await tableElem?.addToTable(
							{ action: 's', state: transition },
							`s${transition}`,
							`s${s.index}`,
							`${augRules[i.ruleIndex].right[i.pos]}`
						);
					}
				}
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
		symbolsSelection = getSelectionFunctions('symbolList');
		stateSelection = getSelectionFunctions('origem');
		tableElem?.resetTable();
		automatonElem?.loadAutomaton(automaton);
		slrTable();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="grid unit">
	<div class="unit">
		<PseudoCode bind:this={codeCard}></PseudoCode>
		<Automaton id="slr" bind:this={automatonElem}></Automaton>
	</div>
	<div class="cards-box unit">
		<GrammarCard isAugmented={true} bind:loadGrammar></GrammarCard>
		<TableCard
			{rows}
			{columns}
			{svgLines}
			bind:table
			label="tabela slr"
			hue={colors.blue}
			tableId="slrtable"
			bind:this={tableElem}
		></TableCard>
		<SetsCard set={followSet} label="follow" setId="follow" hue={200}></SetsCard>
		<StackCard
			stack={stateList}
			stackId="statelist"
			label="estados novos"
			hue={colors.blue}
			bind:svgLines
		></StackCard>
	</div>
</div>

<style>
</style>
