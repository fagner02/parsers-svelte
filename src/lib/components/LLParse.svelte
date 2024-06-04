<script>
	import { writable } from 'svelte/store';
	import TableCard from './Cards/TableCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { addPause, getJumpPause, limitHit, setResetCall } from '$lib/flowControl';
	import StackCard from './Cards/StackCard.svelte';
	import { getContext, onMount, setContext } from 'svelte';

	/**@type {SvgLines}*/
	let svgLines;
	/**@type {TableCard}*/
	let tableElement;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	export let table;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
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
	let count = 0;
	/**
	 * @type {((reason?: any) => void)[]}
	 */
	let rejects = [];
	/**
	 * @type {number[]}
	 */
	let running = [];

	export function reset() {
		symbolStack.update(() => []);
		inputStack.update(() => []);
		svgLines.setHideOpacity();
		context.setAccept(null);
		try {
			parsing();
		} catch {}
	}
	setResetCall(reset);

	async function parsing() {
		if (count > 100) count = 0;
		const id = count;
		count++;
		running.splice(0, running.length);
		running.push(id);

		try {
			console.log('start');
			for (let i of ['$', startingSymbol]) {
				if (running[running.length - 1] !== id) return;
				await symbolStackElement.addToStack(i, i, '', $symbolStack.length.toString());
			}
			for (let i of ['$'].concat(input.replaceAll(' ', '').split('').reverse())) {
				if (running[running.length - 1] !== id) return;
				await inputStackElement.addToStack(i, i, '', $inputStack.length.toString());
			}

			while ($inputStack.length > 0) {
				if (running[running.length - 1] !== id) return;
				const topSymbol = $symbolStack[$symbolStack.length - 1].data;
				const topInput = $inputStack[$inputStack.length - 1].data;
				if (nt.includes(topSymbol)) {
					const prodIndex = $table.get(topSymbol)?.get(topInput)?.data;
					if (prodIndex === undefined) {
						context.setAccept(false);
						return;
					}
					if (running[running.length - 1] !== id) return;
					await symbolStackElement.removeFromStack($symbolStack.length - 1);
					const prod = [...rules[prodIndex].right].reverse();
					for (let p of prod) {
						if (running[running.length - 1] !== id) return;
						await symbolStackElement.addToStack(p, p, '', $symbolStack.length.toString());
					}
				} else {
					if (running[running.length - 1] !== id) return;
					if (topSymbol !== topInput) {
						context.setAccept(false);
						return;
					}
					if (running[running.length - 1] !== id) return;
					symbolStackElement.removeFromStack($symbolStack.length - 1);
					if (running[running.length - 1] !== id) return;
					await inputStackElement.removeFromStack($inputStack.length - 1);
					if (running[running.length - 1] !== id) return;
					if ($inputStack.length === 0) {
						console.log('não');
						context.setAccept(true);
					}
				}

				await addPause();
			}
			if (running[running.length - 1] !== id) return;
			running.splice(
				0,
				running.findIndex((x) => x === id)
			);
			console.log('fim');
			limitHit();
			addPause();
			if (running[running.length - 1] !== id) return;
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
		bind:this={tableElement}
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
