<script>
	import { writable } from 'svelte/store';
	import TableCard from '@/Cards/TableCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import { addPause, limitHit, setResetCall, wait } from '$lib/flowControl';
	import StackCard from '@/Cards/StackCard.svelte';
	import { getContext, onMount } from 'svelte';
	import { getTreeFunctions } from '$lib/treeFunctions';
	import { colors } from '$lib/selectSymbol';
	import { getAugGrammar } from '$lib/utils';
	import GrammarCard from '@/Cards/GrammarCard.svelte';
	import { inputString } from '$lib/parseString';

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	export let table;
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let inputStack = writable([]);
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let stateStack = writable([]);
	export let stateList;

	/** @type {StackCard}*/
	let stateStackElement;
	/** @type {StackCard}*/
	let inputStackElement;
	let { augRules, alphabet, startingSymbol } = getAugGrammar();
	let context = getContext('parseView');
	/**
	 * @type {() => Promise<any>}
	 */
	let loadGrammar;

	let { initializeTree, addToTree, resetTree } = getTreeFunctions();

	function reset() {
		stateStack.update(() => []);
		inputStack.update(() => []);
		svgLines?.setHideOpacity();
		context.setAccept(null);

		parsing();
	}
	setResetCall(reset);

	async function parsing() {
		try {
			await wait(100);
			resetTree();

			if (initializeTree === undefined) {
				let functions = getTreeFunctions();
				initializeTree = functions.initializeTree;
				addToTree = functions.addToTree;
				resetTree = functions.resetTree;
			}
			await stateStackElement.addToStack(0, 's0', '');

			await initializeTree(startingSymbol);

			for (let i of ['$'].concat(inputString.replaceAll(' ', '').split('').reverse())) {
				await inputStackElement.addToStack(i, i, '');
			}

			while (true) {
				const topState = /**@type {number}*/ stateStackElement.top();
				const topInput = inputStackElement.top();
				const action = $table.get(`s${topState}`)?.get(topInput);
				if (!action || action?.data === '') {
					context.setAccept(false);
					break;
				}
				if (action.data.startsWith('a')) {
					context.setAccept(true);
					break;
				}
				if (action.data.startsWith('s')) {
					let state = parseInt(action.data.slice(1));
					await stateStackElement.addToStack(topInput, topInput, '');
					await stateStackElement.addToStack(state, `s${state}`, '');
					await inputStackElement.removeFromStack($inputStack.length - 1);
				}
				if (action.data.startsWith('r')) {
					let rule = parseInt(action.data.slice(1));
					if (augRules[rule].right[0] !== '') {
						for (let i = 0; i < augRules[rule].right.length; i++) {
							await stateStackElement.removeFromStack($stateStack.length - 1);
							await stateStackElement.removeFromStack($stateStack.length - 1);
						}
					}

					let goto = $table.get(`s${stateStackElement.top()}`)?.get(augRules[rule].left)?.data;
					if (!goto) {
						context.setAccept(false);
						break;
					}
					let gotoState = parseInt(goto?.slice(1));
					await stateStackElement.addToStack(augRules[rule].left, augRules[rule].left, '');
					await stateStackElement.addToStack(gotoState, `s${gotoState}`, '');
				}

				await addPause();
			}

			limitHit();
			await addPause();
		} catch (e) {}
	}

	onMount(async () => {
		loadGrammar();
		await parsing();
	});
</script>

<SvgLines bind:this={svgLines} svgId="llparse"></SvgLines>
<div class="cards-box unit">
	<GrammarCard isAugmented={true} bind:loadGrammar></GrammarCard>
	<TableCard
		rows={stateList}
		columns={alphabet}
		{table}
		bind:svgLines
		tableId="ll"
		label="tabela ll(1)"
		hue={colors.blue}
	></TableCard>
	<StackCard
		bind:svgLines
		bind:stack={inputStack}
		bind:this={inputStackElement}
		stackId="input"
		hue={colors.green}
		label="entrada"
	></StackCard>
	<StackCard
		bind:svgLines
		bind:stack={stateStack}
		bind:this={stateStackElement}
		stackId="symbols"
		hue={colors.green}
		label="pilha de símbolos"
	></StackCard>
</div>
