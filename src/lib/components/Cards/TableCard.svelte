<script>
	import { wait } from '$lib/flowControl';
	import CardWrapper from './CardWrapper.svelte';
	import { charWidth, fontSize, lineHeight } from '$lib/globalStyle';
	import AlgorithmTab from '@/Tabs/AlgorithmTab.svelte';

	export let label;
	export let hue;

	/**@type {Array<string>}*/
	export let columns;
	/**@type {Array<string>}*/
	export let rows;

	/**@type {import('svelte/store').Writable<Map<string, import('@/types').tableCol<any>>>} */
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
	/**@type {import('@/Structures/SvgLines.svelte').default | undefined}*/
	export let svgLines;

	/**
	 * @param {any} data
	 * @param {string} text
	 * @param {string} row
	 * @param {string} column
	 * @param {string | null} srcId
	 */
	export async function addToTable(data, text, row, column, srcId = null) {
		return new Promise(async (resolve, reject) => {
			try {
				table.update((x) => {
					/**@type {import('@/types').tableCol<any>}*/ (x.get(row)).set(column, {
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
					/**@type {import('@/types').tableCol<any>}*/ (x.get(row)).set(column, {
						data: data,
						text: text,
						opacity: 1,
						pos: 0,
						width: 1
					});
					return x;
				});
				if (srcId) {
					await svgLines?.hideLine();
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}
</script>

<CardWrapper
	minHeight={lineHeight}
	minWidth={charWidth}
	{hue}
	{label}
	cardId={'table'}
	style="padding: 5px;"
>
	<table style="font-size: {fontSize}rem;">
		<thead>
			<tr>
				<th style="background: hsl({hue}, 40%, 70%)"></th>
				{#each columns as column, index}
					<th style="background: hsl({hue}, 60%, 40%);"> {column} </th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $table as [rowKey, row]}
				<tr>
					<th style="background: hsl({hue}, 60%, 40%);"><span>{rowKey}</span></th>
					{#each row as [colKey, col]}
						<td>
							<span
								id="t-{tableId}-{rowKey}-{colKey}"
								style="width: {col.text.length * charWidth * col.width}rem;
									opacity: {col.opacity};top: {col.pos}px;"
							>
								{col.text}
							</span>
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</CardWrapper>

<style>
	table {
		border-spacing: 2px;
	}
	th {
		font-weight: normal;
	}

	th {
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
			opacity 0.5s 0.5s;
		white-space: nowrap;
	}
	th {
		border-color: transparent;
	}
</style>
