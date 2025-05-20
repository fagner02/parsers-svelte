import { colors } from './selectSymbol';

export const id = 'first';
export const elemIds = {
	first: `${id}-first`,
	join: `${id}-join`,
	grammar: `${id}-grammar`,
	joinStack: `${id}-joinStack`
};

/**@type {any} */
export let functionCalls = [];
/**
 * @type {{
 * join: Map<number, Set<number>>,
 * joinStack: number[],
 * first: Map<number, Set<string>>,
 * grammarSelect: string,
 * functionCall: number}[]}
 * */
export let saves = [];

export function calcNullable(/**@type {import('@/types').GrammarItem[]} */ rules) {
	/** @type {Map<string, boolean>}*/
	let nullable = new Map();

	for (let i = 0; i < rules.length; i++) {
		if (rules[i].right[0] === '') {
			nullable.set(rules[i].left, true);
		} else {
			nullable.set(rules[i].left, nullable.get(rules[i].left) ?? false);
		}
	}

	let changed = true;
	while (changed) {
		changed = false;
		for (let j = 0; j < rules.length; j++) {
			if (nullable.get(rules[j].left)) continue;
			let isnull = true;
			for (let k = 0; k < rules[j].right.length; k++) {
				if (!nullable.get(rules[j].right[k])) {
					isnull = false;
					break;
				}
			}
			if (isnull) {
				changed = true;
				nullable.set(rules[j].left, true);
			}
		}
	}

	return nullable;
}

/**
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 */
export function first(rules, nt) {
	/** @type {Map<number, Set<string>>} */
	let firstSet = new Map();
	/** @type {Map<number, Set<number>>}*/
	let joinSet = new Map();
	/** @type {Map<string, boolean>}*/
	let nullable = calcNullable(rules);
	functionCalls = [];
	saves = [];

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		join: structuredClone(joinSet),
		first: structuredClone(firstSet),
		joinStack: [],
		grammarSelect: '',
		functionCall: functionCalls.length - 1
	});
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[0]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });

	for (let i = 0; i < rules.length; i++) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
		functionCalls.push({
			trace: Error().stack,
			name: 'selectGrammar',
			args: [`${elemIds.grammar}gset${i}`]
		});
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });
		functionCalls.push({
			trace: Error().stack,
			name: 'selectLSymbol',
			args: [`${elemIds.grammar}g`, i, colors.blue, id]
		});
		firstSet.set(i, new Set());
		functionCalls.push({
			trace: Error().stack,
			name: 'addSetRow',
			args: [i, `${elemIds.grammar}gl${i}`]
		});
		functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
		saves.push({
			join: structuredClone(joinSet),
			first: structuredClone(firstSet),
			joinStack: [],
			grammarSelect: `${elemIds.grammar}gset${i}`,
			functionCall: functionCalls.length - 1
		});
		let isNull = true;
		for (let j = 0; j < rules[i].right.length; j++) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5]] });
			let symbol = rules[i].right[j];

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[6]] });
			if (nt.includes(symbol)) {
				if (!joinSet.has(i)) {
					joinSet.set(i, new Set());
					functionCalls.push({
						trace: Error().stack,
						name: 'addSetRowJoin',
						args: [i, `${elemIds.grammar}gl${i}`]
					});
				}
				functionCalls.push({
					trace: Error().stack,
					name: 'selectRSymbol',
					args: [`${elemIds.grammar}g`, i, j, colors.blue, id, false]
				});

				const matchingRules = rules.filter((x) => x.left === symbol);
				for (let rule of matchingRules) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[7]] });
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[8]] });
					if (rule.index !== i) {
						joinSet.get(i)?.add(rule.index);
						functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[9]] });
						functionCalls.push({
							trace: Error().stack,
							name: 'joinSetsJoin',
							args: [[rule.index], i, `${elemIds.grammar}gr${i}-${j}`]
						});
					}
				}
			} else {
				firstSet.get(i)?.add(symbol);
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[10]] });
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					join: structuredClone(joinSet),
					first: structuredClone(firstSet),
					joinStack: [],
					grammarSelect: `${elemIds.grammar}gset${i}`,
					functionCall: functionCalls.length - 1
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'selectRSymbol',
					args: [`${elemIds.grammar}g`, i, j, colors.green, id, false]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'joinSets',
					args: [[symbol], i, `${elemIds.grammar}gr${i}-${j}`]
				});
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[12]] });
			if (!(nullable.get(symbol) ?? false)) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[13]] });
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[14]] });
				isNull = false;
				break;
			}
		}

		if (isNull) {
			firstSet.get(i)?.add('');
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[16]] });
			if (rules[i].right[0] === '') {
				functionCalls.push({
					trace: Error().stack,
					name: 'selectRSymbol',
					args: [`${elemIds.grammar}g`, i, 0, colors.green, id, false]
				});
			}
			functionCalls.push({
				trace: Error().stack,
				name: 'joinSets',
				args: [[''], i, `${elemIds.grammar}gr${i}-${rules[i].right.length - 1}`]
			});
		}
	}

	let addedToStack = joinSet
		.keys()
		.toArray()
		.map((x) => {
			return false;
		});
	for (let item of joinSet.keys()) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[17]] });
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[18]] });
		if (joinSet.get(item)?.size === 0) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[19]] });
			continue;
		}
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[20]] });
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[21]] });

		functionCalls.push({
			trace: Error().stack,
			name: 'addToStack',
			args: [item, rules[item].left, item.toString(), `${elemIds.join}l${item}`]
		});
		/** @type {Array<number>} */
		let joinStack = [item];
		functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
		saves.push({
			join: structuredClone(joinSet),
			first: structuredClone(firstSet),
			joinStack: structuredClone(joinStack),
			grammarSelect: '',
			functionCall: functionCalls.length - 1
		});

		addedToStack[item] = true;
		while (joinStack.length > 0) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[22]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[23]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[24]] });

			const topKey = joinStack[joinStack.length - 1];
			const top = /**@type {Set<number>}*/ (joinSet.get(topKey));
			const topValue = /**@type {number}*/ (top?.values().next().value);

			let nextSet = joinSet.get(topValue);
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[25]] });

			if (nextSet !== undefined && !(nextSet.size === 0) && !addedToStack[topValue]) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[26]] });
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[27]] });

				joinStack.push(topValue);
				functionCalls.push({
					trace: Error().stack,
					name: 'addToStack',
					args: [topValue, rules[topValue].left, topValue.toString()]
				});
				addedToStack[topValue] = true;
				continue;
			}
			const _firstSet = firstSet.get(topKey);
			const setToJoin = /**@type {Set<String>}*/ (firstSet.get(topValue));
			for (let item of setToJoin) {
				if (item != '') {
					_firstSet?.add(item);
				}
			}
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[28]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[29]] });

			functionCalls.push({
				trace: Error().stack,
				name: 'joinSets',
				args: [[...setToJoin], topKey, `${elemIds.first}l${topValue}`]
			});
			functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
			saves.push({
				join: structuredClone(joinSet),
				first: structuredClone(firstSet),
				joinStack: structuredClone(joinStack),
				grammarSelect: '',
				functionCall: functionCalls.length - 1
			});
			top.delete(topValue);
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[30]] });

			functionCalls.push({
				trace: Error().stack,
				name: 'removeSet',
				args: [topKey, topValue]
			});
			functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
			saves.push({
				join: structuredClone(joinSet),
				first: structuredClone(firstSet),
				joinStack: structuredClone(joinStack),
				grammarSelect: '',
				functionCall: functionCalls.length - 1
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[31]] });
			if (top.size === 0) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[32]] });

				joinStack.pop();
				functionCalls.push({
					trace: Error().stack,
					name: 'removeFromStack',
					args: [joinStack.length]
				});
			}
		}
	}

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		join: structuredClone(joinSet),
		first: structuredClone(firstSet),
		joinStack: [],
		grammarSelect: '',
		functionCall: functionCalls.length - 1
	});
	return { firstSet, id };
}

