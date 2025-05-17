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
/**@type {any} */
export let saves = [];

/**
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {string[]} t
 * @param {Map<number, Set<string>>} firstSet
 * @param {Map<string, Set<string>>} followSet
 */
export function lltable(rules, nt, t, firstSet, followSet) {
	/**@type {Map<string, Map<string, number>>} */
	let table = new Map();

	for (let item of nt) {
		table.set(item, new Map(t.map((x) => [x, -1])));
	}

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[0]] });

	for (let [left, right] of firstSet) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });

		functionCalls.push({
			trace: Error().stack,
			name: 'selectFirst',
			args: [`${elemIds.firstSet}set${left}`]
		});
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
		if (right.has('')) {
			functionCalls.push({
				trace: Error().stack,
				name: 'selectRSymbol',
				args: [elemIds.firstSet, left, 0, colors.green, id]
			});
			let followIndex = followSet.keys().toArray().indexOf(rules[left].left);
			let followIndex2 = 0;
			const followItems = followSet.get(rules[left].left) ?? new Set();

			for (const followItem of followItems) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });
				functionCalls.push({
					trace: Error().stack,
					name: 'selectRSymbol',
					args: [elemIds.followSet, followIndex, followIndex2 * 2, colors.green, id]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5]] });

				let cell = table.get(rules[left].left)?.get(followItem);
				console.log(cell);
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
					args: [
						left,
						`${rules[left].left} → ${rules[left].right.join(' ') || 'ε'}`,
						rules[left].left,
						followItem
					]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });

				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				followIndex2++;
			}
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
			functionCalls.push({
				trace: Error().stack,
				name: 'selectRSymbol',
				args: [elemIds.firstSet, left, j * 2, colors.green, id]
			});

			// Conflict check
			let cell = table.get(rules[left].left)?.get(symbol);
			console.log(cell);
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
				args: [
					left,
					`${rules[left].left} → ${rules[left].right.join(' ') || 'ε'}`,
					rules[left].left,
					symbol
				]
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
			j++;
			functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
		}
	}

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });

	return { table, id };
}
