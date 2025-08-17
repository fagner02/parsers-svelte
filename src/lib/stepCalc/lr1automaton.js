import { nt, augRules, t, prodToString } from '$lib/utils';
import { colors } from '../selectSymbol';
/**
 * @type {{
 * targetState: import('@/types').LR1StateItem[],
 * originState: import('@/types').LR1StateItem[],
 * originStateName: string,
 * targetStateName: string,
 * stateStack: number[],
 * automaton: import('@/types').LR1Automaton,
 * lookahead: Set<string>,
 * symbolIds: any[],
 * functionCall: number}[]}
 * */
export let saves = [];
/**@type {any[]} */
let symbolsId = [];
/** @type {import("@/types").Command<ReturnType<typeof import("@/Algorithms/LR1AutomatonAlgorithm.svelte").default>['obj']>[]} */
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
 * @param {Map<string, Set<string>>} firstSet
 */
export function closure(state, firstSet) {
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		targetState: structuredClone(state),
		lookahead: new Set(),
		originState: saves[saves.length - 1].originState,
		stateStack: saves[saves.length - 1].stateStack,
		automaton: saves[saves.length - 1].automaton,
		originStateName: saves[saves.length - 1].originStateName,
		targetStateName: saves[saves.length - 1].targetStateName,
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolsId)
	});
	functionCalls.push({ name: 'highlightLinesClosure', args: [[0]] });
	/**
	 * @type {string | null}
	 */
	let itemSymbolId = null;
	let modified = new Set(state.keys());
	for (let k = 0; k < modified.size; k++) {
		functionCalls.push({
			name: 'setUpTooltip',
			args: [
				`state-${elemIds.targetState}l${k}`,
				{
					text: `Esse item está marcado como modificado`,
					hue: colors.orange,
					id: 2,
					willRemove: true
				}
			]
		});
		functionCalls.push({
			name: 'selectSymbol',
			args: [`state-${elemIds.targetState}l${k}`, colors.orange, id, false]
		});
		symbolsId.push(functionCalls.at(-1)?.args);
	}
	while (modified.size > 0) {
		for (let k = 0; k < state.length; k++) {
			functionCalls.push({ name: 'lookaheadRemoveAll', args: [] });
			functionCalls.push({ name: 'highlightLinesClosure', args: [[1]] });
			functionCalls.push({
				name: 'selectForTargetState',
				args: [`state-${elemIds.targetState}-${k}`]
			});

			functionCalls.push({ name: 'highlightLinesClosure', args: [[2]] });
			if (!modified.has(k)) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[3]] });
				continue;
			}
			functionCalls.push({
				name: 'selectSymbol',
				args: [`state-${elemIds.targetState}l${k}`, colors.green, id, false]
			});
			symbolsId.push(functionCalls.at(-1)?.args);

			modified.delete(k);
			functionCalls.push({
				name: 'setUpTooltip',
				args: [
					`state-${elemIds.targetState}l${k}`,
					{
						text: `Esse item está marcado como não modificado`,
						hue: colors.green,
						id: 2,
						willRemove: true
					}
				]
			});
			functionCalls.push({ name: 'highlightLinesClosure', args: [[4]] });
			let item = state[k];
			functionCalls.push({ name: 'highlightLinesClosure', args: [[5]] });
			if (item.pos === augRules[item.ruleIndex].right.length) {
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`state-dot-${elemIds.targetState}-${k}`,
						`O ponto está na última posição da produção ${prodToString(item)} então passamos para a próxima iteração`,
						colors.pink,
						1
					]
				});

				functionCalls.push({ name: 'highlightLinesClosure', args: [[6]] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state),
					lookahead: new Set(),
					originState: saves[saves.length - 1].originState,
					stateStack: saves[saves.length - 1].stateStack,
					automaton: saves[saves.length - 1].automaton,
					originStateName: saves[saves.length - 1].originStateName,
					targetStateName: saves[saves.length - 1].targetStateName,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolsId)
				});
				continue;
			}
			let symbol = augRules[item.ruleIndex].right[item.pos];
			itemSymbolId = `state-${elemIds.targetState}-${k}-${item.pos}`;

			functionCalls.push({
				name: 'selectSymbol',
				args: [itemSymbolId, colors.pink, id, false]
			});
			symbolsId.push(functionCalls.at(-1)?.args);

			functionCalls.push({ name: 'highlightLinesClosure', args: [[7]] });
			functionCalls.push({ name: 'highlightLinesClosure', args: [[8]] });
			if (!nt.includes(symbol)) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[9]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						itemSymbolId,
						`'${symbol}' é um terminal então passamos para a próxima iteração`,
						colors.pink,
						1
					]
				});
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state),
					lookahead: new Set(),
					originState: saves[saves.length - 1].originState,
					stateStack: saves[saves.length - 1].stateStack,
					automaton: saves[saves.length - 1].automaton,
					originStateName: saves[saves.length - 1].originStateName,
					targetStateName: saves[saves.length - 1].targetStateName,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolsId)
				});
				continue;
			}
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`state-${elemIds.targetState}-${k}-${item.pos}`,
					`'${symbol}' é um não-terminal então precisamos adicionar suas produções ao estado, mas antes precisamos calcular o novo lookahead para essas produções`,
					colors.pink,
					1
				]
			});
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				targetState: structuredClone(state),
				lookahead: new Set(),
				originState: saves[saves.length - 1].originState,
				stateStack: saves[saves.length - 1].stateStack,
				automaton: saves[saves.length - 1].automaton,
				originStateName: saves[saves.length - 1].originStateName,
				targetStateName: saves[saves.length - 1].targetStateName,
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolsId)
			});
			functionCalls.push({ name: 'highlightLinesClosure', args: [[10]] });
			let lookahead = new Set();
			functionCalls.push({ name: 'highlightLinesClosure', args: [[11]] });
			if (augRules[item.ruleIndex].right.length - 1 === item.pos) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[12]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`state-${elemIds.targetState}-${k}-${item.pos}`,
						`Não há símbolos depois de '${symbol}', por isso adicionamos o lookahead desse item ao novo lookahead`,
						colors.pink,
						1
					]
				});
				functionCalls.push({ name: 'highlightDotTarget', args: [k] });
				for (let [i, l] of item.lookahead.values().toArray().entries()) {
					if (lookahead.has(l)) continue;
					functionCalls.push({
						name: 'addLookahead',
						args: [l, l, '', `look-${elemIds.targetState}-${k}-${i}`]
					});
				}
				lookahead = new Set(item.lookahead);

				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state),
					lookahead: structuredClone(lookahead),
					originState: saves[saves.length - 1].originState,
					stateStack: saves[saves.length - 1].stateStack,
					automaton: saves[saves.length - 1].automaton,
					originStateName: saves[saves.length - 1].originStateName,
					targetStateName: saves[saves.length - 1].targetStateName,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolsId)
				});
			} else {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[13]] });
				functionCalls.push({ name: 'highlightLinesClosure', args: [[14]] });
				let nullable = true;
				/** @type {string | null}*/
				let betaId = null;
				for (let i = 1; item.pos + i < augRules[item.ruleIndex].right.length; i++) {
					functionCalls.push({ name: 'highlightLinesClosure', args: [[15]] });
					let beta = augRules[item.ruleIndex].right[item.pos + i];
					betaId = `state-${elemIds.targetState}-${k}-${item.pos + i}`;
					functionCalls.push({
						name: 'selectSymbol',
						args: [betaId, colors.pink, id, false]
					});
					symbolsId.push(functionCalls.at(-1)?.args);
					functionCalls.push({ name: 'highlightLinesClosure', args: [[16]] });
					if (!nt.includes(beta)) {
						functionCalls.push({ name: 'highlightLinesClosure', args: [[17]] });
						functionCalls.push({ name: 'highlightLinesClosure', args: [[18]] });
						functionCalls.push({ name: 'highlightLinesClosure', args: [[19]] });
						functionCalls.push({
							name: 'showTooltip',
							args: [
								betaId,
								`O símbolo seguinte '${beta}' é um terminal, então adicionamos ele ao novo lookahead`,
								colors.pink,
								1
							]
						});
						if (!lookahead.has(beta)) {
							functionCalls.push({
								name: 'addLookahead',
								args: [beta, beta, '', betaId]
							});
						}
						lookahead.add(beta);

						functionCalls.push({ name: 'addPause', args: [id] });
						saves.push({
							targetState: structuredClone(state),
							lookahead: structuredClone(lookahead),
							originState: saves[saves.length - 1].originState,
							stateStack: saves[saves.length - 1].stateStack,
							automaton: saves[saves.length - 1].automaton,
							originStateName: saves[saves.length - 1].originStateName,
							targetStateName: saves[saves.length - 1].targetStateName,
							functionCall: functionCalls.length - 1,
							symbolIds: structuredClone(symbolsId)
						});
						nullable = false;
						break;
					} else {
						functionCalls.push({ name: 'highlightLinesClosure', args: [[20]] });
						functionCalls.push({ name: 'highlightLinesClosure', args: [[21]] });
						functionCalls.push({ name: 'highlightLinesClosure', args: [[22]] });
						let firstIndex = augRules.findIndex((x) => x.left === beta);
						let first = [.../**@type {Set<string>}*/ (firstSet.get(beta))];
						functionCalls.push({
							name: 'showTooltip',
							args: [
								betaId,
								`'${beta}' é um não-terminal, então adicionamos os elementos do first de '${beta}' ao novo lookahead`,
								colors.pink,
								1
							]
						});
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
							targetState: structuredClone(state),
							lookahead: structuredClone(lookahead),
							originState: saves[saves.length - 1].originState,
							stateStack: saves[saves.length - 1].stateStack,
							automaton: saves[saves.length - 1].automaton,
							originStateName: saves[saves.length - 1].originStateName,
							targetStateName: saves[saves.length - 1].targetStateName,
							functionCall: functionCalls.length - 1,
							symbolIds: structuredClone(symbolsId)
						});
						functionCalls.push({ name: 'highlightLinesClosure', args: [[23]] });
						if (!first.includes('')) {
							functionCalls.push({
								name: 'highlightLinesClosure',
								args: [[24]]
							});
							functionCalls.push({
								name: 'highlightLinesClosure',
								args: [[25]]
							});
							nullable = false;
							break;
						}
					}
					if (betaId) {
						functionCalls.push({ name: 'deselectSymbol', args: [betaId, id] });
						symbolsId = symbolsId.filter((x) => x[0] != betaId);
						betaId = null;
					}
				}
				if (betaId) {
					functionCalls.push({ name: 'deselectSymbol', args: [betaId, id] });
					symbolsId = symbolsId.filter((x) => x[0] != betaId);
					betaId = null;
				}
				functionCalls.push({ name: 'highlightLinesClosure', args: [[26]] });
				if (nullable) {
					functionCalls.push({ name: 'highlightLinesClosure', args: [[27]] });
					functionCalls.push({
						name: 'showTooltip',
						args: [
							itemSymbolId,
							`Como '${symbol}' é nulável, adicionamos os lookahead da produção original ao novo conjunto`,
							colors.pink,
							1
						]
					});
					for (let [i, l] of item.lookahead.values().toArray().entries()) {
						if (lookahead.has(l)) continue;
						functionCalls.push({
							name: 'addLookahead',
							args: [l, l, '', `look-${elemIds.targetState}-${k}-${i}`]
						});
						lookahead.add(l);
					}

					functionCalls.push({ name: 'addPause', args: [id] });
					saves.push({
						targetState: structuredClone(state),
						lookahead: structuredClone(lookahead),
						originState: saves[saves.length - 1].originState,
						stateStack: saves[saves.length - 1].stateStack,
						automaton: saves[saves.length - 1].automaton,
						originStateName: saves[saves.length - 1].originStateName,
						targetStateName: saves[saves.length - 1].targetStateName,
						functionCall: functionCalls.length - 1,
						symbolIds: structuredClone(symbolsId)
					});
				}
			}
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`label-${elemIds.grammar}`,
					`Agora que terminamos de calcular o novo lookahead vamos adicionar as produções de '${symbol}' ao estado com esse novo lookahead`,
					colors.blue,
					1
				]
			});
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				targetState: structuredClone(state),
				lookahead: structuredClone(lookahead),
				originState: saves[saves.length - 1].originState,
				stateStack: saves[saves.length - 1].stateStack,
				automaton: saves[saves.length - 1].automaton,
				originStateName: saves[saves.length - 1].originStateName,
				targetStateName: saves[saves.length - 1].targetStateName,
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolsId)
			});
			for (let rule of augRules) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[28]] });
				functionCalls.push({
					name: 'selectForGrammar',
					args: [`${elemIds.grammar}gset${rule.index}`]
				});
				functionCalls.push({ name: 'highlightLinesClosure', args: [[29]] });
				if (!(rule.left === symbol)) continue;
				functionCalls.push({ name: 'highlightDotTarget', args: [k] });
				/**@type {string?} */
				let ruleId = `${elemIds.grammar}gl${rule.index}`;
				functionCalls.push({
					name: 'selectSymbol',
					args: [ruleId, colors.blue, id, false]
				});
				symbolsId.push(functionCalls.at(-1)?.args);
				let existent = state.findIndex((x) => x.ruleIndex === rule.index && x.pos === 0);
				functionCalls.push({ name: 'highlightLinesClosure', args: [[30]] });
				if (existent === -1) {
					functionCalls.push({ name: 'highlightLinesClosure', args: [[34]] });
					functionCalls.push({
						name: 'showTooltip',
						args: [
							ruleId,
							`Adicionamos a produção ${rule.left} -> ${rule.right.join(' ')} com o novo lookahead ${Array.from(lookahead).join(', ')}`,
							colors.blue,
							1
						]
					});
					functionCalls.push({ name: 'highlightLinesClosure', args: [[35]] });
					functionCalls.push({
						name: 'addItem',
						args: [rule.index, 0, new Set(lookahead), ruleId]
					});
					functionCalls.push({ name: 'highlightLinesClosure', args: [[36]] });
					functionCalls.push({
						name: 'selectSymbol',
						args: [`state-${elemIds.targetState}l${state.length}`, colors.orange, id, false]
					});
					symbolsId.push(functionCalls.at(-1)?.args);
					functionCalls.push({ name: 'highlightLinesClosure', args: [[37]] });
					modified.add(state.length);
					functionCalls.push({
						name: 'setUpTooltip',
						args: [
							`state-${elemIds.targetState}l${state.length}`,
							{
								text: `Esse item está marcado como modificado`,
								hue: colors.orange,
								id: 2,
								willRemove: true
							}
						]
					});
					state.push({ ruleIndex: rule.index, pos: 0, lookahead: structuredClone(lookahead) });
					functionCalls.push({ name: 'addPause', args: [id] });
					saves.push({
						targetState: structuredClone(state),
						lookahead: structuredClone(lookahead),
						originState: saves[saves.length - 1].originState,
						stateStack: saves[saves.length - 1].stateStack,
						automaton: saves[saves.length - 1].automaton,
						originStateName: saves[saves.length - 1].originStateName,
						targetStateName: saves[saves.length - 1].targetStateName,
						functionCall: functionCalls.length - 1,
						symbolIds: structuredClone(symbolsId)
					});
					if (ruleId) {
						functionCalls.push({ name: 'deselectSymbol', args: [ruleId, id] });
						symbolsId = symbolsId.filter((x) => x[0] != ruleId);
						ruleId = null;
					}
				} else {
					functionCalls.push({ name: 'highlightLinesClosure', args: [[31]] });
					let size = state[existent].lookahead.size;
					functionCalls.push({
						name: 'showTooltip',
						args: [
							`state-${elemIds.targetState}-${existent}`,
							`O item [${prodToString({ lookahead: null, pos: 0, ruleIndex: item.ruleIndex })}] já existe, então apenas atualizamos seu lookahead`,
							colors.pink,
							1
						]
					});
					functionCalls.push({
						name: 'updateLookahead',
						args: [new Set(lookahead), existent]
					});
					for (let l of lookahead) {
						state[existent].lookahead.add(l);
					}
					functionCalls.push({ name: 'addPause', args: [id] });
					saves.push({
						targetState: structuredClone(state),
						lookahead: structuredClone(state[existent].lookahead),
						originState: saves[saves.length - 1].originState,
						stateStack: saves[saves.length - 1].stateStack,
						automaton: saves[saves.length - 1].automaton,
						originStateName: saves[saves.length - 1].originStateName,
						targetStateName: saves[saves.length - 1].targetStateName,
						functionCall: functionCalls.length - 1,
						symbolIds: structuredClone(symbolsId)
					});
					if (ruleId) {
						functionCalls.push({ name: 'deselectSymbol', args: [ruleId, id] });
						symbolsId = symbolsId.filter((x) => x[0] != ruleId);
						ruleId = null;
					}
					functionCalls.push({ name: 'highlightLinesClosure', args: [[32]] });
					if (state[existent].lookahead.size === size) {
						continue;
					}
					modified.add(existent);
					functionCalls.push({
						name: 'setUpTooltip',
						args: [
							`state-${elemIds.targetState}l${existent}`,
							{
								text: `Esse item está marcado como modificado`,
								hue: colors.orange,
								id: 2,
								willRemove: true
							}
						]
					});
					functionCalls.push({
						name: 'showTooltip',
						args: [
							`state-${elemIds.targetState}-${existent}`,
							`O item ${prodToString({ lookahead: null, pos: 0, ruleIndex: item.ruleIndex })}] foi atualizado então marcamos ele como modificado`,
							colors.pink,
							1
						]
					});
					functionCalls.push({
						name: 'selectSymbol',
						args: [`state-${elemIds.targetState}l${existent}`, colors.orange, id, false]
					});
					symbolsId.push(functionCalls.at(-1)?.args);
					functionCalls.push({ name: 'highlightLinesClosure', args: [[33]] });
				}
			}
			functionCalls.push({ name: 'hideSelectGrammar', args: [] });
			if (itemSymbolId) {
				functionCalls.push({
					name: 'deselectSymbol',
					args: [itemSymbolId, id]
				});
				symbolsId = symbolsId.filter((x) => x[0] != itemSymbolId);
				itemSymbolId = null;
			}

			if (k === state.length - 1 && modified.size > 0) {
				k = 0;
			}
		}
	}
	if (itemSymbolId) {
		functionCalls.push({ name: 'deselectSymbol', args: [itemSymbolId, id] });
		symbolsId = symbolsId.filter((x) => x[0] != itemSymbolId);
		itemSymbolId = null;
	}
	functionCalls.push({ name: 'lookaheadRemoveAll', args: [] });
	functionCalls.push({ name: 'hideSelectTargetState', args: [] });
}
/**
 * @param {Map<string,Set<string>>} firstSet
 */
