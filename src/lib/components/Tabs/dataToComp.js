/**
 * @param {Map<string, Set<string>>} sets
 */
export function setsCard(sets) {
	return /**@type {import('@/types').SetRow[]}*/ (
		[...sets.entries()].map((x) => {
			return {
				left: x[0],
				right: [...x[1]]
			};
		})
	);
}

/**
 * @param {any[]} stack
 * @param {{key: (value:any)=>string}?} convert
 */
export function stackCard(stack, convert) {
	return /**@type {import('@/types').StackItem} */ stack.map((x, i) => ({
		data: x,
		text: convert?.key ? convert.key(x) : x,
		note: '',
		id: i
	}));
}

/**
 * @param {Map<any, Map<any, any>>} table
 * @param {{key?: (value:any)=>string}} convert
 */
export function tableCard(table, convert) {
	return /**@type {Map<string, import('@/types').tableCol<string>>}*/ (
		new Map(
			[...table].map(([rowKey, cols]) => [
				convert?.key ? convert.key(rowKey) : rowKey,
				new Map(
					[...cols].map(([colKey, cell]) => [
						colKey,
						/**@type {import('@/types').tableItem<string>}*/ ({
							data: cell,
							opacity: 1,
							pos: 0,
							text: cell,
							width: 1
						})
					])
				)
			])
		)
	);
}
