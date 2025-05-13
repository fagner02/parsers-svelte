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
	import PseudoCode from '@/Layout/PseudoCode.svelte';
	import { stackFloatingWindows } from '$lib/interactiveElem';

	/**@type {SvgLines | undefined}*/
	let svgLines = $state();

	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let inputStack = $state(writable([]));
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<string>[]>}*/
	let stateStack = $state(writable([]));
	/** @type {{id: string, table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<string>>>, stateList: any}} */
	let { id, table, stateList } = $props();

	let codeCard = /**@type {PseudoCode}*/ ($state());
	let stateStackElement = /** @type {StackCard}*/ ($state());
	let inputStackElement = /** @type {StackCard}*/ ($state());

	let { augRules, alphabet } = getAugGrammar();
	let context = getContext('parseView');

	let loadGrammar = /**@type {() => Promise<any>}*/ ($state());
	let { addFloatingNode: addFloatingNode, resetTree, addParent } = getTreeFunctions();

	function reset() {
		stateStack.update(() => []);
		inputStack.update(() => []);
		svgLines?.setHideOpacity();
		context.setAccept(null);
		resetTree();

		clrparsing();
	}
	setResetCall(reset, id);

	async function clrparsing() {
		try {
			await codeCard?.highlightLines([0]);
			await addPause(id);
			resetTree();

			await codeCard?.highlightLines([1]);
			await stateStackElement.addToStack(0, 's0', '');

			await codeCard?.highlightLines([2]);
			for (let i of ['$'].concat(inputString.reverse())) {
				await inputStackElement.addToStack(i, i, '');
			}

			await codeCard?.highlightLines([3]);
			while (true) {
				await codeCard?.highlightLines([4]);
				const topState = /**@type {number}*/ stateStackElement.top();

				await codeCard?.highlightLines([5]);
				const topInput = inputStackElement.top();

				await codeCard?.highlightLines([6]);
				const action = $table.get(`s${topState}`)?.get(topInput);

				await codeCard?.highlightLines([7]);
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
					let rule = parseInt(action.data.slice(1));
					let children = [];

					await codeCard?.highlightLines([17]);

					await codeCard?.highlightLines([18]);

					await codeCard?.highlightLines([19]);
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

					await codeCard?.highlightLines([23]);

					await codeCard?.highlightLines([24]);
					let goto = $table.get(`s${stateStackElement.top()}`)?.get(augRules[rule].left)?.data;

					await codeCard?.highlightLines([25]);
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

				await addPause(id);
			}

			limitHit(id);
			await addPause(id);
		} catch (e) {}
	}
	onMount(async () => {
		fetch('./clrparse.txt').then((data) =>
			data.text().then((text) => codeCard?.setPseudoCode(text))
		);
		loadGrammar();
		await clrparsing();
	});
</script>

<SvgLines bind:this={svgLines} svgId="{id}-svg" {id}></SvgLines>
<div class="grid unit">
	<div class="unit" use:stackFloatingWindows>
		<PseudoCode title="Análise sintática LR(1)" bind:this={codeCard} id="clrparse"></PseudoCode>
	</div>
	<div class="cards-box unit" id="card-box{id}">
		<GrammarCard {id} cardId={id} isAugmented={true} bind:loadGrammar></GrammarCard>
		<TableCard
			{id}
			rows={stateList}
			columns={alphabet}
			{table}
			bind:svgLines
			tableId="clr{id}"
			label="tabela lr1"
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
			stackId="symbols{id}"
			hue={colors.green}
			label="pilha de símbolos"
		></StackCard>
	</div>
</div>
