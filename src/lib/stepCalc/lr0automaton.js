import { nt, augRules, t } from '$lib/utils';
import { colors } from '../selectSymbol';

export const id = 'lr0automaton';
export const elemIds = {
	grammar: `${id}-grammar`,
	stateStack: `${id}-stateStack`,
	table: `${id}-table`,
	targetState: `${id}-targetState`,
	originState: `${id}-originState`,
	alphabet: `${id}-alphabet`,
	automaton: `${id}-automaton`
};

/** @type {import("@/types").Command<ReturnType<typeof import("@/Algorithms/LR0AutomatonAlgorithm.svelte").default>['obj']>[]} */
export let functionCalls = [];
/**
 * @type {{
 * targetState: import('@/types').LR0StateItem[],
 * originState: import('@/types').LR0StateItem[],
 * originStateName: string,
 * stateStack: number[],
 * symbolIds: (Parameters<import("../selectSymbol").selectSymbol>)[],
 * automaton: import('@/types').LR0Automaton,
 * functionCall: number}[]}
 * */
export let saves = [];
/** @type {(Parameters<import("../selectSymbol").selectSymbol>)[]}*/
let symbolIds = [];

/**
 * @param {import('@/types').LR0StateItem} prod*/
function prodToString(prod) {
	let prodStr = `${augRules[prod.ruleIndex].left} -> `;
	let right = augRules[prod.ruleIndex].right;
	prodStr +=
		right.length === 0
			? '&epsilon;'
			: right.slice(0, prod.pos).join(' ') + '&bull;' + right.slice(prod.pos).join(' ');
	return prodStr;
}
/**
 * @param {import('@/types').LR0StateItem[]} state
 */
