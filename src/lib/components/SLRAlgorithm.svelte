<script>
	import { writable } from 'svelte/store';
	import GrammarCard from './Cards/GrammarCard.svelte';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { onMount } from 'svelte';
	import { newRunningCall, setResetCall } from '$lib/flowControl';
	import SetsCard from './Cards/SetsCard.svelte';
	import { colors } from '$lib/selectSymbol';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {SetsCard | undefined}*/
	let stateSetElem;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').SetRow>>} */
	let stateSet = writable([]);

	/** @type {Array<import('@/types').GrammarItem>} */
	export let rules;
	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;

	function reset() {
		stateStack.update(() => []);

		svgLines?.hideLine();
	}
	setResetCall(reset);
	async function closure() {}
	async function buildAutomaton() {
		const id = newRunningCall();

		try {
			/**@type {import('@/types').Automaton}*/
			let automaton = { states: [], transitions: new Map() };

			/**@type {import('@/types').StateItem[]}*/
			let state0 = [{ ruleIndex: 0, pos: 0 }];
			automaton.states.push(state0);
		} catch {}
	}

	onMount(() => {
		loadGrammar();
		buildAutomaton();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit">
	<GrammarCard {rules} bind:loadGrammar></GrammarCard>
	<StackCard
		stack={stateStack}
		stackId="state"
		label="state stack"
		hue={colors.blue}
		bind:this={stateStackElem}
		bind:svgLines
	></StackCard>
	<!-- <SetsCard set={stateSet} label="state" color="pink"></SetsCard> -->
</div>
