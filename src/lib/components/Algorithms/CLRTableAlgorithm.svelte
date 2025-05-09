<script>
	import { writable } from 'svelte/store';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
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
	import PseudoCode from '@/Layout/PseudoCode.svelte';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {TableCard | undefined}*/
	let tableElem;
	/**@type {StateCard | undefined}*/
	let stateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem;
	/**@type {PseudoCode | undefined}*/
	let codeCard;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').LR1StateItem>>} */
	let state = writable([]);
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>}*/
	let table = writable(new Map());
	/**@type {import('@/types').LR1Automaton}*/
	export let automaton;
	let { t, nt, augRules, alphabet } = getAugGrammar();

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

			await codeCard?.highlightLines([1]); // Line 1: Table initialization
			await codeCard?.highlightLines([2]); // Line 2: Alphabet definition
			await codeCard?.highlightLines([3, 4]); // Lines 3-4: Initialize state entries

			for (let s of automaton.states) {
				await codeCard?.highlightLines([5]); // Line 5: State loop
				for (let i of s.items) {
					await codeCard?.highlightLines([6]); // Line 6: Item loop
					await addPause();

					await codeCard?.highlightLines([7]); // Line 7: End position check
					if (
						i.pos === augRules[i.ruleIndex].right.length ||
						augRules[i.ruleIndex].right[0] === ''
					) {
						await codeCard?.highlightLines([8]); // Line 8: Initial production check
						if (i.ruleIndex === 0) {
							await codeCard?.highlightLines([9]); // Line 9: Accept action
							await tableElem?.addToTable(
								{ action: 'a', state: i.ruleIndex },
								`a`,
								`s${s.index}`,
								'$'
							);
							continue;
						}

						await codeCard?.highlightLines([10]); // Line 10: Lookahead loop
						for (let symbol of i.lookahead) {
							await codeCard?.highlightLines([11]); // Line 11: Reduce action
							await tableElem?.addToTable(
								{ action: 'r', state: i.ruleIndex },
								`r${i.ruleIndex}`,
								`s${s.index}`,
								symbol
							);
						}
						continue;
					}

					await codeCard?.highlightLines([12]); // Line 12: Get current symbol
					const currentSymbol = augRules[i.ruleIndex].right[i.pos];

					await codeCard?.highlightLines([13]); // Line 13: Get transition
					let transition = automaton.transitions.get(s.index)?.get(currentSymbol);

					await codeCard?.highlightLines([14]); // Line 14: Non-terminal check
					if (nt.includes(currentSymbol)) {
						await codeCard?.highlightLines([15]); // Line 15: GOTO action
						await tableElem?.addToTable(
							{ action: 'g', state: transition },
							`g${transition}`,
							`s${s.index}`,
							currentSymbol
						);
					} else {
						await codeCard?.highlightLines([16, 17]); // Lines 16-17: SHIFT action
						await tableElem?.addToTable(
							{ action: 's', state: transition },
							`s${transition}`,
							`s${s.index}`,
							currentSymbol
						);
					}
				}
			}

			await codeCard?.highlightLines([]);

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

		fetch('./lr1table.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);

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
		<PseudoCode title="Tabela LR(1)" bind:this={codeCard}></PseudoCode>
		<Automaton id="clr" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
