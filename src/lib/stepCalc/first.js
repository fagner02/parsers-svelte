import { nt, rules } from '$lib/utils';
import { colors } from '../selectSymbol';

export const id = 'first';
export const elemIds = {
	first: `${id}-first`,
	join: `${id}-join`,
	grammar: `${id}-grammar`,
	joinStack: `${id}-joinStack`
};

/** @type {import("@/types").Command<ReturnType<typeof import("@/Algorithms/FirstAlgorithm.svelte").default>['obj']>[]} */
export let functionCalls = [];

/**
 * @type {{
 * join: Map<number, Set<number>>,
 * joinStack: number[],
 * first: Map<number, Set<string>>,
 * grammarSelect: string,
 * symbolIds: any[],
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

export function first() {
	/** @type {Map<number, Set<string>>} */
	let firstSet = new Map();
	/** @type {Map<number, Set<number>>}*/
	let joinSet = new Map();
	/** @type {Map<string, boolean>}*/
	let nullable = calcNullable(rules);
	functionCalls = [];
	saves = [];
	/**@type {any[]} */
	let symbolIds = [];
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		join: structuredClone(joinSet),
		first: structuredClone(firstSet),
		joinStack: [],
		grammarSelect: '',
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolIds)
	});
	functionCalls.push({ name: 'highlightLines', args: [[0]] });
	functionCalls.push({ name: 'highlightLines', args: [[1]] });

	for (let i = 0; i < rules.length; i++) {
		functionCalls.push({ name: 'highlightLines', args: [[2]] });
		functionCalls.push({ name: 'selectGrammar', args: [`${elemIds.grammar}gset${i}`] });
		functionCalls.push({ name: 'highlightLines', args: [[3]] });
		functionCalls.push({
			name: 'selectSymbol',
			args: [`#${elemIds.grammar}gl${i}`, colors.blue, id]
		});
		symbolIds.push(functionCalls.at(-1)?.args);
		firstSet.set(i, new Set());
		functionCalls.push({
			name: 'addSetRow',
			args: [i, `${elemIds.grammar}gl${i}`]
		});
		functionCalls.push({ name: 'addPause', args: [id] });
		saves.push({
			join: structuredClone(joinSet),
			first: structuredClone(firstSet),
			joinStack: [],
			grammarSelect: `${elemIds.grammar}gset${i}`,
			functionCall: functionCalls.length - 1,
			symbolIds: structuredClone(symbolIds)
		});
		functionCalls.push({ name: 'highlightLines', args: [[4]] });
		let isNull = true;
		for (let j = 0; j < rules[i].right.length; j++) {
			functionCalls.push({ name: 'highlightLines', args: [[5]] });
			let symbol = rules[i].right[j];

			functionCalls.push({ name: 'highlightLines', args: [[6]] });
			if (nt.includes(symbol)) {
				functionCalls.push({ name: 'highlightLines', args: [[7]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`label-${elemIds.join}`,
						`'${symbol}' é um não-terminal, por isso devemos mesclar o seu first ao de '<small>${i}</small>${rules[i].left}', para isso adicionamos as produções de '${symbol}' ao conjunto join de '<small>${i}</small>${rules[i].left}'`,
						colors.blue,
						1
					]
				});
				if (!joinSet.has(i)) {
					joinSet.set(i, new Set());
					functionCalls.push({
						name: 'addSetRowJoin',
						args: [i, `${elemIds.grammar}gl${i}`]
					});
				}
				functionCalls.push({
					name: 'selectSymbol',
					args: [`${elemIds.grammar}gr${i}-${j}`, colors.blue, id, false]
				});

				symbolIds.push(functionCalls.at(-1)?.args);
				functionCalls.push({
					name: 'setUpTooltip',
					args: [
						`${elemIds.grammar}gr${i}-${j}`,
						{
							id: 2,
							text: `Esse não-terminal teve seu first mesclado ao de '<small>${i}</small>${rules[i].left}'`
						}
					]
				});
				const matchingRules = rules.filter((x) => x.left === symbol);
				for (let rule of matchingRules) {
					functionCalls.push({ name: 'highlightLines', args: [[8]] });
					if (rule.index !== i) {
						joinSet.get(i)?.add(rule.index);
						functionCalls.push({ name: 'highlightLines', args: [[9]] });
						functionCalls.push({
							name: 'joinSetsJoin',
							args: [[rule.index], i, `${elemIds.grammar}gl${rule.index}`]
						});
					}
				}
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					join: structuredClone(joinSet),
					first: structuredClone(firstSet),
					joinStack: [],
					grammarSelect: `${elemIds.grammar}gset${i}`,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
			} else {
				functionCalls.push({ name: 'highlightLines', args: [[10]] });
				functionCalls.push({ name: 'highlightLines', args: [[11]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`label-${elemIds.first}`,
						`'${symbol}' é um terminal, por isso adicionamos '${symbol}' ao first de '<small>${i}</small>${rules[i].left}'`,
						colors.blue,
						1
					]
				});

				firstSet.get(i)?.add(symbol);
				functionCalls.push({
					name: 'selectSymbol',
					args: [`${elemIds.grammar}gr${i}-${j}`, colors.green, id, false]
				});
				symbolIds.push(functionCalls.at(-1)?.args);
				functionCalls.push({
					name: 'setUpTooltip',
					args: [
						`${elemIds.grammar}gr${i}-${j}`,
						{
							id: 2,
							text: `Esse terminal foi adicionado ao first de '<small>${i}</small>${rules[i].left}'`,
							hue: colors.green
						}
					]
				});
				functionCalls.push({
					name: 'joinSets',
					args: [[symbol], i, `${elemIds.grammar}gr${i}-${j}`]
				});
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					join: structuredClone(joinSet),
					first: structuredClone(firstSet),
					joinStack: [],
					grammarSelect: `${elemIds.grammar}gset${i}`,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
			}

			functionCalls.push({ name: 'highlightLines', args: [[12]] });
			if (!(nullable.get(symbol) ?? false)) {
				functionCalls.push({ name: 'highlightLines', args: [[13]] });
				functionCalls.push({ name: 'highlightLines', args: [[14]] });
				isNull = false;
				break;
			}
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`label-${elemIds.grammar}`,
					`'${symbol}' produz uma string vazia por isso temos que adicionar o próximo símbolo ao first de '<small>${i}</small>${rules[i].left}'`,
					colors.blue,
					1
				]
			});
		}

		if (isNull) {
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`label-${elemIds.first}`,
					`'<small>${i}</small>${rules[i].left}' produz uma string vazia, por isso adicionamos 'ε' ao first de '<small>${i}</small>${rules[i].left}'`,
					colors.blue,
					1
				]
			});

			firstSet.get(i)?.add('');
			functionCalls.push({ name: 'highlightLines', args: [[16]] });
			if (rules[i].right[0] === '') {
				functionCalls.push({
					name: 'selectSymbol',
					args: [`${elemIds.grammar}gr${i}-0`, colors.green, id, false]
				});

				symbolIds.push(functionCalls.at(-1)?.args);
			}
			functionCalls.push({
				name: 'joinSets',
				args: [[''], i, `${elemIds.grammar}gr${i}-${rules[i].right.length - 1}`]
			});
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				join: structuredClone(joinSet),
				first: structuredClone(firstSet),
				joinStack: [],
				grammarSelect: `${elemIds.grammar}gset${i}`,
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
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
		functionCalls.push({ name: 'highlightLines', args: [[17]] });
		functionCalls.push({ name: 'highlightLines', args: [[18]] });
		if (joinSet.get(item)?.size === 0) {
			functionCalls.push({ name: 'highlightLines', args: [[19]] });
			continue;
		}
		functionCalls.push({ name: 'highlightLines', args: [[20]] });
		functionCalls.push({ name: 'highlightLines', args: [[21]] });

		functionCalls.push({
			name: 'addToStack',
			args: [item, rules[item].left, item.toString(), `${elemIds.join}l${item}`]
		});
		/** @type {Array<number>} */
		let joinStack = [item];
		functionCalls.push({ name: 'addPause', args: [id] });
		saves.push({
			join: structuredClone(joinSet),
			first: structuredClone(firstSet),
			joinStack: structuredClone(joinStack),
			grammarSelect: '',
			functionCall: functionCalls.length - 1,
			symbolIds: structuredClone(symbolIds)
		});

		addedToStack[item] = true;
		while (joinStack.length > 0) {
			functionCalls.push({ name: 'highlightLines', args: [[22]] });
			functionCalls.push({ name: 'highlightLines', args: [[23]] });
			functionCalls.push({ name: 'highlightLines', args: [[24]] });

			const topKey = joinStack[joinStack.length - 1];
			const top = /**@type {Set<number>}*/ (joinSet.get(topKey));
			const topValue = /**@type {number}*/ (top?.values().next().value);

			let nextSet = joinSet.get(topValue);
			functionCalls.push({ name: 'highlightLines', args: [[25]] });

			if (nextSet !== undefined && !(nextSet.size === 0) && !addedToStack[topValue]) {
				functionCalls.push({ name: 'highlightLines', args: [[26]] });
				functionCalls.push({ name: 'highlightLines', args: [[27]] });

				functionCalls.push({
					name: 'selectSymbol',
					args: [`${elemIds.join}r${topKey}-${0}`, colors.orange, id]
				});
				symbolIds.push(functionCalls.at(-1)?.args);
				functionCalls.push({
					name: 'setUpTooltip',
					args: [
						`${elemIds.join}r${topKey}-${0}`,
						{
							id: 2,
							text: `Esse não-terminal ainda vai ser processado`,
							hue: colors.orange
						}
					]
				});
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`label-${elemIds.joinStack}`,
						`O conjunto join de '<small>${topValue}</small>${rules[topValue].left}' ainda não está vazio, é preciso processá-lo antes de mesclar seu first ao de '<small>${topKey}</small>${rules[topKey].left}', por isso adicionamos '<small>${topValue}</small>${rules[topValue].left}' à join stack`,
						colors.blue,
						1
					]
				});
				joinStack.push(topValue);
				functionCalls.push({
					name: 'addToStack',
					args: [
						topValue,
						rules[topValue].left,
						topValue.toString(),
						`${elemIds.join}r${topKey}-${0}`
					]
				});
				addedToStack[topValue] = true;
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					join: structuredClone(joinSet),
					first: structuredClone(firstSet),
					joinStack: structuredClone(joinStack),
					grammarSelect: '',
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});

				continue;
			}
			functionCalls.push({
				name: 'selectSymbol',
				args: [`${elemIds.join}r${topKey}-${0}`, colors.green, id]
			});

			symbolIds.push(functionCalls.at(-1)?.args);

			functionCalls.push({
				name: 'showTooltip',
				args: [
					`label-${elemIds.join}`,
					`O conjunto first de '<small>${topValue}</small>${rules[topValue].left}' já está completo, por isso mesclamos seu first ao first de '<small>${topKey}</small>${rules[topKey].left}' e removemos '<small>${topValue}</small>${rules[topValue].left}' do conjunto join de '<small>${topKey}</small>${rules[topKey].left}'`,
					colors.blue,
					1
				]
			});
			const _firstSet = firstSet.get(topKey);
			const setToJoin = /**@type {Set<String>}*/ (firstSet.get(topValue));
			for (let item of setToJoin) {
				if (item != '') {
					_firstSet?.add(item);
				}
			}
			functionCalls.push({ name: 'highlightLines', args: [[28]] });
			functionCalls.push({ name: 'highlightLines', args: [[29]] });

			functionCalls.push({
				name: 'joinSets',
				args: [[...setToJoin], topKey, `${elemIds.first}l${topValue}`]
			});

			top.delete(topValue);
			functionCalls.push({ name: 'highlightLines', args: [[30]] });

			functionCalls.push({
				name: 'removeSet',
				args: [topKey, topValue]
			});
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				join: structuredClone(joinSet),
				first: structuredClone(firstSet),
				joinStack: structuredClone(joinStack),
				grammarSelect: '',
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
			});
			functionCalls.push({ name: 'highlightLines', args: [[31]] });
			if (top.size === 0) {
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`label-${elemIds.joinStack}`,
						`Como o conjunto join de '<small>${topKey}</small>${rules[topKey].left}' está vazio, removemos '<small>${topKey}</small>${rules[topKey].left}' da join stack`,
						colors.blue,
						1
					]
				});
				functionCalls.push({ name: 'highlightLines', args: [[32]] });

				joinStack.pop();
				functionCalls.push({
					name: 'removeFromStack',
					args: [joinStack.length]
				});
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					join: structuredClone(joinSet),
					first: structuredClone(firstSet),
					joinStack: structuredClone(joinStack),
					grammarSelect: '',
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
			}
		}
	}

	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		join: structuredClone(joinSet),
		first: structuredClone(firstSet),
		joinStack: [],
		grammarSelect: '',
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolIds)
	});
	return { firstSet, id };
}

/**
 * @param {import("@/types").GrammarItem[]} rules
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
 * @param {import("@/types").GrammarItem[]} rules
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
