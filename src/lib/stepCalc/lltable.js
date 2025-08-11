import { colors } from '../selectSymbol';

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
 * symbolIds: any[],
 * conflict?: {col:string, row: string, tooltip: string}}[]}
 * */
export let saves = [];

/**@param {string[]} arr */
function deselectSymbols(arr) {
	for (let f of arr) {
		functionCalls.push({ skip: true, name: 'deselectSymbol', args: [f, id] });
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
	/**@type {any[]} */
	let symbolIds = [];
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		table: structuredClone(table),
		firstSelect: '',
		followSymbols: [],
		firstSymbols: [],
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolIds)
	});
	functionCalls.push({ name: 'highlightLines', args: [[0]] });
	for (let [left, right] of firstSet) {
		let firstSelected = [];
		functionCalls.push({ name: 'highlightLines', args: [[1]] });

		functionCalls.push({
			name: 'selectFirst',
			args: [`${elemIds.firstSet}set${left}`]
		});

		functionCalls.push({ name: 'highlightLines', args: [[2]] });
		functionCalls.push({ name: 'highlightLines', args: [[3]] });
		if (right.has('')) {
			firstSelected.push(`${elemIds.firstSet}r${left}-0`);
			functionCalls.push({
				name: 'selectSymbol',
				args: [firstSelected.at(-1), colors.green, id, false]
			});
			symbolIds.push(functionCalls.at(-1).args);
			let followIndex = followSet.keys().toArray().indexOf(rules[left].left);
			let followIndex2 = 0;
			const followItems = followSet.get(rules[left].left) ?? new Set();

			let followSelected = [];
			for (const followItem of followItems) {
				functionCalls.push({ name: 'highlightLines', args: [[4]] });
				followSelected.push(`${elemIds.firstSet}r${followIndex}-${followIndex2}`);
				functionCalls.push({
					name: 'selectSymbol',
					args: [followSelected.at(-1), colors.green, id, false]
				});

				symbolIds.push(functionCalls.at(-1).args);
				functionCalls.push({ name: 'highlightLines', args: [[5]] });

				let cell = table.get(rules[left].left)?.get(followItem);
				if (cell !== undefined && cell !== -1) {
					functionCalls.push({
						name: 'showConflict',
						args: [rules[left].left, followItem]
					});
					let rule = `${rules[left].left} -> ${rules[left].right[0] === '' ? 'ε' : rules[left].right.join(' ')}`;
					let cellRule = `${rules[cell].left} -> ${rules[cell].right[0] === '' ? 'ε' : rules[cell].right.join(' ')}`;
					functionCalls.push({
						name: 'setConflictTooltip',
						args: [`Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cellRule}]`]
					});
					functionCalls.push({ name: 'addPause', args: [id] });
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
						},
						symbolIds: structuredClone(symbolIds)
					});

					return { table, id };
				}

				functionCalls.push({
					name: 'highlightOn',
					args: [rules[left].left, followItem]
				});
				table.get(rules[left].left)?.set(followItem, left);
				functionCalls.push({
					name: 'addToTable',
					args: [left, rules[left].left, followItem]
				});
				functionCalls.push({ name: 'highlightOff', args: [] });

				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					table: structuredClone(table),
					firstSelect: `${elemIds.firstSet}set${left}`,
					followSymbols: structuredClone(followSelected),
					firstSymbols: structuredClone(firstSelected),
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
				followIndex2++;
			}
			symbolIds = symbolIds.filter((x) => !followSelected.includes(x[0]));
			deselectSymbols(followSelected);
		}

		let j = 0;
		for (const symbol of right) {
			functionCalls.push({ name: 'highlightLines', args: [[6]] });
			functionCalls.push({ name: 'highlightLines', args: [[7]] });
			if (symbol === '') {
				j++;
				continue;
			}

			functionCalls.push({ name: 'highlightLines', args: [[8]] });
			firstSelected.push(`${elemIds.firstSet}r${left}-${j}`);
			functionCalls.push({
				name: 'selectSymbol',
				args: [firstSelected.at(-1), colors.green, id, false]
			});
			symbolIds.push(functionCalls.at(-1).args);

			let cell = table.get(rules[left].left)?.get(symbol);
			if (cell !== undefined && cell !== -1) {
				functionCalls.push({
					name: 'showConflict',
					args: [rules[left].left, symbol]
				});
				let rule = `${rules[left].left} -> ${rules[left].right[0] === '' ? 'ε' : rules[left].right.join(' ')}`;
				let cellRule = `${rules[cell].left} -> ${rules[cell].right[0] === '' ? 'ε' : rules[cell].right.join(' ')}`;
				functionCalls.push({
					name: 'setConflictTooltip',
					args: [`Conflito: Regra [${rule}] vai ocupar o lugar da regra existente [${cellRule}]`]
				});
				functionCalls.push({ name: 'addPause', args: [id] });
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
					},
					symbolIds: structuredClone(symbolIds)
				});
				return { table, id };
			}

			functionCalls.push({
				name: 'highlightOn',
				args: [rules[left].left, symbol]
			});
			table.get(rules[left].left)?.set(symbol, left);
			functionCalls.push({
				name: 'addToTable',
				args: [left, rules[left].left, symbol]
			});
			functionCalls.push({ name: 'highlightOff', args: [] });
			j++;
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				table: structuredClone(table),
				firstSelect: `${elemIds.firstSet}set${left}`,
				followSymbols: [],
				firstSymbols: structuredClone(firstSelected),
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
			});
		}

		symbolIds = symbolIds.filter((x) => !firstSelected.includes(x[0]));
		deselectSymbols(firstSelected);
	}

	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		table: structuredClone(table),
		firstSelect: '',
		followSymbols: [],
		firstSymbols: [],
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolIds)
	});
	return { table, id };
}
