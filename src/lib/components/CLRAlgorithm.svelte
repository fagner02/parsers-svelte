<script>
	import { writable } from 'svelte/store';
	import { setResetCall, wait } from '$lib/flowControl';
	import { colors } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import { onMount } from 'svelte';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import StateCard from './Cards/StateCard.svelte';
	import GrammarCard from './Cards/GrammarCard.svelte';
	import Automaton from './Automaton.svelte';
	import { getSelectionFunctions } from '@/Cards/selectionFunction';
	import SetsCard from './Cards/SetsCard.svelte';
	import SlrAlgorithm from './SLRAlgorithm.svelte';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {StateCard | undefined}*/
	let originStateElem;
	/**@type {StateCard | undefined}*/
	let targetStateElem;
	/**@type {Automaton | undefined}*/
	let automatonElem;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let targetState = writable([]);
	/**@type {import('svelte/store').Writable<import('@/types').SetRow[]>}*/
	export let firstSet;
	let { t, nt, rules } = getGrammar();
	let alphabet = [...t.filter((x) => x !== '$'), ...nt];

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<string>>>} */
	let symbolList = writable(
		alphabet.map((x) => ({
			opacity: 1,
			height: -1,
			width: -1,
			top: 0,
			data: x,
			text: x,
			note: '',
			transition: '',
			id: x,
			showBlock: true
		}))
	);

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let symbolsSelection;
	/**@type {import('@/Cards/selectionFunction').SelectionFunctions}*/
	let stateSelection;

	function reset() {
		stateStack.update(() => []);
		originStateElem?.resetState();
		targetStateElem?.resetState();
		svgLines?.hideLine();
		automatonElem?.reset();
		symbolsSelection.hideSelect();
		stateSelection.hideSelect();

		buildAutomaton();
	}
	setResetCall(reset);

	async function closure() {
		let itemsToCheck = [...$targetState];
		while (itemsToCheck.length > 0) {
			/**@type {import("@/types").StateItem[]}*/
			let temp = [];
			for (let item of itemsToCheck) {
				let symbol = rules[item.ruleIndex].right[item.pos];
				if (!nt.includes(symbol)) continue;
				let lookahead = new Set();
				if (rules[item.ruleIndex].right.length - 1 === item.pos) {
					lookahead = new Set(item.lookahead);
				} else {
					/**@type {string[]}*/
					let betaFirst = [];
					let nullable = true;
					for (let i = 1; item.pos + i < rules[item.ruleIndex].right.length; i++) {
						let beta = rules[item.ruleIndex].right[item.pos + i];
						if (!nt.includes(beta)) {
							betaFirst.push(beta);
							nullable = false;
							break;
						} else {
							let first = /**@type {string[]}*/ ($firstSet.find((x) => x.left === beta)?.right);
							betaFirst = betaFirst.concat(first.filter((x) => x !== ''));

							if (!first.includes('')) {
								nullable = false;
								break;
							}
						}
					}
					if (nullable) {
						lookahead = new Set([...betaFirst, .../**@type {Set<string>}*/ (item.lookahead)]);
					} else {
						lookahead = new Set(betaFirst);
					}
				}
				for (let rule of rules) {
					if (!(rule.left === symbol)) continue;
					let existent = $targetState.findIndex((x) => x.ruleIndex === rule.index && x.pos === 0);

					if (existent === -1) {
						await targetStateElem?.addItem(rule.index, 0, lookahead);
						temp.push({ ruleIndex: rule.index, pos: 0, lookahead });
						continue;
					}
					await targetStateElem?.updateLookahead(/**@type {Set<string>}*/ (lookahead), existent);
				}
			}
			itemsToCheck = temp;
		}
	}

	async function buildAutomaton() {
		try {
			await loadGrammar();
			await wait(500);

			/**@type {import('@/types').Automaton}*/
			let automaton = { states: [], transitions: new Map() };

			await targetStateElem?.addItem(0, 0, new Set(['$']));

			await closure();
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		symbolsSelection = getSelectionFunctions('symbolList');
		stateSelection = getSelectionFunctions('origem');
		buildAutomaton();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div style="flex: 0;display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap">
		<GrammarCard bind:loadGrammar></GrammarCard>
		<SetsCard set={firstSet} label="first" setId="first" hue={200}></SetsCard>
		<StateCard
			state={targetState}
			stateId={'destino'}
			label={'estado destino'}
			hue={colors.pink}
			bind:this={targetStateElem}
		></StateCard>
		<StateCard
			state={originState}
			stateId={'origem'}
			label={'estado origem'}
			hue={colors.pink}
			bind:this={originStateElem}
		></StateCard>
		<StackCard
			stack={stateStack}
			stackId="temp"
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
		<StackCard
			stack={symbolList}
			stackId="symbolList"
			label="alfabeto"
			hue={colors.green}
			reversed={false}
			bind:svgLines
		></StackCard>
	</div>
	<div style="padding: 5px; padding-bottom: 10px;flex: 1; height: 100%;">
		<Automaton bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
