<script>
	import { writable } from 'svelte/store';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
	import { colors, deselectSymbol, selectRSymbol, selectSymbol } from '$lib/selectSymbol';
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

	let stateStackElem = /**@type {StackCard | undefined}*/ ($state());
	let tableElem = /**@type {TableCard | undefined}*/ ($state());
	let stateElem = /**@type {StateCard | undefined}*/ ($state());
	let automatonElem = /**@type {Automaton | undefined}*/ ($state());
	let codeCard = /**@type {PseudoCode | undefined}*/ ($state());

	/** @type {{id: string, automaton: import('@/types').LR1Automaton}} */
	let { id, automaton } = $props();
	let { nt, augRules, alphabet } = getAugGrammar();

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

	let rows = Array.from({ length: automaton.states.length }, (value, index) => `s${index}`);

	let columns = [...alphabet];

	let stateName = $state('');
	let svgLines = /**@type {SvgLines | undefined}*/ ($state());
	let loadGrammar = /**@type {() => Promise<void>}*/ ($state());

	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let symbolsSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stateSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions?}*/
	let stateStackSelection;
	function reset() {
		try {
			stateElem?.resetState(false);
			svgLines?.hideLine(false, id);
			symbolsSelection?.hideSelect();
			stateSelection?.hideSelect();
			stateStackSelection?.hideSelect();
			tableElem?.resetTable();
			stateName = '';
		} catch (e) {}
		clrTable();
	}
	setResetCall(reset, id);

	async function clrTable() {
		if (stateElem) stateSelection = getSelectionFunctions(stateElem.getId());
		if (stateStackElem) stateStackSelection = getSelectionFunctions(stateStackElem.getId());

		try {
			await loadGrammar();

			await addPause(id);

			await codeCard?.highlightLines([1]);
			await codeCard?.highlightLines([2]);
			await codeCard?.highlightLines([3]);
			await codeCard?.highlightLines([4]);
			for (let [sindex, s] of automaton.states.entries()) {
				await stateStackSelection?.selectFor(`stack-${stateStackElem?.getId()}-${sindex}`);
				await stateElem?.resetState(true);
				stateName = `s${sindex}`;
				await stateElem?.loadState(s);
				await codeCard?.highlightLines([5]);
				for (let [index, item] of s.items.entries()) {
					await stateSelection?.selectFor(`state-${stateElem?.getId()}-${index}`);
					await codeCard?.highlightLines([6]);
					await codeCard?.highlightLines([7]);

					if (
						item.pos === augRules[item.ruleIndex].right.length ||
						augRules[item.ruleIndex].right[0] === ''
					) {
						await stateElem?.highlightDot(item.ruleIndex);
						await codeCard?.highlightLines([8]);
						if (item.ruleIndex === 0) {
							await codeCard?.highlightLines([9]);
							await tableElem?.highlightOn(`s${s.index}`, '$');
							await tableElem?.addToTable(
								{ action: 'a', state: item.ruleIndex },
								`a`,
								`s${s.index}`,
								'$'
							);
							await tableElem?.highlightOff();
							await addPause(id);
							await codeCard?.highlightLines([13]);
							stateSelection?.hideSelect();
							continue;
						}

						await codeCard?.highlightLines([10]);
						for (let symbol of item.lookahead) {
							await codeCard?.highlightLines([11]);
							await codeCard?.highlightLines([12]);

							await tableElem?.highlightOn(`s${s.index}`, symbol);
							await await tableElem?.addToTable(
								{ action: 'r', state: item.ruleIndex },
								`r${item.ruleIndex}`,
								`s${s.index}`,
								symbol
							);
							await tableElem?.highlightOff();
							await addPause(id);
						}
						await addPause(id);
						await codeCard?.highlightLines([13]);
						stateSelection?.hideSelect();
						continue;
					}

					await codeCard?.highlightLines([14]);
					const currentSymbol = augRules[item.ruleIndex].right[item.pos];

					await selectSymbol(
						`state-${stateElem?.getId()}-${item.ruleIndex}-${item.pos}`,
						colors.pink,
						id
					);
					await codeCard?.highlightLines([15]);
					let transition = automaton.transitions.get(s.index)?.get(currentSymbol);

					await codeCard?.highlightLines([16]);
					if (nt.includes(currentSymbol)) {
						await codeCard?.highlightLines([17]);

						await tableElem?.highlightOn(`s${s.index}`, currentSymbol);
						await tableElem?.addToTable(
							{ action: 'g', state: transition },
							`g${transition}`,
							`s${s.index}`,
							currentSymbol
						);
						await tableElem?.highlightOff();
						await addPause(id);
						await codeCard?.highlightLines([18]);
					} else {
						await codeCard?.highlightLines([18]);
						await codeCard?.highlightLines([19]);
						await tableElem?.highlightOn(`s${s.index}`, currentSymbol);
						await tableElem?.addToTable(
							{ action: 's', state: transition },
							`s${transition}`,
							`s${s.index}`,
							currentSymbol
						);
						await tableElem?.highlightOff();
						await addPause(id);
					}
					await deselectSymbol(`state-${stateElem?.getId()}-${item.ruleIndex}-${item.pos}`, id);
					stateSelection?.hideSelect();
				}
				stateSelection?.hideSelect();
				stateStackSelection?.hideSelect();
			}
			stateStackSelection?.hideSelect();

			await codeCard?.highlightLines([]);

			limitHit(id);
			await addPause(id);
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
			tableId={id}
			bind:this={tableElem}
		></TableCard>
		<GrammarCard {id} cardId={id} bind:loadGrammar></GrammarCard>
		<StateCard
			{id}
			state={clrState}
			stateId="destino{id}"
			label={'estado destino'}
			hue={colors.pink}
			bind:this={stateElem}
			bind:svgLines
			{stateName}
		></StateCard>
		<StackCard
			{id}
			stack={stateStack}
			stackId="temp{id}"
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
	</div>
	<div class="unit" style="padding: 5px; padding-bottom: 10px;flex: 1; height: 100%;">
		<PseudoCode title="Tabela LR(1)" bind:this={codeCard} id="clrtable"></PseudoCode>
		<Automaton id="clr" bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
