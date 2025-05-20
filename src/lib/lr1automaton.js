import { colors } from './selectSymbol';

/**
 * @type {{
 * targetState: import('@/types').LR1StateItem[],
 * originState: import('@/types').LR1StateItem[],
 * originStateName: string,
 * targetStateName: string,
 * stateStack: number[],
 * automaton: import('@/types').LR1Automaton,
 * lookahead: Set<string>,
 * functionCall: number}[]}
 * */
export let saves = [];
/**@type {any} */
export let functionCalls = [];
export const id = 'lr1automaton';
export const elemIds = {
	alphabet: `${id}-alphabet`,
	grammar: `${id}-grammar`,
	originState: `${id}-originalState`,
	targetState: `${id}-targetState`,
	stateStack: `${id}-stateStack`,
	lookahead: `${id}-lookahead`,
	firstSet: `${id}-firstSet`
};
/**
 * @param {import('@/types').LR1StateItem[]} state
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {Map<string, Set<string>>} firstSet
 */
export function closure(state, rules, nt, firstSet) {
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		targetState: [...state],
		lookahead: new Set(),
		originState: saves[saves.length - 1].originState,
		stateStack: saves[saves.length - 1].stateStack,
		automaton: saves[saves.length - 1].automaton,
		originStateName: saves[saves.length - 1].originStateName,
		targetStateName: saves[saves.length - 1].targetStateName,
		functionCall: functionCalls.length - 1
	});
	let itemsToCheck = [...state.keys()];
	functionCalls.push({ name: 'highlightLinesClosure', args: [[0]] });
	let itemSymbolId = null;
	while (itemsToCheck.length > 0) {
		functionCalls.push({ name: 'lookaheadRemoveAll', args: [] });
		functionCalls.push({ name: 'highlightLinesClosure', args: [[1]] });
		let item = state[itemsToCheck[0]];
		let index = itemsToCheck[0];
		functionCalls.push({ name: 'highlightLinesClosure', args: [[2]] });
		functionCalls.push({
			name: 'selectForTargetState',
			args: [`state-${elemIds.targetState}-${index}`]
		});
		functionCalls.push({ name: 'highlightLinesClosure', args: [[3]] });
		let symbol = rules[item.ruleIndex].right[item.pos];
		itemSymbolId =
			item.pos < rules[item.ruleIndex].right.length
				? `state-${elemIds.targetState}-${index}-${item.pos}`
				: null;
		if (itemSymbolId)
			functionCalls.push({
				name: 'selectSymbol',
				args: [itemSymbolId, colors.pink, id, false]
			});
		functionCalls.push({ name: 'highlightLinesClosure', args: [[4]] });
		if (!nt.includes(symbol)) {
			functionCalls.push({ name: 'highlightLinesClosure', args: [[5]] });
			functionCalls.push({ name: 'highlightLinesClosure', args: [[6]] });
			itemsToCheck.shift();
			continue;
		}
		functionCalls.push({ name: 'highlightLinesClosure', args: [[7]] });
		let lookahead = new Set();
		functionCalls.push({ name: 'highlightLinesClosure', args: [[8]] });
		if (rules[item.ruleIndex].right.length - 1 === item.pos) {
			functionCalls.push({ name: 'highlightLinesClosure', args: [[9]] });
			functionCalls.push({ name: 'highlightDotTarget', args: [index] });
			for (let l of item.lookahead) {
				if (lookahead.has(l)) continue;
				functionCalls.push({
					name: 'addLookahead',
					args: [l, l, '', `look-${elemIds.targetState}-${index}`]
				});
			}
			lookahead = new Set(item.lookahead);

			functionCalls.push({ name: 'addPause', args: [id] });

			saves.push({
				targetState: [...state],
				lookahead: new Set(lookahead),
				originState: saves[saves.length - 1].originState,
				stateStack: saves[saves.length - 1].stateStack,
				automaton: saves[saves.length - 1].automaton,
				originStateName: saves[saves.length - 1].originStateName,
				targetStateName: saves[saves.length - 1].targetStateName,
				functionCall: functionCalls.length - 1
			});
			functionCalls.push({ name: 'highlightLinesClosure', args: [[10]] });
		} else {
			functionCalls.push({ name: 'highlightLinesClosure', args: [[10]] });
			functionCalls.push({ name: 'highlightLinesClosure', args: [[11]] });
			let nullable = true;
			let betaId = null;
			for (let i = 1; item.pos + i < rules[item.ruleIndex].right.length; i++) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[12]] });
				let beta = rules[item.ruleIndex].right[item.pos + i];
				betaId = `state-${elemIds.targetState}-${index}-${item.pos + i}`;
				functionCalls.push({
					name: 'selectSymbol',
					args: [betaId, colors.pink, id, false]
				});
				functionCalls.push({ name: 'highlightLinesClosure', args: [[13]] });
				if (!nt.includes(beta)) {
					functionCalls.push({ name: 'highlightLinesClosure', args: [[14]] });
					functionCalls.push({ name: 'highlightLinesClosure', args: [[15]] });
					functionCalls.push({ name: 'highlightLinesClosure', args: [[16]] });
					if (!lookahead.has(beta)) {
						functionCalls.push({
							name: 'addLookahead',
							args: [beta, beta, '', betaId]
						});
					}
					lookahead.add(beta);
					functionCalls.push({ name: 'addPause', args: [id] });
					saves.push({
						targetState: [...state],
						lookahead: new Set(lookahead),
						originState: saves[saves.length - 1].originState,
						stateStack: saves[saves.length - 1].stateStack,
						automaton: saves[saves.length - 1].automaton,
						originStateName: saves[saves.length - 1].originStateName,
						targetStateName: saves[saves.length - 1].targetStateName,
						functionCall: functionCalls.length - 1
					});
					nullable = false;
					break;
				} else {
					functionCalls.push({ name: 'highlightLinesClosure', args: [[17]] });
					functionCalls.push({ name: 'highlightLinesClosure', args: [[18]] });
					functionCalls.push({ name: 'highlightLinesClosure', args: [[19]] });
					let firstIndex = rules.findIndex((x) => x.left === beta);
					let first = [.../**@type {Set<string>}*/ (firstSet.get(beta))];

					for (let [i, l] of first.filter((x) => x !== '').entries()) {
						if (lookahead.has(l) || l === '') continue;
						functionCalls.push({
							name: 'addLookahead',
							args: [l, l, '', `${elemIds.firstSet}-${firstIndex}-${i}`]
						});

						lookahead.add(l);
					}
					functionCalls.push({ name: 'addPause', args: [id] });
					saves.push({
						targetState: [...state],
						lookahead: new Set(lookahead),
						originState: saves[saves.length - 1].originState,
						stateStack: saves[saves.length - 1].stateStack,
						automaton: saves[saves.length - 1].automaton,
						originStateName: saves[saves.length - 1].originStateName,
						targetStateName: saves[saves.length - 1].targetStateName,
						functionCall: functionCalls.length - 1
					});
					functionCalls.push({ name: 'highlightLinesClosure', args: [[20]] });
					if (!first.includes('')) {
						functionCalls.push({
							name: 'highlightLinesClosure',
							args: [[21]]
						});
						functionCalls.push({
							name: 'highlightLinesClosure',
							args: [[22]]
						});
						nullable = false;
						break;
					}
				}
				if (betaId) {
					functionCalls.push({ name: 'deselectSymbol', args: [betaId, id] });
					betaId = null;
				}
			}
			if (betaId) {
				functionCalls.push({ name: 'deselectSymbol', args: [betaId, id] });
				betaId = null;
			}
			functionCalls.push({ name: 'highlightLinesClosure', args: [[23]] });
			if (nullable) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[24]] });
				for (let l of item.lookahead) {
					if (lookahead.has(l)) continue;
					functionCalls.push({
						name: 'addLookahead',
						args: [l, l, '', `look-${elemIds.targetState}-${index}`]
					});
					lookahead.add(l);
				}
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: [...state],
					lookahead: new Set(lookahead),
					originState: saves[saves.length - 1].originState,
					stateStack: saves[saves.length - 1].stateStack,
					automaton: saves[saves.length - 1].automaton,
					originStateName: saves[saves.length - 1].originStateName,
					targetStateName: saves[saves.length - 1].targetStateName,
					functionCall: functionCalls.length - 1
				});
			}
		}
		for (let rule of rules) {
			functionCalls.push({ name: 'highlightLinesClosure', args: [[25]] });
			functionCalls.push({
				name: 'selectForGrammar',
				args: [`${elemIds.grammar}gset${rule.index}`]
			});
			functionCalls.push({ name: 'highlightLinesClosure', args: [[26]] });
			if (!(rule.left === symbol)) continue;

			functionCalls.push({ name: 'highlightDotTarget', args: [index] });
			/**@type {string?} */
			let ruleId = `${elemIds.grammar}gl${rule.index}`;
			functionCalls.push({
				name: 'selectSymbol',
				args: [ruleId, colors.blue, id, false]
			});
			functionCalls.push({ name: 'highlightLinesClosure', args: [[27]] });
			let existent = state.findIndex((x) => x.ruleIndex === rule.index && x.pos === 0);

			functionCalls.push({ name: 'highlightLinesClosure', args: [[28]] });
			if (existent === -1) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[29]] });
				functionCalls.push({
					name: 'addItem',
					args: [rule.index, 0, new Set(lookahead), ruleId]
				});
				functionCalls.push({ name: 'highlightLinesClosure', args: [[30]] });
				functionCalls.push({ name: 'highlightLinesClosure', args: [[31]] });
				state.push({ ruleIndex: rule.index, pos: 0, lookahead: new Set(lookahead) });
				itemsToCheck.push(state.length - 1);
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: [...state],
					lookahead: new Set(lookahead),
					originState: saves[saves.length - 1].originState,
					stateStack: saves[saves.length - 1].stateStack,
					automaton: saves[saves.length - 1].automaton,
					originStateName: saves[saves.length - 1].originStateName,
					targetStateName: saves[saves.length - 1].targetStateName,
					functionCall: functionCalls.length - 1
				});
				if (ruleId) {
					functionCalls.push({ name: 'deselectSymbol', args: [ruleId, id] });
					ruleId = null;
				}
				continue;
			}
			functionCalls.push({ name: 'highlightLinesClosure', args: [[32]] });
			functionCalls.push({ name: 'highlightLinesClosure', args: [[33]] });
			let size = state[existent].lookahead.size;
			functionCalls.push({
				name: 'updateLookahead',
				args: [new Set(lookahead), existent]
			});
			for (let l of lookahead) {
				state[existent].lookahead.add(l);
			}
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				targetState: [...state],
				lookahead: new Set(state[existent].lookahead),
				originState: saves[saves.length - 1].originState,
				stateStack: saves[saves.length - 1].stateStack,
				automaton: saves[saves.length - 1].automaton,
				originStateName: saves[saves.length - 1].originStateName,
				targetStateName: saves[saves.length - 1].targetStateName,
				functionCall: functionCalls.length - 1
			});
			if (ruleId) {
				functionCalls.push({ name: 'deselectSymbol', args: [ruleId, id] });
				ruleId = null;
			}
			functionCalls.push({ name: 'highlightLinesClosure', args: [[34]] });
			if (state[existent].lookahead.size === size) {
				continue;
			}
			functionCalls.push({ name: 'highlightLinesClosure', args: [[35]] });

			itemsToCheck.push(existent);
		}
		functionCalls.push({ name: 'hideSelectGrammar', args: [] });
		functionCalls.push({ name: 'highlightLinesClosure', args: [[36]] });

		itemsToCheck.shift();
		if (itemSymbolId) {
			functionCalls.push({
				name: 'deselectSymbol',
				args: [itemSymbolId, id]
			});
			itemSymbolId = null;
		}
	}
	if (itemSymbolId) {
		functionCalls.push({ name: 'deselectSymbol', args: [itemSymbolId, id] });
		itemSymbolId = null;
	}
	functionCalls.push({ name: 'lookaheadRemoveAll', args: [] });
	functionCalls.push({ name: 'hideSelectTargetState', args: [] });
}

