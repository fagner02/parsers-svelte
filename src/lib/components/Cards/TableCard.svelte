<script>
	import { wait } from '$lib/utils';
	import { writable } from 'svelte/store';
	import CardBox from './CardBox.svelte';
	import { onMount } from 'svelte';

	/**@type {number}*/
	export let lineHeight;
	/**@type {number}*/
	export let charWidth;
	/**@type {number}*/
	export let subCharWidth;

	export let label;
	export let color;

	/**@type {Array<string>}*/
	export let columns = ['$', 'a', 'b'];
	/**@type {Array<string>}*/
	export let rows = ['S', 'A', 'B'];

	/**@typedef {{data: string,opacity: number,width:number, pos: number }} tableItem
	 * @typedef {Map<string, tableItem>} tableCol
	 */
	/**@type {import('svelte/store').Writable<Map<string, tableCol>>} */
	export let table = writable(new Map());
	table.update((x) => {
		for (let i = 0; i < rows.length; i++) {
			x.set(
				rows[i],
				new Map(
					columns.map((x) => [
						x,
						{
							data: '',
							opacity: 0,
							pos: -40,
							width: charWidth
						}
					])
				)
			);
		}
		return x;
	});
	/** @type {string} */
	export let tableId;
	/**@type {import('@/SvgLines.svelte').default}*/
	export let svgLines;

	/**
	 * @param {string} text
	 * @param {string} note
	 */
	function textWidth(text, note) {
		return text.length * charWidth + note.length * subCharWidth;
	}

	/**
	 * @param {string} data
	 * @param {string | null} srcId
	 * @param {string} row
	 * @param {string} column
	 */
	export async function addToTable(data, row, column, srcId = null) {
		table.update((x) => {
			/**@type {tableCol}*/ (x.get(row)).set(column, {
				data: data,
				opacity: 0,
				pos: -40,
				width: charWidth
			});
			return x;
		});
		await wait(50);

		table.update((x) => {
			/**@type {tableCol}*/ (x.get(row)).set(column, {
				data: data,
				opacity: 1,
				pos: 0,
				width: data.length * charWidth
			});
			return x;
		});
		if (srcId) {
			await svgLines.hideLine();
		}
	}

	onMount(async () => {
		await wait(1000);

		addToTable('hi', 'S', '$');
		await wait(1000);
	});
</script>

<CardBox minHeight={lineHeight} minWidth={charWidth} {color} {label} style="padding: 5px;">
	<table>
		<thead>
			<tr>
				<th style="background: hsl(200, 40%, 70%)"></th>
				{#each columns as column, index}
					<th> {column} </th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $table as [rowKey, row]}
				<tr>
					<th><span>{rowKey}</span></th>
					{#each row as [colKey, col]}
						<td>
							<span
								id="t-{tableId}-{rowKey}-{colKey}"
								style="width: {col.width}px;opacity: {col.opacity};top: {col.pos}px;"
							>
								{col.data}
							</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</CardBox>

<style>
	@import '@/block.css';

	table {
		border-spacing: 2px;
	}
	th {
		font-weight: normal;
	}

	th {
		background: hsl(200, 60%, 40%);
		color: white;
	}

	th,
	td {
		border: 1px solid hsl(0, 0%, 80%);
		border-radius: 5px;
		padding: 0px 5px;
		overflow: hidden;
	}
	span {
		display: block;
		position: relative;
		transition:
			top 0.5s 0.5s,
			height 0.5s,
			width 0.5s,
			translate 0.5s,
			opacity 0.5s 0.5s;
	}
	th {
		border-color: transparent;
	}
</style>