export function closure(state) {
	let itemsToCheck = [...state.keys()];

	functionCalls.push({ name: 'highlightLinesClosure', args: [[0]] });
	functionCalls.push({ name: 'highlightLinesClosure', args: [[1]] });

	functionCalls.push({ name: 'highlightLinesClosure', args: [[2]] });
	while (itemsToCheck.length > 0) {
		functionCalls.push({ name: 'highlightLinesClosure', args: [[3]] });
		let item = state[itemsToCheck[0]];
		let index = itemsToCheck[0];
		functionCalls.push({
			name: 'selectForTarget',
			args: [`state-${elemIds.targetState}-${index}`, colors.pink, id]
		});
		functionCalls.push({ name: 'highlightLinesClosure', args: [[4]] });

		if (augRules[item.ruleIndex].right.length === item.pos) {
			functionCalls.push({ name: 'highlightLinesClosure', args: [[5]] });
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`state-dot-${elemIds.targetState}-${index}`,
					`O ponto está na última posição da produção ${prodToString(item)} então passamos para a próxima iteração`,
					colors.pink,
					1
				]
			});
			itemsToCheck.shift();
			functionCalls.push({
				name: 'addPause',
				args: [id]
			});
			saves.push({
				targetState: structuredClone(state),
				originState: saves[saves.length - 1].originState,
				originStateName: saves[saves.length - 1].originStateName,
				stateStack: saves[saves.length - 1].stateStack,
				automaton: saves[saves.length - 1].automaton,
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
			});
			continue;
		}
		let symbol = augRules[item.ruleIndex].right[item.pos];

		functionCalls.push({ name: 'highlightLinesClosure', args: [[6]] });
		functionCalls.push({ name: 'highlightLinesClosure', args: [[7]] });
		if (!nt.includes(symbol)) {
			functionCalls.push({ name: 'highlightLinesClosure', args: [[8]] });
			functionCalls.push({ name: 'highlightLinesClosure', args: [[9]] });
			itemsToCheck.shift();
			functionCalls.push({ name: 'highlightDotTarget', args: [index] });
			functionCalls.push({
				name: 'selectSymbol',
				args: [`state-${elemIds.targetState}-${index}-${item.pos}`, colors.pink, id, false]
			});
			symbolIds.push(functionCalls.at(-1)?.args);
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`state-${elemIds.targetState}-${index}-${item.pos === augRules[item.ruleIndex].right.length ? item.pos - 1 : item.pos}`,
					`'${symbol}' é um terminal então passamos para a próxima iteração`,
					colors.pink,
					1
				]
			});
			functionCalls.push({
				name: 'addPause',
				args: [id]
			});
			saves.push({
				targetState: structuredClone(state),
				originState: saves[saves.length - 1].originState,
				originStateName: saves[saves.length - 1].originStateName,
				stateStack: saves[saves.length - 1].stateStack,
				automaton: saves[saves.length - 1].automaton,
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
			});
			continue;
		}

		functionCalls.push({ name: 'highlightDotTarget', args: [index] });
		functionCalls.push({
			name: 'selectSymbol',
			args: [`state-${elemIds.targetState}-${index}-${item.pos}`, colors.pink, id, false]
		});
		symbolIds.push(functionCalls.at(-1)?.args);
		functionCalls.push({
			name: 'showTooltip',
			args: [
				`label-${elemIds.targetState}`,
				`'${symbol}' é um não-terminal, por isso adicionamos suas produções ao estado novo`,
				colors.pink,
				1
			]
		});
		functionCalls.push({
			name: 'addPause',
			args: [id]
		});
		saves.push({
			targetState: structuredClone(state),
			originState: saves[saves.length - 1].originState,
			originStateName: saves[saves.length - 1].originStateName,
			stateStack: saves[saves.length - 1].stateStack,
			automaton: saves[saves.length - 1].automaton,
			functionCall: functionCalls.length - 1,
			symbolIds: structuredClone(symbolIds)
		});
		for (let [ruleIndex, rule] of augRules.entries()) {
			functionCalls.push({ name: 'highlightLinesClosure', args: [[10]] });

			functionCalls.push({
				name: 'selectForGrammar',
				args: [`${elemIds.grammar}gset${ruleIndex}`]
			});

			functionCalls.push({ name: 'highlightLinesClosure', args: [[11]] });
			if (!(rule.left === symbol)) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[12]] });
				continue;
			}

			functionCalls.push({ name: 'highlightLinesClosure', args: [[13]] });
			if (state.some((x) => x.ruleIndex === rule.index && x.pos === 0)) {
				functionCalls.push({ name: 'highlightLinesClosure', args: [[14]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`${elemIds.grammar}gl${ruleIndex}`,
						`Essa produção da gramática já está no estado novo`,
						colors.blue,
						1
					]
				});
				functionCalls.push({
					name: 'addPause',
					args: [id]
				});
				saves.push({
					targetState: structuredClone(state),
					originState: saves[saves.length - 1].originState,
					originStateName: saves[saves.length - 1].originStateName,
					stateStack: saves[saves.length - 1].stateStack,
					automaton: saves[saves.length - 1].automaton,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});

				continue;
			}
			functionCalls.push({ name: 'highlightLinesClosure', args: [[15]] });

			state.push({ ruleIndex: rule.index, pos: 0, lookahead: null });
			functionCalls.push({
				name: 'addItemTarget',
				args: [rule.index, 0, null, `${elemIds.grammar}gl${rule.index}`]
			});
			functionCalls.push({ name: 'highlightLinesClosure', args: [[16]] });
			itemsToCheck.push(state.length - 1);
		}

		functionCalls.push({ name: 'hideSelectGrammar', args: [] });

		let symbolId = `state-${elemIds.targetState}-${itemsToCheck[0]}-${item.pos}`;
		functionCalls.push({
			name: 'deselectSymbol',
			args: [symbolId, id]
		});

		symbolIds = symbolIds.filter((x) => x[0] != symbolId);
		functionCalls.push({ name: 'highlightLinesClosure', args: [[17]] });
		itemsToCheck.shift();
	}

	functionCalls.push({ name: 'hideSelectTarget', args: [] });
	functionCalls.push({ name: 'highlightLinesClosure', args: [[]] });
	return state;
}

