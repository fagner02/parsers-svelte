import { colors } from './selectSymbol';

export const id = 'lltable';
export const elemIds = {
	table: `${id}-table`,
	grammar: `${id}-grammar`,
	firstSet: `${id}-firstSet`,
	followSet: `${id}-followSet`,
	joinStack: `${id}-joinStack`
};
/**@type {any} */
export let functionCalls = [];
/**
 * @type {{
 * table: Map<string, Map<string, number>>,
 * firstSelect: string,
 * followSymbols: string[],
 * firstSymbols: string[],
 * functionCall: number,
 * conflict?: {col:string, row: string, tooltip: string}}[]}
 * */
export let saves = [];

/**@param {string[]} arr */
function deselectSymbols(arr) {
	for (let f of arr) {
		functionCalls.push({ skip: true, trace: Error().stack, name: 'deselectSymbol', args: [f, id] });
	}
}

/**
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {string[]} t
 * @param {Map<number, Set<string>>} firstSet
 * @param {Map<string, Set<string>>} followSet
 */
export function lltable(rules, nt, t, firstSet, followSet) {
	functionCalls = [];
	saves = [];
	/**@type {Map<string, Map<string, number>>} */
	let table = new Map();

	for (let item of nt) {
		table.set(item, new Map(t.map((x) => [x, -1])));
	}

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		table: structuredClone(table),
		firstSelect: '',
		followSymbols: [],
		firstSymbols: [],
		functionCall: functionCalls.length - 1
	});
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[0]] });
	for (let [left, right] of firstSet) {
		let firstSelected = [];
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });

		functionCalls.push({
			trace: Error().stack,
			name: 'selectFirst',
			args: [`${elemIds.firstSet}set${left}`]
		});

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
		if (right.has('')) {
			firstSelected.push(`${elemIds.firstSet}r${left}-0`);
			functionCalls.push({
				trace: Error().stack,
				name: 'selectSymbol',
				args: [firstSelected.at(-1), colors.green, id, false]
			});
			let followIndex = followSet.keys().toArray().indexOf(rules[left].left);
			let followIndex2 = 0;
			const followItems = followSet.get(rules[left].left) ?? new Set();

			let followSelected = [];
			for (const followItem of followItems) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });
				followSelected.push(`${elemIds.firstSet}r${followIndex}-${followIndex2}`);
				functionCalls.push({
					trace: Error().stack,
					name: 'selectSymbol',
					args: [followSelected.at(-1), colors.green, id, false]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5]] });

				let cell = table.get(rules[left].left)?.get(followItem);
				if (cell !== undefined && cell !== -1) {
					functionCalls.push({
						trace: Error().stack,
						name: 'showConflict',
						args: [rules[left].left, followItem]
					});
					let rule = `${rules[left].left} -> ${rules[left].right[0] === '' ? 'ε' : rules[left].right.join(' ')}`;
					let cellRule = `${rules[cell].left} -> ${rules[cell].right[0] === '' ? 'ε' : rules[cell].right.join(' ')}`;
					functionCalls.push({
						trace: Error().stack,
						name: 'setConflictTooltip',
						args: [`Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cellRule}]`]
					});
					functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
					saves.push({
						table: structuredClone(table),
						firstSelect: `${elemIds.firstSet}set${left}`,
						followSymbols: structuredClone(followSelected),
						firstSymbols: structuredClone(firstSelected),
						functionCall: functionCalls.length - 1,
						conflict: {
							row: rules[left].left,
							col: followItem,
							tooltip: `Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cellRule}]`
						}
					});

					return { table, id };
				}

				functionCalls.push({
					trace: Error().stack,
					name: 'highlightOn',
					args: [rules[left].left, followItem]
				});
				table.get(rules[left].left)?.set(followItem, left);
				functionCalls.push({
					trace: Error().stack,
					name: 'addToTable',
					args: [left, rules[left].left, followItem]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });

				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					table: structuredClone(table),
					firstSelect: `${elemIds.firstSet}set${left}`,
					followSymbols: structuredClone(followSelected),
					firstSymbols: structuredClone(firstSelected),
					functionCall: functionCalls.length - 1
				});
				followIndex2++;
			}
			deselectSymbols(followSelected);
		}

		let j = 0;
		for (const symbol of right) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[6]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[7]] });
			if (symbol === '') {
				j++;
				continue;
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[8]] });
			firstSelected.push(`${elemIds.firstSet}r${left}-${j}`);
			functionCalls.push({
				trace: Error().stack,
				name: 'selectSymbol',
				args: [firstSelected.at(-1), colors.green, id, false]
			});

			let cell = table.get(rules[left].left)?.get(symbol);
			if (cell !== undefined && cell !== -1) {
				functionCalls.push({
					trace: Error().stack,
					name: 'showConflict',
					args: [rules[left].left, symbol]
				});
				let rule = `${rules[left].left} -> ${rules[left].right[0] === '' ? 'ε' : rules[left].right.join(' ')}`;
				let cellRule = `${rules[cell].left} -> ${rules[cell].right[0] === '' ? 'ε' : rules[cell].right.join(' ')}`;
				functionCalls.push({
					trace: Error().stack,
					name: 'setConflictTooltip',
					args: [`Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cellRule}]`]
				});
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					table: structuredClone(table),
					firstSelect: `${elemIds.firstSet}set${left}`,
					followSymbols: [],
					firstSymbols: structuredClone(firstSelected),
					functionCall: functionCalls.length - 1,
					conflict: {
						row: rules[left].left,
						col: symbol,
						tooltip: `Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cellRule}]`
					}
				});
				return { table, id };
			}

			functionCalls.push({
				trace: Error().stack,
				name: 'highlightOn',
				args: [rules[left].left, symbol]
			});
			table.get(rules[left].left)?.set(symbol, left);
			functionCalls.push({
				trace: Error().stack,
				name: 'addToTable',
				args: [left, rules[left].left, symbol]
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
			j++;
			functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
			saves.push({
				table: structuredClone(table),
				firstSelect: `${elemIds.firstSet}set${left}`,
				followSymbols: [],
				firstSymbols: structuredClone(firstSelected),
				functionCall: functionCalls.length - 1
			});
		}
		deselectSymbols(firstSelected);
	}

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		table: structuredClone(table),
		firstSelect: '',
		followSymbols: [],
		firstSymbols: [],
		functionCall: functionCalls.length - 1
	});
	return { table, id };
}
