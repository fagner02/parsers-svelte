<script>
	import { writable } from 'svelte/store';
	import TableCard from './Cards/TableCard.svelte';
	import SvgLines from './SvgLines.svelte';
	import { addPause, limitHit } from '$lib/flowControl';

	/**@type {SvgLines}*/
	let svgLines;
	/**@type {TableCard}*/
	let tableElement;
	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	let table;
	/**@type {() => Promise<void>}*/
	let loadGrammar;
	/**@type {string}*/
	export let instruction;

	/** @type {import('svelte/store').Writable<Array<import('@/types').GrammarItem>>} */
	let rules = writable([]);

	let nt = ['S', 'A', 'Bb'];
	let t = ['$', 'a', 'b', 'm'];
</script>

<SvgLines svgId="llparse"></SvgLines>
<TableCard
	rows={nt}
	columns={t}
	bind:table
	bind:svgLines
	bind:this={tableElement}
	tableId="ll"
	label="tabela ll(1)"
	color="blue"
></TableCard>