export function lr0Automaton() {
	functionCalls = [];
	saves = [];
	symbolIds = [];
	/**@type {import('@/types').LR0Automaton}*/
	let automaton = { states: [], transitions: new Map() };

	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		automaton: { states: [], transitions: new Map() },
		targetState: [],
		originState: [],
		originStateName: '',
		stateStack: [],
		functionCall: 0,
		symbolIds: structuredClone(symbolIds)
	});
	functionCalls.push({ name: 'highlightLines', args: [[0]] });
	functionCalls.push({ name: 'highlightLines', args: [[1]] });
	functionCalls.push({ name: 'highlightLines', args: [[2]] });
	functionCalls.push({
		name: 'addItemTarget',
		args: [0, 0, null, `${elemIds.grammar}gl0`]
	});
	/**@type {import('@/types').LR0StateItem[]} */
	let state0 = [{ pos: 0, ruleIndex: 0, lookahead: null }];
	functionCalls.push({ name: 'highlightLines', args: [[3]] });
	closure(state0);
	functionCalls.push({ name: 'highlightLines', args: [[4]] });

	let originStateName = `s${automaton.states.length}`;
	automaton.states.push({ index: 0, items: structuredClone(state0) });
	functionCalls.push({
		name: 'addState',
		args: [null, 0, structuredClone(automaton.states[automaton.states.length - 1]), null],
		skip: true
	});
	functionCalls.push({ name: 'highlightLines', args: [[5]] });
	/**@type {number[]} */
	let stateStack = [0];
	functionCalls.push({
		name: 'showTooltip',
		args: [
			`label-${elemIds.stateStack}`,
			`Não há mais produções para adicionar ao estado novo então o adicionamos a fila de estados novos`,
			colors.blue,
			1
		]
	});
	functionCalls.push({
		name: 'addToStack',
		args: [0, 's0', '', `state-${elemIds.targetState}-title`]
	});
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		targetState: structuredClone(state0),
		originState: saves[saves.length - 1].originState,
		originStateName: originStateName,
		stateStack: structuredClone(stateStack),
		automaton: structuredClone(automaton),
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolIds)
	});
	let alphabet = [...t, ...nt].filter((x) => x !== '' && x !== '$');
	let originStateIndex = 0;
	while (stateStack.length > 0) {
		functionCalls.push({ name: 'highlightLines', args: [[6]] });
		functionCalls.push({
			name: 'selectForStack',
			args: [`stack-${elemIds.stateStack}-0`]
		});
		originStateIndex = stateStack[0];
		originStateName = `s${automaton.states[stateStack[0]].index}`;

		functionCalls.push({ name: 'resetStateOrigin', args: [true] });
		functionCalls.push({ name: 'stateName', args: [originStateName] });
		symbolIds = symbolIds.filter((x) => !x[0].includes(elemIds.originState));
		functionCalls.push({
			name: 'loadState',
			args: [
				structuredClone(automaton.states[stateStack[0]].items),
				`stack-${elemIds.stateStack}-${stateStack.length - 1}`
			]
		});
		functionCalls.push({
			name: 'showTooltip',
			args: [
				`label-${elemIds.originState}`,
				`Vamos calcular as possíveis transições para o estado ${originStateName}`,
				colors.pink,
				1
			]
		});
		/**@type {string?} */
		let selectId = null;
		functionCalls.push({ name: 'addPause', args: [id] });
		saves.push({
			targetState: structuredClone(state0),
			originState: saves[saves.length - 1].originState,
			originStateName: originStateName,
			stateStack: structuredClone(stateStack),
			automaton: structuredClone(automaton),
			functionCall: functionCalls.length - 1,
			symbolIds: structuredClone(symbolIds)
		});
		/**@type {import('@/types').LR0StateItem[]} */
		let state1 = [];
		for (let [symbolIndex, symbol] of alphabet.entries()) {
			functionCalls.push({ name: 'highlightLines', args: [[7]] });

			selectId = `stack-${elemIds.alphabet}-${symbolIndex}`;
			functionCalls.push({ name: 'selectForAlphabet', args: [selectId, id] });
			functionCalls.push({
				name: 'showTooltip',
				args: [
					`label-${elemIds.alphabet}`,
					`Checamos se há possíveis transições com o símbolo '${symbol}'`,
					colors.green,
					1
				]
			});
			functionCalls.push({
				name: 'addPause',
				args: [id]
			});
			saves.push({
				targetState: structuredClone(state1),
				originState: structuredClone(automaton.states[originStateIndex].items),
				originStateName: originStateName,
				stateStack: structuredClone(stateStack),
				automaton: structuredClone(automaton),
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
			});
			functionCalls.push({ name: 'resetStateTarget', args: [true] });

			symbolIds = symbolIds.filter((x) => !x[0].includes(elemIds.targetState));
			state1 = [];
			functionCalls.push({ name: 'highlightLines', args: [[8]] });

			for (let [prodIndex, prod] of automaton.states[stateStack[0]].items.entries()) {
				functionCalls.push({ name: 'highlightLines', args: [[9]] });

				functionCalls.push({
					name: 'selectForOrigin',
					args: [`state-${elemIds.originState}-${prodIndex}`]
				});
				functionCalls.push({ name: 'highlightLines', args: [[10]] });

				if (augRules[prod.ruleIndex].right[prod.pos] !== symbol) {
					functionCalls.push({ name: 'highlightLines', args: [[11]] });
					continue;
				}
				functionCalls.push({ name: 'highlightLines', args: [[12]] });
				if (prod.pos >= augRules[prod.ruleIndex].right.length) {
					functionCalls.push({ name: 'highlightLines', args: [[13]] });
					continue;
				}
				functionCalls.push({ name: 'highlightDotOrigin', args: [prodIndex] });
				/**@type {string?} */
				let symbolId = `state-${elemIds.originState}-${prodIndex}-${prod.pos}`;
				functionCalls.push({
					name: 'selectSymbol',
					args: [symbolId, colors.pink, id, false]
				});
				symbolIds.push(functionCalls.at(-1)?.args);

				functionCalls.push({ name: 'highlightLines', args: [[14]] });
				if (state1.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1)) {
					functionCalls.push({
						name: 'showTooltip',
						args: [
							`state-${elemIds.originState}-${prodIndex}-${prod.pos}`,
							`Essa produção já existe no estado novo`,
							colors.pink,
							1
						]
					});
					functionCalls.push({ name: 'highlightLines', args: [[15]] });
					functionCalls.push({
						name: 'deselectSymbol',
						args: [symbolId, id]
					});
					symbolIds = symbolIds.filter((x) => x[0] != symbolId);
					symbolId = null;
					functionCalls.push({
						name: 'addPause',
						args: [id]
					});
					saves.push({
						targetState: structuredClone(state1),
						originState: structuredClone(automaton.states[originStateIndex].items),
						originStateName: originStateName,
						stateStack: structuredClone(stateStack),
						automaton: structuredClone(automaton),
						functionCall: functionCalls.length - 1,
						symbolIds: structuredClone(symbolIds)
					});
					continue;
				}

				functionCalls.push({ name: 'highlightLines', args: [[16]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`label-${elemIds.originState}`,
						`Adicionamos a produção ${prodToString(prod)} com o ponto movido um passo para frente`,
						colors.pink,
						1
					]
				});
				functionCalls.push({
					name: 'addItemTarget',
					args: [
						prod.ruleIndex,
						prod.pos + 1,
						null,
						`state-${elemIds.originState}-${prodIndex}-${prod.pos}`
					]
				});
				state1.push({ ruleIndex: prod.ruleIndex, pos: prod.pos + 1, lookahead: null });
				if (symbolId) {
					functionCalls.push({
						name: 'deselectSymbol',
						args: [symbolId, id]
					});
					symbolIds = symbolIds.filter((x) => x[0] != symbolId);
				}
				functionCalls.push({
					name: 'addPause',
					args: [id]
				});
				saves.push({
					targetState: structuredClone(state1),
					originState: structuredClone(automaton.states[originStateIndex].items),
					originStateName: originStateName,
					stateStack: structuredClone(stateStack),
					automaton: structuredClone(automaton),
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
			}
			functionCalls.push({ name: 'hideSelectOrigin', args: [] });
			functionCalls.push({ name: 'highlightLines', args: [[17]] });
			if (state1.length === 0) {
				functionCalls.push({ name: 'highlightLines', args: [[18]] });
				continue;
			}
			functionCalls.push({ name: 'highlightLines', args: [[19]] });
			closure(state1);

			functionCalls.push({ name: 'highlightLines', args: [[20]] });

			let existent = automaton.states.findIndex((x) => {
				if (x.items.length != state1.length) return false;
				let eq = true;
				for (let k = 0; k < x.items.length; k++) {
					let match = false;
					for (let m = 0; m < state1.length; m++) {
						match =
							match ||
							(x.items[k].pos === state1[m].pos && x.items[k].ruleIndex === state1[m].ruleIndex);
						if (match) break;
					}
					eq = match;
					if (!eq) break;
				}
				return eq;
			});

			if (!automaton.transitions.has(stateStack[0]))
				automaton.transitions.set(stateStack[0], new Map());

			functionCalls.push({ name: 'highlightLines', args: [[21]] });
			if (existent === -1) {
				functionCalls.push({ name: 'highlightLines', args: [[22]] });
				automaton.states.push({ index: automaton.states.length, items: structuredClone(state1) });
				functionCalls.push({
					name: 'addState',
					args: [
						stateStack[0],
						automaton.states.length - 1,
						structuredClone(automaton.states[automaton.states.length - 1]),
						symbol
					],
					skip: true
				});
				functionCalls.push({ name: 'highlightLines', args: [[23]] });
				functionCalls.push({ name: 'highlightLines', args: [[24]] });
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`label-${elemIds.stateStack}`,
						`Não há mais produções para adicionar ao estado novo então o adicionamos a fila de estados novos`,
						colors.blue,
						1
					]
				});
				functionCalls.push({
					name: 'addToStack',
					args: [
						automaton.states.length - 1,
						`s${automaton.states.length - 1}`,
						'',
						`state-${elemIds.targetState}-title`
					]
				});
				stateStack.push(automaton.states.length - 1);

				automaton.transitions.get(stateStack[0])?.set(symbol, automaton.states.length - 1);

				functionCalls.push({ name: 'highlightLines', args: [[25]] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					targetState: structuredClone(state1),
					originState: structuredClone(automaton.states[originStateIndex].items),
					originStateName: originStateName,
					stateStack: structuredClone(stateStack),
					automaton: structuredClone(automaton),
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
				continue;
			}

			functionCalls.push({ name: 'highlightLines', args: [[26]] });
			functionCalls.push({ name: 'highlightLines', args: [[27]] });

			functionCalls.push({
				name: 'addState',
				args: [stateStack[0], existent, null, symbol],
				skip: true
			});
			automaton.transitions.get(stateStack[0])?.set(symbol, existent);

			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				targetState: structuredClone(state1),
				originState: structuredClone(automaton.states[originStateIndex].items),
				originStateName: originStateName,
				stateStack: structuredClone(stateStack),
				automaton: structuredClone(automaton),
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
			});
		}
		functionCalls.push({ name: 'hideSelectAlphabet', args: [] });

		functionCalls.push({ name: 'highlightLines', args: [[28]] });
		functionCalls.push({
			name: 'showTooltip',
			args: [
				`label-${elemIds.stateStack}`,
				`Todas as transições possíveis para o estado ${originStateName} foram calculadas, por isso retiramos esse estado da pilha de estados novos`,
				colors.blue,
				1
			]
		});
		functionCalls.push({ name: 'hideSelectStack', args: [] });
		stateStack.shift();
		functionCalls.push({ name: 'removeFromStack', args: [0] });

		functionCalls.push({ name: 'addPause', args: [id] });
		saves.push({
			targetState: [],
			originState: structuredClone(automaton.states[originStateIndex].items),
			originStateName: originStateName,
			stateStack: structuredClone(stateStack),
			automaton: structuredClone(automaton),
			functionCall: functionCalls.length - 1,
			symbolIds: structuredClone(symbolIds)
		});
	}

	functionCalls.push({ name: 'hideSelectStack', args: [] });
	functionCalls.push({ name: 'highlightLines', args: [[]] });
	functionCalls.push({ name: 'addPause', args: [id] });

	saves.push({
		targetState: [],
		originState: structuredClone(automaton.states[originStateIndex].items),
		originStateName: originStateName,
		stateStack: structuredClone(stateStack),
		automaton: structuredClone(automaton),
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolIds)
	});
	return { automaton, id };
}
