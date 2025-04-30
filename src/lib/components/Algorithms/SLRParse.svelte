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
	import { setInfoComponent } from '$lib/infoText';
	import SlrParsingInfo from '@/Info/SLRParsingInfo.svelte';
	import { inputString } from '$lib/parseString';
	import PseudoCode from '@/Layout/PseudoCode.svelte';

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>} */
	export let table;
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let inputStack = writable([]);
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let stateStack = writable([]);
	export let stateList;
	/**@type {PseudoCode}*/
	let codeCard;

	/** @type {StackCard}*/
	let stateStackElement;
	/** @type {StackCard}*/
	let inputStackElement;
	let { nt, augRules, alphabet, startingSymbol } = getAugGrammar();
	let context = getContext('parseView');
	/** @type {() => Promise<any>} */
	let loadGrammar;

	let {
		initializeTree,
		addFloatingNode: addFloatingNode,
		resetTree,
		addParent
	} = getTreeFunctions();

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
				addFloatingNode = functions.addFloatingNode;
				resetTree = functions.resetTree;
			}

			await codeCard?.highlightLines([1]);
			await stateStackElement.addToStack(0, 's0', '');

			for (let i of ['$'].concat(inputString.replaceAll(' ', '').split('').reverse())) {
				await codeCard?.highlightLines([2]);
				await inputStackElement.addToStack(i, i, '');
			}

			while (true) {
				await codeCard?.highlightLines([3]); // Line 2: Main loop
				await codeCard?.highlightLines([4]); // Line 3: Get current state
				const topState = /**@type {number}*/ stateStackElement.top();
				await codeCard?.highlightLines([5]); // Line 4: Get lookahead
				const topInput = inputStackElement.top();

				await codeCard?.highlightLines([6]); // Line 5: Get table action
				const action = $table.get(`s${topState}`)?.get(topInput);

				await codeCard?.highlightLines([7]); // Line 6: Handle invalid action
				if (!action || action?.data === '') {
					await codeCard?.highlightLines([8]);
					context.setAccept(false);
					break;
				}

				await codeCard?.highlightLines([9]);
				if (action.data.startsWith('a')) {
					await codeCard?.highlightLines([10]);
					context.setAccept(true);
					break;
				}

				await codeCard?.highlightLines([11]);
				if (action.data.startsWith('s')) {
					await codeCard?.highlightLines([12]);

					let state = parseInt(action.data.slice(1));
					addFloatingNode([topInput]);
					await codeCard?.highlightLines([13]);
					await stateStackElement.addToStack(topInput, topInput, '');
					await codeCard?.highlightLines([14]);
					await stateStackElement.addToStack(state, `s${state}`, '');
					await codeCard?.highlightLines([15]);
					await inputStackElement.removeFromStack($inputStack.length - 1);
				}

				await codeCard?.highlightLines([16]);
				if (action.data.startsWith('r')) {
					await codeCard?.highlightLines([17]);
					await codeCard?.highlightLines([18]);
					let rule = parseInt(action.data.slice(1));
					let children = [];

					await codeCard?.highlightLines([19]); // Lines 12-14: Reduce non-empty production
					if (augRules[rule].right[0] !== '') {
						for (let i = 0; i < augRules[rule].right.length; i++) {
							await codeCard?.highlightLines([20]);
							children.push($stateStack[$stateStack.length - 2].data);
							await codeCard?.highlightLines([21]);
							await stateStackElement.removeFromStack($stateStack.length - 1);
							await codeCard?.highlightLines([22]);
							await stateStackElement.removeFromStack($stateStack.length - 1);
						}
					}

					children.reverse();
					addParent(augRules[rule].left, children);

					await codeCard?.highlightLines([23]); // Line 15: Get base state
					await codeCard?.highlightLines([24]); // Line 16: Get goto state
					let goto = $table.get(`s${stateStackElement.top()}`)?.get(augRules[rule].left)?.data;

					await codeCard?.highlightLines([25]); // Line 17: Validate goto
					if (!goto) {
						await codeCard?.highlightLines([26]);
						context.setAccept(false);
						break;
					}

					let gotoState = parseInt(goto?.slice(1));
					await codeCard?.highlightLines([27]);
					await stateStackElement.addToStack(augRules[rule].left, augRules[rule].left, '');
					await codeCard?.highlightLines([28]);
					await stateStackElement.addToStack(gotoState, `s${gotoState}`, '');
				}

				await addPause();
			}

			limitHit();
			await addPause();
		} catch (e) {}
	}
	onMount(async () => {
		fetch('./slrparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(SlrParsingInfo);
		loadGrammar();
		await parsing();
	});
</script>

<SvgLines bind:this={svgLines} svgId="slrparse"></SvgLines>
<div class="cards-box unit">
	<div class="unit">
		<PseudoCode bind:this={codeCard}></PseudoCode>
	</div>
	<GrammarCard isAugmented={true} bind:loadGrammar></GrammarCard>
	<TableCard
		rows={stateList}
		columns={alphabet}
		{table}
		bind:svgLines
		tableId="slr"
		label="tabela slr"
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
		label="pilha de estados"
	></StackCard>
</div>
