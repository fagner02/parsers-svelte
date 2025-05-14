<script>
	import { wait } from '$lib/flowControl';
	import CardWrapper from './CardWrapper.svelte';
	import { charWidth, fontSize, lineHeight } from '$lib/globalStyle';
	import AlertIcon from '@icons/AlertIcon.svelte';
	import { setUpTooltip } from '$lib/tooltip';

	/** @type {{
	 * id: string,
	 * label: any,
	 * hue: any,
	 * columns: Array<string>,
	 * rows: Array<string>,
	 * table: import('svelte/store').Writable<Map<string, import('@/types').tableCol<any>>>,
	 * tableId: string,
	 * svgLines: import('@/Structures/SvgLines.svelte').default | undefined}} */
	let {
		id,
		label,
		hue,
		columns,
		rows,
		table = $bindable(),
		tableId,
		svgLines = $bindable()
	} = $props();

	let highlighted = $state(false);
	let highlightRow = $state('');
	let highlightColumn = $state('');
	let highlightHue = $state(hue);
	let conflictHue = $state(345);
	let conflict = $state(false);

	export function resetTable() {
		highlightColumn = '';
		highlightRow = '';
		highlighted = false;
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
				await wait(id, 50);

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
					await svgLines?.hideLine(true, id);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} row
	 * @param {string} column
	 */
	export async function highlightOn(row, column) {
		return new Promise(async (resolve, reject) => {
			try {
				let colIndex = $table.get(row)?.keys().toArray().indexOf(column);
				let element = document.querySelector(`#td-${tableId}-${row}-${colIndex}`);
				if (element === null) return;

				highlightRow = row;
				highlightColumn = column;
				highlighted = false;
				await wait(id, 100);
				highlighted = true;

				await wait(id, 200);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	export async function highlightOff() {
		return new Promise(async (resolve, reject) => {
			try {
				await wait(id, 1000);
				highlighted = false;
				await wait(id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} row
	 * @param {string} column
	 */
	export async function showConflict(row, column) {
		return new Promise(async (resolve, reject) => {
			try {
				conflict = true;
				await highlightOn(row, column);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} value
	 */
	export function setConflictTooltip(value) {
		console.log(conflictElem, value);
		if (!conflictElem) return;
		setUpTooltip(conflictElem, {
			text: value,
			willRemove: true,
			hue: conflictHue
		});
	}

	/** @type {HTMLElement?} */
	let conflictElem = $state(null);
</script>

<CardWrapper
	minHeight={lineHeight}
	minWidth={charWidth}
	{hue}
	{label}
	cardId={'table'}
	style="padding: 5px;"
	{id}
>
	<table style="font-size: {fontSize}rem;">
		<thead>
			<tr>
				<th style="background: hsl({hue}, 40%, 70%)"></th>
				{#each columns as column}
					<th style="background: hsl({column == highlightColumn ? highlightHue : hue}, 60%, 40%);">
						{column}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $table as [rowKey, row]}
				<tr>
					<th
						style="background: hsl({rowKey == highlightRow
							? conflict
								? conflictHue
								: highlightHue
							: hue}, 60%, 40%);"><span>{rowKey}</span></th
					>
					{#each row as [colKey, col], colIndex}
						<td
							id="td-{tableId}-{rowKey}-{colIndex}"
							style={highlighted && (rowKey == highlightRow || colKey == highlightColumn)
								? rowKey == highlightRow && colKey == highlightColumn
									? `background: hsl(${conflict ? conflictHue : highlightHue}, 50%,50%); color: white;`
									: `background: hsl(${conflict ? conflictHue : highlightHue}, 50%, 70%); color: white;`
								: 'background: white'}
						>
							<div class="grid">
								<span
									class="unit"
									id="t-{tableId}-{rowKey}-{colIndex}"
									style="width: {col.text.length * charWidth * col.width}rem;
										opacity: {col.opacity};top: {col.pos}px;"
								>
									{col.text}
								</span>
								{#if conflict && highlightRow === rowKey && highlightColumn === colKey}
									<div
										bind:this={conflictElem}
										class="grid unit"
										style="transition: all 0.5s;height: 100%; color: white;border-radius: 5px;transform: {highlighted
											? `translate(0px, 0%)`
											: `translate(0, -105%)`};"
									></div>
								{/if}
							</div>
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
		color: white;
		padding: 0 5px;
		border-color: transparent;
	}

	td {
		padding: 0;
	}

	th,
	td {
		transition: all 0.5s;
		border: 1px solid hsl(0, 0%, 80%);
		border-radius: 5px;
		overflow: hidden;
		text-align: center;
		text-align: -webkit-center;
		text-align: -moz-center;
	}
	th,
	td > div {
		align-items: center;
		justify-content: center;
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
	div.grid,
	th,
	span {
		margin: 0px 5px;
	}
</style>