export function lr1Automaton(firstSet) {
	functionCalls = [];
	saves = [];
	symbolsId = [];
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		targetState: [],
		originState: [],
		originStateName: '',
		targetStateName: 's?',
		stateStack: [],
		automaton: { states: [], transitions: new Map() },
		lookahead: new Set(),
		functionCall: 0,
		symbolIds: structuredClone(symbolsId)
	});
	/**@type {import('@/types').LR1Automaton}*/
	let automaton = { states: [], transitions: new Map() };
	functionCalls.push({ name: 'highlightLines', args: [[0]] });
	functionCalls.push({ name: 'highlightLines', args: [[1]] });
	/**@type {number[]} */
	let stateStack = [0];
	functionCalls.push({
		name: 'addItem',
		args: [0, 0, new Set(['$']), `${elemIds.grammar}gl0`]
	});
	/**@type {import('@/types').LR1StateItem[]} */
	let state0 = [{ pos: 0, ruleIndex: 0, lookahead: new Set(['$']) }];
	functionCalls.push({ name: 'highlightLines', args: [[2]] });
	closure(state0, firstSet);
	functionCalls.push({ name: 'highlightLines', args: [[3]] });
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
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolsId)
	});
	functionCalls.push({ name: 'highlightLines', args: [[4]] });
	functionCalls.push({
		name: 'addToStack',
		args: [0, 's0', '', `label-${elemIds.targetState}`]
	});
	functionCalls.push({ name: 'highlightLines', args: [[5]] });
	let alphabet = [...t, ...nt].filter((x) => x !== '' && x !== '$');
	let originStateIndex = 0;
	while (stateStack.length > 0) {
		functionCalls.push({ name: 'highlightLines', args: [[6]] });
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

		symbolsId = symbolsId.filter((x) => !x[0].includes(elemIds.originState));
		functionCalls.push({ name: 'highlightLines', args: [[7]] });
		for (let [symbolIndex, symbol] of alphabet.entries()) {
			/**@type {import('@/types').LR1StateItem[]} */
			let state1 = [];
			symbolsId = symbolsId.filter((x) => !x[0].includes(elemIds.targetState));
			functionCalls.push({
				name: 'selectForAlphabet',
				args: [`stack-${elemIds.alphabet}-${symbolIndex}`]
			});
			functionCalls.push({ name: 'targetStateReset', args: [] });
			functionCalls.push({ name: 'highlightLines', args: [[8]] });
			functionCalls.push({ name: 'highlightLines', args: [[9]] });
			for (let [prodIndex, prod] of automaton.states[stateStack[0]].items.entries()) {
				functionCalls.push({
					name: 'selectForOriginalState',
					args: [`state-${elemIds.originState}-${prodIndex}`]
				});
				functionCalls.push({ name: 'highlightLines', args: [[10]] });
				if (
					prod.pos >= augRules[prod.ruleIndex].right.length ||
					augRules[prod.ruleIndex].right[prod.pos] !== symbol
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
				symbolsId.push(functionCalls.at(-1)?.args);
				functionCalls.push({ name: 'highlightLines', args: [[11]] });
				let existent = state1.findIndex(
					(x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1
				);
				if (existent === -1) {
					functionCalls.push({
						name: 'showTooltip',
						args: [
							`state-${elemIds.originState}-${prodIndex}-${prod.pos}`,
							`Adicionamos a produção ${augRules[prod.ruleIndex].left} -> ${augRules[prod.ruleIndex].right.slice(0, prod.pos).join(' ')}&bull;${augRules[prod.ruleIndex].right.slice(prod.pos).join(' ')}`,
							colors.pink,
							1
						]
					});
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
						name: 'showTooltip',
						args: [
							`state-${elemIds.originState}-${prodIndex}-${prod.pos}`,
							`Atualizamos o lookahead da produção ${augRules[prod.ruleIndex].left} -> ${augRules[prod.ruleIndex].right.slice(0, prod.pos).join(' ')}&bull;${augRules[prod.ruleIndex].right.slice(prod.pos).join(' ')}`,
							colors.pink,
							1
						]
					});
					functionCalls.push({
						name: 'updateLookahead',
						args: [structuredClone(prod.lookahead), existent]
					});
					state1[existent].lookahead = new Set([...state1[existent].lookahead, ...prod.lookahead]);
				}
				const symbolId = `state-${elemIds.originState}-${prodIndex}-${prod.pos}`;
				functionCalls.push({
					name: 'deselectSymbol',
					args: [symbolId, id]
				});
				symbolsId = symbolsId.filter((x) => x[0] != symbolId);
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state1),
					originState: structuredClone(automaton.states[originStateIndex].items),
					originStateName: `s${originStateIndex}`,
					targetStateName: 's?',
					stateStack: structuredClone(stateStack),
					lookahead: new Set(),
					automaton: structuredClone(automaton),
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolsId)
				});
			}
			functionCalls.push({ name: 'hideSelectOriginal', args: [] });
			functionCalls.push({ name: 'highlightLines', args: [[12]] });
			if (state1.length === 0) {
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state1),
					originState: structuredClone(automaton.states[originStateIndex].items),
					originStateName: `s${originStateIndex}`,
					targetStateName: 's?',
					stateStack: structuredClone(stateStack),
					lookahead: new Set(),
					automaton: structuredClone(automaton),
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolsId)
				});
				continue;
			}
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`stack-${elemIds.alphabet}-${symbolIndex}`,
					`Calculando o fechamento do estado resultante`,
					colors.blue,
					1
				]
			});
			closure(state1, firstSet);
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
			functionCalls.push({ name: 'highlightLines', args: [[13]] });
			if (!automaton.transitions.has(stateStack[0])) {
				automaton.transitions.set(stateStack[0], new Map());
			}
			if (existent === -1) {
				functionCalls.push({ name: 'highlightLines', args: [[15]] });
				functionCalls.push({ name: 'highlightLines', args: [[16]] });
				functionCalls.push({ name: 'highlightLines', args: [[17]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`stack-${elemIds.alphabet}-${symbolIndex}`,
						`Criamos um novo estado e adicionamos à pilha`,
						colors.blue,
						1
					]
				});
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
				functionCalls.push({ name: 'highlightLines', args: [[18]] });
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
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolsId)
				});
				continue;
			} else {
				functionCalls.push({ name: 'highlightLines', args: [[14]] });
				functionCalls.push({ name: 'highlightLines', args: [[15]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`stack-${elemIds.alphabet}-${symbolIndex}`,
						`O estado já existe, então usamos a transição existente`,
						colors.blue,
						1
					]
				});
			}
			automaton.transitions.get(stateStack[0])?.set(symbol, existent);
		}
		stateStack.shift();
		functionCalls.push({ name: 'highlightLines', args: [[19]] });
		functionCalls.push({ name: 'removeFromStack', args: [0] });
	}
	functionCalls.push({ name: 'hideSelectAlphabet', args: [] });
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		targetState: [],
		lookahead: new Set(),
		originState: structuredClone(automaton.states[originStateIndex].items),
		originStateName: `s${originStateIndex}`,
		targetStateName: 's?',
		stateStack: structuredClone(stateStack),
		automaton: structuredClone(automaton),
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolsId)
	});
	return { automaton, functionCalls, saves, id, elemIds };
}