/**
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 */
export function firstDataOnly(rules, nt) {
	/** @type {Map<number, Set<string>>} */
	let firstSet = new Map();
	/** @type {Map<number, Set<number>>}*/
	let joinSet = new Map();
	/** @type {Map<number, number>}*/
	let joinIndexes = new Map();
	/** @type {Map<string, boolean>}*/
	let nullable = calcNullable(rules);

	for (let i = 0; i < rules.length; i++) {
		firstSet.set(i, new Set());

		let isNull = true;
		for (let j = 0; j < rules[i].right.length; j++) {
			let symbol = rules[i].right[j];

			if (nt.includes(symbol)) {
				if (!joinSet.has(i)) {
					joinSet.set(i, new Set());
					joinIndexes.set(i, joinSet.size - 1);
				}

				const matchingRules = rules.filter((x) => x.left === symbol);
				for (let rule of matchingRules) {
					if (rule.index !== i) {
						joinSet.get(i)?.add(rule.index);
					}
				}
			} else {
				firstSet.get(i)?.add(symbol);
			}

			if (!(nullable.get(symbol) ?? false)) {
				isNull = false;
				break;
			}
		}

		if (isNull) {
			firstSet.get(i)?.add('');
		}
	}

	let addedToStack = joinSet
		.keys()
		.toArray()
		.map((x) => {
			return false;
		});
	for (let item of joinSet.keys()) {
		if (joinSet.get(item)?.size === 0) {
			continue;
		}

		/** @type {Array<number>} */
		let joinStack = [item];
		addedToStack[item] = true;
		while (joinStack.length > 0) {
			const topKey = joinStack[joinStack.length - 1];
			const top = /**@type {Set<number>}*/ (joinSet.get(topKey));
			const topValue = /**@type {number}*/ (top?.values().next().value);

			let nextSet = joinSet.get(topValue);

			if (nextSet !== undefined && !(nextSet.size === 0) && !addedToStack[topValue]) {
				joinStack.push(topValue);

				addedToStack[topValue] = true;
				continue;
			}
			const _firstSet = firstSet.get(topKey);
			const setToJoin = /**@type {Set<String>}*/ (firstSet.get(topValue));
			for (let item of setToJoin) {
				if (item != '') {
					_firstSet?.add(item);
				}
			}

			top.delete(topValue);
			if (top.size === 0) {
				joinStack.pop();
			}
		}
	}
	return firstSet;
}

/**
 * @param {Map<number, Set<string>>} first
 * @param {Array<import('@/types').GrammarItem>} rules
 */
export function mergedFirst(first, rules) {
	/**@type {Map<string, Set<string>>}*/
	let mergedFirst = new Map();

	for (let [k, v] of first) {
		if (!mergedFirst.has(rules[k].left)) {
			mergedFirst.set(rules[k].left, new Set());
		}
		mergedFirst.set(
			rules[k].left,
			new Set([
				.../**@type {Set<string>}*/ (mergedFirst.get(rules[k].left)).values(),
				...v.values()
			])
		);
	}
	return mergedFirst;
}
