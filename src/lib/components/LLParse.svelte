<script>
	import { writable } from 'svelte/store';
	import TableCard from './Cards/TableCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import {
		addPause,
		getJumpPause,
		limitHit,
		newRunningCall,
		currentlyRunning,
		setResetCall
	} from '$lib/flowControl';
	import StackCard from './Cards/StackCard.svelte';
	import { getAllContexts, getContext, onMount, setContext } from 'svelte';
	import { getTreeFunctions } from '$lib/treeFunctions';

	/**@type {SvgLines | undefined}*/
	let svgLines;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	export let table;
	/**@type {string}*/
	export let input = 'aab m';
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let inputStack = writable([]);
	/**@type {import('svelte/store').Writable<import('@/types').StackItem<any>[]>}*/
	let symbolStack = writable([]);

	/** @type {StackCard}*/
	let symbolStackElement;
	/** @type {StackCard}*/
	let inputStackElement;
	/** @type {Array<import('@/types').GrammarItem>} */
	export let rules;
	let context = getContext('parseView');
	let startingSymbol = 'S';
	let nt = ['S', 'A', 'Bb'];
	let t = ['$', 'a', 'b', 'm'];

	let { initializeTree, addToTree, resetTree } = getTreeFunctions();

	function reset() {
		symbolStack.update(() => []);
		inputStack.update(() => []);
		svgLines?.setHideOpacity();
		context.setAccept(null);
		try {
			parsing();
		} catch {}
	}
	setResetCall(reset);

	async function parsing() {
		const id = newRunningCall();

		resetTree(id);

		if (initializeTree === undefined) {
			let functions = getTreeFunctions();
			initializeTree = functions.initializeTree;
			addToTree = functions.addToTree;
			resetTree = functions.resetTree;
		}

		try {
			for (let i of ['$', startingSymbol]) {
				if (currentlyRunning !== id) return;
				await symbolStackElement.addToStack(i, i, '', $symbolStack.length.toString());
			}

			await initializeTree(startingSymbol);

			for (let i of ['$'].concat(input.replaceAll(' ', '').split('').reverse())) {
				if (currentlyRunning !== id) return;
				await inputStackElement.addToStack(i, i, '', $inputStack.length.toString());
			}

			while ($inputStack.length > 0) {
				if (currentlyRunning !== id) return;
				const topSymbol = $symbolStack[$symbolStack.length - 1].data;
				const topInput = $inputStack[$inputStack.length - 1].data;
				if (nt.includes(topSymbol)) {
					const prodIndex = $table.get(topSymbol)?.get(topInput)?.data;
					if (prodIndex === undefined) {
						context.setAccept(false);
						return;
					}
					if (currentlyRunning !== id) return;
					await symbolStackElement.removeFromStack($symbolStack.length - 1);
					if (rules[prodIndex].right.includes('')) {
						addToTree(['\u03B5'], topSymbol);
						continue;
					}
					const prod = [...rules[prodIndex].right].reverse();

					addToTree([...rules[prodIndex].right], topSymbol);

					for (let p of prod) {
						if (currentlyRunning !== id) return;
						await symbolStackElement.addToStack(p, p, '', $symbolStack.length.toString());
					}
				} else {
					if (currentlyRunning !== id) return;
					if (topSymbol !== topInput) {
						context.setAccept(false);
						return;
					}
					if (currentlyRunning !== id) return;
					symbolStackElement.removeFromStack($symbolStack.length - 1);
					if (currentlyRunning !== id) return;
					await inputStackElement.removeFromStack($inputStack.length - 1);
					if (currentlyRunning !== id) return;
					if ($inputStack.length === 0) {
						context.setAccept(true);
					}
				}

				await addPause();
			}
			if (currentlyRunning !== id) return;
			limitHit();
			addPause();
		} catch (e) {}
	}

	onMount(async () => {
		try {
			await parsing();
		} catch {}
	});
</script>

<SvgLines bind:this={svgLines} svgId="llparse"></SvgLines>
<div class="cards-box unit">
	<TableCard
		rows={nt}
		columns={t}
		{table}
		bind:svgLines
		tableId="ll"
		label="tabela ll(1)"
		color="blue"
	></TableCard>
	<StackCard
		bind:svgLines
		bind:stack={inputStack}
		bind:this={inputStackElement}
		stackId="input"
		color="green"
		label="entrada"
	></StackCard>
	<StackCard
		bind:svgLines
		bind:stack={symbolStack}
		bind:this={symbolStackElement}
		stackId="symbols"
		color="green"
		label="pilha de símbolos"
	></StackCard>
</div>
