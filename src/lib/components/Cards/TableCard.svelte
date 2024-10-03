<script>
	import { wait } from '$lib/flowControl';
	import { writable } from 'svelte/store';
	import CardBox from './CardWrapper.svelte';
	import { charWidth, fontSize, lineHeight, subCharWidth } from '$lib/globalStyle';

	export let label;
	export let color;

	/**@type {Array<string>}*/
	export let columns;
	/**@type {Array<string>}*/
	export let rows;

	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol>>} */
	export let table;

	export function resetTable() {
		table.update((x) => {
			for (let i = 0; i < rows.length; i++) {
				x.set(
					rows[i],
					new Map(
						columns.map((x) => [
							x,
							{
								data: null,
								text: '',
								opacity: 0,
								pos: -40,
								width: 0
							}
						])
					)
				);
			}
			return x;
		});
	}
	/** @type {string} */
	export let tableId;
	/**@type {import('@/SvgLines.svelte').default}*/
	export let svgLines;

	/**
	 * @param {any} data
	 * @param {string} text
	 * @param {string} row
	 * @param {string} column
	 * @param {string | null} srcId
	 */
	export async function addToTable(data, text, row, column, srcId = null) {
		try {
			table.update((x) => {
				/**@type {import('@/types').tableCol}*/ (x.get(row)).set(column, {
					data: data,
					text: text,
					opacity: 0,
					pos: -40,
					width: 0
				});
				return x;
			});
			await wait(50);

			table.update((x) => {
				/**@type {import('@/types').tableCol}*/ (x.get(row)).set(column, {
					data: data,
					text: text,
					opacity: 1,
					pos: 0,
					width: 1
				});
				return x;
			});
			if (srcId) {
				await svgLines.hideLine();
			}
		} catch {}
	}
</script>

<CardBox minHeight={lineHeight} minWidth={charWidth} {color} {label} style="padding: 5px;">
	<table style="font-size: {fontSize}px;">
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
								style="width: {col.text.length *
									charWidth *
									col.width}px;opacity: {col.opacity};top: {col.pos}px;"
							>
								{col.text}
							</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</CardBox>

<style>
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
		text-align: center;
		text-align: -webkit-center;
		text-align: -moz-center;
		vertical-align: center;
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