/**
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {string[]} t
 * @param {Map<string,Set<string>>} firstSet
 */
export function lr1Automaton(rules, nt, t, firstSet) {
	functionCalls = [];
	saves = [];
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		targetState: [],
		originState: [],
		originStateName: '',
		targetStateName: 's?',
		stateStack: [],
		automaton: { states: [], transitions: new Map() },
		lookahead: new Set(),
		functionCall: 0
	});

	/**@type {import('@/types').LR1Automaton}*/
	let automaton = { states: [], transitions: new Map() };
	functionCalls.push({ name: 'highlightLines', args: [[1]] });
	functionCalls.push({ name: 'highlightLines', args: [[2]] });
	/**@type {number[]} */
	let stateStack = [0];
	functionCalls.push({
		name: 'addItem',
		args: [0, 0, new Set(['$']), `${id}gl0`]
	});

	/**@type {import('@/types').LR1StateItem[]} */
	let state0 = [{ pos: 0, ruleIndex: 0, lookahead: new Set(['$']) }];

	functionCalls.push({ name: 'highlightLines', args: [[3]] });

	closure(state0, rules, nt, firstSet);

	functionCalls.push({ name: 'highlightLines', args: [[4]] });
	functionCalls.push({ name: 'originStateName', args: ['s0'] });
	automaton.states.push({ index: 0, items: [...state0] });
	functionCalls.push({
		name: 'addNode',
		args: [null, 0, structuredClone(automaton.states[0]), null],
		skip: true
	});

	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		targetState: structuredClone(state0),
		originState: [],
		originStateName: '',
		targetStateName: 's?',
		stateStack: structuredClone(stateStack),
		automaton: structuredClone(automaton),
		lookahead: new Set(),
		functionCall: functionCalls.length - 1
	});

	functionCalls.push({ name: 'highlightLines', args: [[5]] });
	functionCalls.push({
		name: 'addToStack',
		args: [0, 's0', '', `label-${elemIds.targetState}`]
	});
	functionCalls.push({ name: 'highlightLines', args: [[6]] });

	let alphabet = [...t, ...nt].filter((x) => x !== '' && x !== '$');
	let originStateIndex = 0;
	while (stateStack.length > 0) {
		functionCalls.push({ name: 'highlightLines', args: [[7]] });
		functionCalls.push({ name: 'resetOriginState', args: [] });
		functionCalls.push({
			name: 'originStateName',
			args: [`s${stateStack[0]}`]
		});
		originStateIndex = stateStack[0];
		functionCalls.push({
			name: 'loadOriginState',
			args: [structuredClone(automaton.states[stateStack[0]].items)]
		});
		functionCalls.push({ name: 'highlightLines', args: [[8]] });
		for (let [symbolIndex, symbol] of alphabet.entries()) {
			/**@type {import('@/types').LR1StateItem[]} */
			let state1 = [];
			functionCalls.push({
				name: 'selectForAlphabet',
				args: [`stack-${elemIds.alphabet}-${symbolIndex}`]
			});
			functionCalls.push({ name: 'targetStateReset', args: [] });
			functionCalls.push({ name: 'highlightLines', args: [[9]] });
			functionCalls.push({ name: 'highlightLines', args: [[10]] });
			for (let [prodIndex, prod] of automaton.states[stateStack[0]].items.entries()) {
				functionCalls.push({
					name: 'selectForOriginalState',
					args: [`state-${elemIds.originState}-${prodIndex}`]
				});
				functionCalls.push({ name: 'highlightLines', args: [[11]] });
				if (
					prod.pos >= rules[prod.ruleIndex].right.length ||
					rules[prod.ruleIndex].right[prod.pos] !== symbol
				)
					continue;
				functionCalls.push({
					name: 'highlightDotOriginal',
					args: [prodIndex]
				});
				functionCalls.push({
					name: 'selectSymbol',
					args: [`state-${elemIds.originState}-${prodIndex}-${prod.pos}`, colors.pink, id, false]
				});
				functionCalls.push({ name: 'highlightLines', args: [[12]] });
				let existent = state1.findIndex(
					(x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1
				);
				if (existent === -1) {
					state1.push({ ruleIndex: prod.ruleIndex, pos: prod.pos + 1, lookahead: prod.lookahead });
					functionCalls.push({
						name: 'addItem',
						args: [
							prod.ruleIndex,
							prod.pos + 1,
							structuredClone(prod.lookahead),
							`state-${elemIds.originState}-${prodIndex}`
						]
					});
				} else {
					functionCalls.push({
						name: 'updateLookahead',
						args: [structuredClone(prod.lookahead), existent]
					});

					state1[existent].lookahead = new Set([...state1[existent].lookahead, ...prod.lookahead]);
				}
				functionCalls.push({
					name: 'deselectSymbol',
					args: [`state-${elemIds.originState}-${prodIndex}-${prod.pos}`, id]
				});

				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state1),
					originState: structuredClone(automaton.states[originStateIndex].items),
					originStateName: `s${originStateIndex}`,
					targetStateName: 's?',
					stateStack: structuredClone(stateStack),
					lookahead: new Set(),
					automaton: structuredClone(automaton),
					functionCall: functionCalls.length - 1
				});
			}
			functionCalls.push({ name: 'hideSelectOriginal', args: [] });
			functionCalls.push({ name: 'highlightLines', args: [[13]] });
			if (state1.length === 0) continue;
			closure(state1, rules, nt, firstSet);
			let existent = automaton.states.findIndex((x) => {
				if (x.items.length != state1.length) return false;
				let eq = true;
				for (let k = 0; k < x.items.length; k++) {
					let match = false;

					for (let m = 0; m < state1.length; m++) {
						match =
							match ||
							(x.items[k].pos === state1[m].pos &&
								x.items[k].ruleIndex === state1[m].ruleIndex &&
								x.items[k].lookahead.size === state1[m].lookahead?.size &&
								x.items[k].lookahead.values().every((x) => state1[m].lookahead.has(x)));
						if (match) break;
					}
					eq = match;
					if (!eq) break;
				}
				return eq;
			});

			functionCalls.push({ name: 'highlightLines', args: [[14]] });
			if (!automaton.transitions.has(stateStack[0]))
				automaton.transitions.set(stateStack[0], new Map());

			if (existent === -1) {
				functionCalls.push({ name: 'highlightLines', args: [[16]] });
				functionCalls.push({ name: 'highlightLines', args: [[17]] });
				functionCalls.push({ name: 'highlightLines', args: [[18]] });

				automaton.states.push({ index: automaton.states.length, items: structuredClone(state1) });
				functionCalls.push({
					name: 'addNode',
					args: [
						stateStack[0],
						automaton.states.length - 1,
						structuredClone(automaton.states[automaton.states.length - 1]),
						symbol
					],
					skip: true
				});
				functionCalls.push({ name: 'highlightLines', args: [[19]] });
				functionCalls.push({
					name: 'addToStack',
					args: [
						automaton.states.length - 1,
						`s${automaton.states.length - 1}`,
						'',
						`label-${elemIds.targetState}`
					]
				});
				automaton.transitions.get(stateStack[0])?.set(symbol, automaton.states.length - 1);
				stateStack.push(automaton.states.length - 1);
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state1),
					originState: structuredClone(automaton.states[originStateIndex].items),
					originStateName: `s${originStateIndex}`,
					targetStateName: 's?',
					stateStack: structuredClone(stateStack),
					lookahead: new Set(),
					automaton: structuredClone(automaton),
					functionCall: functionCalls.length - 1
				});
				continue;
			} else {
				functionCalls.push({ name: 'highlightLines', args: [[15]] });
				functionCalls.push({ name: 'highlightLines', args: [[16]] });
			}

			automaton.transitions.get(stateStack[0])?.set(symbol, existent);
		}
		stateStack.shift();
		functionCalls.push({ name: 'highlightLines', args: [[20]] });
		functionCalls.push({ name: 'removeFromStack', args: [0] });
	}
	functionCalls.push({ name: 'hideSelectAlphabet', args: [] });
	functionCalls.push({ name: 'addPause', args: [id] });

	saves.push({
		targetState: [],
		lookahead: new Set(),
		originState: automaton.states[originStateIndex].items,
		originStateName: `s${originStateIndex}`,
		targetStateName: 's?',
		stateStack: structuredClone(stateStack),
		automaton: structuredClone(automaton),
		functionCall: functionCalls.length - 1
	});
	return { automaton, functionCalls, saves, id, elemIds };
}
