<script>
	import { writable } from 'svelte/store';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { onMount } from 'svelte';
	import { addPause, newRunningCall, setResetCall, wait } from '$lib/flowControl';
	import StateCard from './Cards/StateCard.svelte';
	import { getGrammar } from '$lib/utils';
	import GrammarCard from './Cards/GrammarCard.svelte';
	import { colors } from '$lib/selectSymbol';
	import Automaton from './Automaton.svelte';

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
	/** @type {import("svelte/store").Writable<Array<import('@/types').StackItem<number>>>} */
	let tempStack = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let targetState = writable([]);
	let { t, nt, rules } = getGrammar();
	let stateLabel = 'state 0';
	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;

	function reset() {
		stateStack.update(() => []);
		originState.update(() => []);
		svgLines?.hideLine();
		automatonElem?.reset();

		buildAutomaton();
	}
	setResetCall(reset);

	async function closure() {
		let itemsToCheck = [...$originState];
		while (itemsToCheck.length > 0) {
			/**@type {import("@/types").StateItem[]}*/
			let temp = [];
			for (let item of itemsToCheck) {
				let symbol = rules[item.ruleIndex].right[item.pos];
				if (!nt.includes(symbol)) continue;

				for (let rule of rules) {
					if (!(rule.left === symbol)) continue;
					if ($originState.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;
					await originStateElem?.addItem(rule.index, 0);
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

			await originStateElem?.addItem(0, 0);

			await closure();

			automaton.states.push({ index: automaton.states.length, items: [...$originState] });
			automatonElem?.addNode(null, 0, automaton.states[automaton.states.length - 1]);
			await addPause();
			let newStates = [automaton.states[0]];

			while (newStates.length > 0) {
				for (let symbol of [...t, ...nt]) {
					originStateElem?.resetState();
					stateLabel = `state ${automaton.states.length}`;
					for (let prod of newStates[0].items) {
						if (
							prod.pos >= rules[prod.ruleIndex].right.length ||
							rules[prod.ruleIndex].right[prod.pos] !== symbol
						)
							continue;
						if ($originState.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1))
							continue;
						await originStateElem?.addItem(prod.ruleIndex, prod.pos + 1);
					}
					if ($originState.length === 0) continue;
					await closure();
					let existent = automaton.states.findIndex((x) => {
						if (x.items.length != $originState.length) return false;
						let eq = true;
						for (let k = 0; k < x.items.length; k++) {
							let match = false;
							for (let m = 0; m < $originState.length; m++) {
								match =
									match ||
									(x.items[k].pos === $originState[m].pos &&
										x.items[k].ruleIndex === $originState[m].ruleIndex);
								if (match) break;
							}
							eq = match;
							if (!eq) break;
						}
						return eq;
					});
					if (existent === -1) {
						automaton.states.push({ index: automaton.states.length, items: [...$originState] });
						automatonElem?.addNode(
							newStates[0].index,
							automaton.states.length - 1,
							automaton.states[automaton.states.length - 1]
						);
						newStates.push(automaton.states[automaton.states.length - 1]);
						await addPause();
						continue;
					}

					automatonElem?.addNode(
						newStates[0].index,
						existent,
						automaton.states[automaton.states.length - 1]
					);
					await addPause();
				}
				newStates.shift();
			}
			stateLabel = `state -`;
		} catch (e) {
			console.log(e);
		}
	}

	onMount(() => {
		buildAutomaton();
	});
</script>

<SvgLines svgId="first-svg" bind:this={svgLines}></SvgLines>
<div class="cards-box unit" style="padding: 0 5px; flex-direction:column;align-items:stretch">
	<div style="flex: 0;display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap">
		<GrammarCard bind:loadGrammar></GrammarCard>
		<StateCard
			state={targetState}
			stateId={'origin'}
			label={'estado origem'}
			hue={colors.pink}
			bind:this={originStateElem}
		></StateCard>
		<StateCard
			state={originState}
			stateId={'target'}
			label={'estado destino'}
			hue={colors.pink}
			bind:this={originStateElem}
		></StateCard>
		<StackCard
			stack={tempStack}
			stackId="temp"
			label="estados novos"
			hue={colors.blue}
			bind:this={stateStackElem}
			bind:svgLines
		></StackCard>
	</div>
	<div style="padding: 5px; padding-bottom: 10px;flex: 1; height: 100%;">
		<Automaton bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
