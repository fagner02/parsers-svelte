<script>
	import { writable } from 'svelte/store';
	import { addPause, newRunningCall, setResetCall, wait } from '$lib/flowControl';
	import { colors } from '$lib/selectSymbol';
	import { getGrammar } from '$lib/utils';
	import { onMount } from 'svelte';
	import StackCard from './Cards/StackCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import StateCard from './Cards/StateCard.svelte';
	import GrammarCard from './Cards/GrammarCard.svelte';
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
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let originState = writable([]);
	/** @type {import('svelte/store').Writable<Array<import('@/types').StateItem>>} */
	let targetState = writable([]);
	let { t, nt, rules } = getGrammar();

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {() => Promise<void>}*/
	let loadGrammar;

	function reset() {
		stateStack.update(() => []);
		originStateElem?.resetState();
		targetStateElem?.resetState();
		svgLines?.hideLine();
		automatonElem?.reset();

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

				for (let rule of rules) {
					if (!(rule.left === symbol)) continue;
					if ($targetState.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;
					await targetStateElem?.addItem(rule.index, 0);
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

			await targetStateElem?.addItem(0, 0);

			await closure();

			automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
			automatonElem?.addNode(null, 0, automaton.states[automaton.states.length - 1]);
			await addPause();

			await stateStackElem?.addToStack(0, 's0', '', '0', `label-${targetStateElem?.getId()}`);

			while ($stateStack.length > 0) {
				await originStateElem?.resetState();
				await originStateElem?.loadState(automaton.states[stateStackElem?.first()]);
				for (let symbol of [...t, ...nt]) {
					await targetStateElem?.resetState();

					for (let prod of automaton.states[stateStackElem?.first()].items) {
						if (
							prod.pos >= rules[prod.ruleIndex].right.length ||
							rules[prod.ruleIndex].right[prod.pos] !== symbol
						)
							continue;
						if ($targetState.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1))
							continue;
						await targetStateElem?.addItem(prod.ruleIndex, prod.pos + 1);
					}
					if ($targetState.length === 0) continue;
					await closure();
					let existent = automaton.states.findIndex((x) => {
						if (x.items.length != $targetState.length) return false;
						let eq = true;
						for (let k = 0; k < x.items.length; k++) {
							let match = false;
							for (let m = 0; m < $targetState.length; m++) {
								match =
									match ||
									(x.items[k].pos === $targetState[m].pos &&
										x.items[k].ruleIndex === $targetState[m].ruleIndex);
								if (match) break;
							}
							eq = match;
							if (!eq) break;
						}
						return eq;
					});
					if (existent === -1) {
						automaton.states.push({ index: automaton.states.length, items: [...$targetState] });
						automatonElem?.addNode(
							stateStackElem?.first(),
							automaton.states.length - 1,
							automaton.states[automaton.states.length - 1]
						);
						await stateStackElem?.addToStack(
							automaton.states.length - 1,
							`s${automaton.states.length - 1}`,
							'',
							`${automaton.states.length - 1}`,
							`label-${targetStateElem?.getId()}`
						);
						await addPause();
						continue;
					}

					automatonElem?.addNode(
						stateStackElem?.first(),
						existent,
						automaton.states[automaton.states.length - 1]
					);
					await addPause();
				}

				await stateStackElem?.removeFromStack(0);
			}
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
	</div>
	<div style="padding: 5px; padding-bottom: 10px;flex: 1; height: 100%;">
		<Automaton bind:this={automatonElem}></Automaton>
	</div>
</div>

<style>
</style>
