<script>
	import { writable } from 'svelte/store';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { onMount } from 'svelte';
	import { newRunningCall, setResetCall, wait } from '$lib/flowControl';
	import StateCard from './Cards/StateCard.svelte';
	import { getGrammar } from '$lib/utils';
	import anime from 'animejs';
	import GrammarCard from './Cards/GrammarCard.svelte';
	import { colors } from '$lib/selectSymbol';
	import Automaton from './Automaton.svelte';

	/**@type {StackCard | undefined}*/
	let stateStackElem;
	/**@type {StateCard | undefined}*/
	let stateElem;

	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let stateStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let stateSet = writable([]);
	let { nt, rules } = getGrammar();

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;

	/**@type {any}*/
	let addNode;

	function reset() {
		stateStack.update(() => []);
		stateSet.update(() => []);
		svgLines?.hideLine();

		buildAutomaton();
	}
	setResetCall(reset);

	async function closure() {
		let itemsToCheck = [...$stateSet];
		while (itemsToCheck.length > 0) {
			/**@type {import("@/types").StateItem[]}*/
			let temp = [];
			for (let item of itemsToCheck) {
				let symbol = rules[item.ruleIndex].right[item.pos];
				if (!nt.includes(symbol)) continue;

				for (let rule of rules) {
					if (!(rule.left === symbol)) continue;
					if ($stateSet.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;
					await stateElem?.addItem(rule.index, 0);
					temp.push({ ruleIndex: rule.index, pos: 0, hide: true });
				}
			}
			itemsToCheck = temp;
		}
	}

	async function buildAutomaton() {
		const id = newRunningCall();

		try {
			await loadGrammar();
			await wait(500);

			/**@type {import('@/types').Automaton}*/
			let automaton = { states: [], transitions: new Map() };

			await stateElem?.addItem(0, 0);

			await closure();
			automaton.states.push($stateSet);
		} catch {}
	}

	onMount(() => {
		buildAutomaton();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit" style="padding: 0 5px;">
	<div style="padding: 5px; padding-bottom: 0px;flex: 1; height: 100%;">
		<Automaton bind:addNode></Automaton>
	</div>
	<div style="flex: 0;">
		<GrammarCard bind:loadGrammar></GrammarCard>
		<StackCard
			stack={stateStack}
			stackId="state"
			label="state stack"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
		<StateCard
			state={stateSet}
			stateId={'state'}
			label="state"
			hue={colors.pink}
			bind:this={stateElem}
		></StateCard>
	</div>
</div>

<style>
</style>
