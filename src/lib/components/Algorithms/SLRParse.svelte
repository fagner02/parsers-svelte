<script>
	import { writable } from 'svelte/store';
	import TableCard from '@/Cards/TableCard.svelte';
	import SvgLines from '@/Structures/SvgLines.svelte';
	import {
		addPause,
		limitHit,
		setMaxStep,
		setOnInputChanged,
		setResetCall,
		wait
	} from '$lib/flowControl';
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
	import { stackFloatingWindows } from '$lib/interactiveElem';
	import { id, elemIds, saves, functionCalls, slrparsing } from '$lib/slrparse';
	import { stackCard } from '@/Tabs/dataToComp';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let inputStack = $state(writable([]));
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let stateStack = $state(writable([]));
	/** @type {{
	 * table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>,
	 * stateList: any,
	 * tableData: Map<number, Map<string, string>>}} */
	let { table, tableData, stateList } = $props();

	let codeCard = /**@type {PseudoCode}*/ ($state());

	let stateStackElement = /** @type {StackCard}*/ ($state());

	let inputStackElement = /** @type {StackCard}*/ ($state());

	let { augRules, alphabet } = getAugGrammar();
	let context = getContext('parseView');
	let currentStep = 0;
	let stepChanged = false;
	let inputChanged = false;
	let loadGrammar = /** @type {() => Promise<any>} */ ($state());

	let { addFloatingNode, resetTree, addParent, loadFloatingTree } = getTreeFunctions();

	/**@param {number} step*/
	function setStep(step) {
		stateStackElement.loadStack(stackCard(saves[step].stateStack, {}));
		inputStackElement.loadStack(stackCard(saves[step].inputStack, {}));
		svgLines?.setHideOpacity();
		saves[step].accept === undefined
			? context.setAccept(null)
			: context.setAccept(saves[step].accept);
		resetTree();
		loadFloatingTree(saves[step].tree);
		currentStep = step;
		stepChanged = true;
	}
	setResetCall(setStep, saves.length - 1, id, () => currentStep);

	function onInputChanged() {
		slrparsing(inputString, augRules, tableData);
		setMaxStep(saves.length - 1, id);
		inputChanged = true;
	}
	setOnInputChanged(onInputChanged, id);

	/**@type {any}*/
	const obj = {
		addPause: () => addPause,
		addFloatingNode: () => addFloatingNode,
		addParent: () => addParent,
		addToStackState: () => stateStackElement.addToStack,
		addToStackInput: () => inputStackElement.addToStack,
		removeFromStackState: () => stateStackElement.removeFromStack,
		removeFromStackInput: () => inputStackElement.removeFromStack,
		setAccept: () => context.setAccept,
		highlightLines: () => codeCard?.highlightLines
	};

	async function parsing() {
		try {
			let i = 0;
			while (i < functionCalls.length || stepChanged) {
				if (inputChanged) {
					currentStep = 0;
					stepChanged = false;
					inputChanged = false;
					i = 0;
					continue;
				}
				if (stepChanged) {
					stepChanged = false;
					i = saves[currentStep].functionCall;
					continue;
				}
				const call = functionCalls[i];
				try {
					if (call.skip !== undefined) obj[call.name]()(...call.args);
					else await obj[call.name]()(...call.args);
				} catch (e) {
					continue;
				}
				if (call.name === 'addPause') {
					currentStep++;
				}
				i++;
			}
			// await addPause(id);
			// resetTree();
			// if (initializeTree === undefined) {
			// 	let functions = getTreeFunctions();
			// 	initializeTree = functions.initializeTree;
			// 	addFloatingNode = functions.addFloatingNode;
			// 	resetTree = functions.resetTree;
			// }
			// await codeCard?.highlightLines([1]);
			// await stateStackElement.addToStack(0, 's0', '');
			// for (let i of ['$'].concat(inputString.reverse())) {
			// 	await codeCard?.highlightLines([2]);
			// 	await inputStackElement.addToStack(i, i, '');
			// }
			// while (true) {
			// 	await codeCard?.highlightLines([3]);
			// 	await codeCard?.highlightLines([4]);
			// 	const topState = /**@type {number}*/ stateStackElement.top();
			// 	await codeCard?.highlightLines([5]);
			// 	const topInput = inputStackElement.top();
			// 	await codeCard?.highlightLines([6]);
			// 	const action = $table.get(`s${topState}`)?.get(topInput);
			// 	await codeCard?.highlightLines([7]);
			// 	if (!action || action?.data === '') {
			// 		await codeCard?.highlightLines([8]);
			// 		context.setAccept(false);
			// 		break;
			// 	}
			// 	await codeCard?.highlightLines([9]);
			// 	if (action.data.startsWith('a')) {
			// 		await codeCard?.highlightLines([10]);
			// 		context.setAccept(true);
			// 		break;
			// 	}
			// 	await codeCard?.highlightLines([11]);
			// 	if (action.data.startsWith('s')) {
			// 		await codeCard?.highlightLines([12]);
			// 		let state = parseInt(action.data.slice(1));
			// 		addFloatingNode([topInput]);
			// 		await codeCard?.highlightLines([13]);
			// 		await stateStackElement.addToStack(topInput, topInput, '');
			// 		await codeCard?.highlightLines([14]);
			// 		await stateStackElement.addToStack(state, `s${state}`, '');
			// 		await codeCard?.highlightLines([15]);
			// 		await inputStackElement.removeFromStack($inputStack.length - 1);
			// 	}
			// 	await codeCard?.highlightLines([16]);
			// 	if (action.data.startsWith('r')) {
			// 		await codeCard?.highlightLines([17]);
			// 		await codeCard?.highlightLines([18]);
			// 		let rule = parseInt(action.data.slice(1));
			// 		let children = [];
			// 		await codeCard?.highlightLines([19]);
			// 		if (augRules[rule].right[0] !== '') {
			// 			for (let i = 0; i < augRules[rule].right.length; i++) {
			// 				await codeCard?.highlightLines([20]);
			// 				children.push($stateStack[$stateStack.length - 2].data);
			// 				await codeCard?.highlightLines([21]);
			// 				await stateStackElement.removeFromStack($stateStack.length - 1);
			// 				await codeCard?.highlightLines([22]);
			// 				await stateStackElement.removeFromStack($stateStack.length - 1);
			// 			}
			// 		}
			// 		children.reverse();
			// 		addParent(augRules[rule].left, children);
			// 		await codeCard?.highlightLines([23]);
			// 		await codeCard?.highlightLines([24]);
			// 		let goto = $table.get(`s${stateStackElement.top()}`)?.get(augRules[rule].left)?.data;
			// 		await codeCard?.highlightLines([25]);
			// 		if (!goto) {
			// 			await codeCard?.highlightLines([26]);
			// 			context.setAccept(false);
			// 			break;
			// 		}
			// 		let gotoState = parseInt(goto?.slice(1));
			// 		await codeCard?.highlightLines([27]);
			// 		await stateStackElement.addToStack(augRules[rule].left, augRules[rule].left, '');
			// 		await codeCard?.highlightLines([28]);
			// 		await stateStackElement.addToStack(gotoState, `s${gotoState}`, '');
			// 	}
			// 	await addPause(id);
			// }
			// limitHit(id);
			// await addPause(id);
		} catch (e) {}
	}
	onMount(async () => {
		fetch('./slrparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		setInfoComponent(SlrParsingInfo);
		loadGrammar();
		onInputChanged();
		parsing();
	});
</script>

<SvgLines bind:this={svgLines} svgId="{id}-svg" {id}></SvgLines>
<div class="cards-box unit" id="card-box{id}">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Análise sintática SLR" bind:this={codeCard} id="slrparse"></PseudoCode>
	</div>
	<GrammarCard {id} cardId={id} isAugmented={true} bind:loadGrammar></GrammarCard>
	<TableCard
		{id}
		rows={stateList}
		columns={alphabet}
		{table}
		bind:svgLines
		tableId="slr{id}"
		label="tabela slr"
		hue={colors.blue}
	></TableCard>
	<StackCard
		{id}
		bind:svgLines
		bind:stack={inputStack}
		bind:this={inputStackElement}
		stackId="input{id}"
		hue={colors.green}
		label="entrada"
	></StackCard>
	<StackCard
		{id}
		bind:svgLines
		bind:stack={stateStack}
		bind:this={stateStackElement}
		stackId="states{id}"
		hue={colors.green}
		label="pilha de estados"
	></StackCard>
</div>
