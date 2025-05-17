import { colors } from './selectSymbol';

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
/** @type {any} */
export let functionCalls = [];
/** @type {any} */
export let saves = [];

/**
 * @param {import('@/types').LR0StateItem[]} state
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 */
export function closure(state, rules, nt) {
	let itemsToCheck = [...state.keys()];

	functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[0]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[1]] });

	functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[2]] });
	while (itemsToCheck.length > 0) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[3]] });
		let item = state[itemsToCheck[0]];
		let index = itemsToCheck[0];
		functionCalls.push({
			trace: Error().stack,
			name: 'selectForTarget',
			args: [`state-${elemIds.targetState}-${index}`, colors.pink, id]
		});
		functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[4]] });

		let symbol = rules[item.ruleIndex].right[item.pos];

		functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[5]] });
		if (!nt.includes(symbol)) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[6]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[7]] });
			itemsToCheck.shift();
			continue;
		}

		functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[8]] });
		for (let [ruleIndex, rule] of rules.entries()) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[9]] });

			functionCalls.push({
				trace: Error().stack,
				name: 'selectForGrammar',
				args: [`${elemIds.grammar}gset${ruleIndex}`]
			});
			if (!(rule.left === symbol)) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[10]] });
				continue;
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[11]] });
			if (state.some((x) => x.ruleIndex === rule.index && x.pos === 0)) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[12]] });
				continue;
			}
			functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[13]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightDotTarget', args: [index] });
			functionCalls.push({
				trace: Error().stack,
				name: 'selectSymbol',
				args: [`state-${elemIds.targetState}-${index}-${item.pos}`, colors.pink, id, false]
			});

			state.push({ ruleIndex: rule.index, pos: 0, lookahead: null });
			functionCalls.push({
				trace: Error().stack,
				name: 'addItemTarget',
				args: [rule.index, 0, `${elemIds.grammar}gl${rule.index}`]
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[14]] });
			itemsToCheck.push(state.length - 1);
		}

		functionCalls.push({ trace: Error().stack, name: 'hideSelectGrammar', args: [] });

		functionCalls.push({
			trace: Error().stack,
			name: 'deselectSymbol',
			args: [`state-${elemIds.targetState}-${itemsToCheck[0]}-${item.pos}`, id]
		});
		functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[15]] });
		itemsToCheck.shift();
	}

	functionCalls.push({ trace: Error().stack, name: 'hideSelectTarget', args: [] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLinesClosure', args: [[]] });
	return state;
}

/**
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {string[]} t
 */
export function lr0Automaton(rules, nt, t) {
	/**@type {import('@/types').LR0Automaton}*/
	let automaton = { states: [], transitions: new Map() };

	// Initial state setup
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[0]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
	functionCalls.push({
		trace: Error().stack,
		name: 'addItemTarget',
		args: [0, 0, null, `${id}gl0`]
	});
	/**@type {import('@/types').LR0StateItem[]} */
	let state0 = [{ pos: 0, ruleIndex: 0, lookahead: null }];
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });
	closure(state0, rules, nt);
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[6]] });
	let originStateName = `s${automaton.states.length}`;
	automaton.states.push({ index: 0, items: structuredClone(state0) });
	functionCalls.push({
		trace: Error().stack,
		name: 'addState',
		args: [null, 0, structuredClone(automaton.states[automaton.states.length - 1]), null]
	});
	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	/**@type {number[]} */
	let stateStack = [0];
	functionCalls.push({
		trace: Error().stack,
		name: 'addToStack',
		args: [0, 's0', '', `state-${elemIds.targetState}-title`]
	});
	let alphabet = [...t, ...nt].filter((x) => x !== '' && x !== '$');

	while (stateStack.length > 0) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[7]] });
		functionCalls.push({
			trace: Error().stack,
			name: 'selectForStack',
			args: [`stack-${elemIds.stateStack}-${stateStack.length - 1}`]
		});
		originStateName = `s${automaton.states[stateStack[0]].index}`;

		functionCalls.push({ trace: Error().stack, name: 'resetStateOrigin', args: [true] });
		functionCalls.push({ trace: Error().stack, name: 'stateName', args: [originStateName] });
		functionCalls.push({
			trace: Error().stack,
			name: 'loadState',
			args: [automaton.states[stateStack[0]]]
		});
		/**@type {string?} */
		let selectId = null;
		for (let [symbolIndex, symbol] of alphabet.entries()) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[8]] });

			selectId = `stack-${elemIds.alphabet}-${symbolIndex}`;
			functionCalls.push({ trace: Error().stack, name: 'selectForAlphabet', args: [selectId, id] });
			functionCalls.push({ trace: Error().stack, name: 'resetStateTarget', args: [true] });
			/**@type {import('@/types').LR0StateItem[]} */
			let state1 = [];

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[9]] });
			// State transition logic
			for (let [prodIndex, prod] of automaton.states[stateStack[0]].items.entries()) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[10]] });

				functionCalls.push({
					trace: Error().stack,
					name: 'selectForOrigin',
					args: [`state-${elemIds.originState}-${prodIndex}`]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[11]] });

				if (rules[prod.ruleIndex].right[prod.pos] !== symbol) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[12]] });
					continue;
				}
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[13]] });
				if (prod.pos >= rules[prod.ruleIndex].right.length) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[14]] });
					continue;
				}
				functionCalls.push({ trace: Error().stack, name: 'highlightDotOrigin', args: [prodIndex] });
				/**@type {string?} */
				let symbolId = `state-${elemIds.originState}-${prodIndex}-${prod.pos}`;
				functionCalls.push({
					trace: Error().stack,
					name: 'selectSymbol',
					args: [symbolId, colors.pink, id, false]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[15]] });
				if (state1.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1)) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[16]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'deselectSymbol',
						args: [symbolId, id]
					});
					symbolId = null;
					continue;
				}
				if (symbolId)
					functionCalls.push({
						trace: Error().stack,
						name: 'deselectSymbol',
						args: [symbolId, id]
					});

				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[17]] });

				functionCalls.push({
					trace: Error().stack,
					name: 'addItemTarget',
					args: [prod.ruleIndex, prod.pos + 1]
				});
				state1.push({ ruleIndex: prod.ruleIndex, pos: prod.pos + 1, lookahead: null });
			}
			functionCalls.push({ trace: Error().stack, name: 'hideSelectOrigin', args: [] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[18]] });
			if (state1.length === 0) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[19]] });
				continue;
			}
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[20]] });
			closure(state1, rules, nt);

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[21]] });
			// State existence check
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

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[22]] });
			if (existent === -1) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[23]] });
				automaton.states.push({ index: automaton.states.length, items: structuredClone(state1) });
				functionCalls.push({
					trace: Error().stack,
					name: 'addState',
					args: [
						stateStack[0],
						automaton.states.length - 1,
						structuredClone(automaton.states[automaton.states.length - 1]),
						symbol
					]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[24]] });
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[25]] });
				functionCalls.push({ trace: Error().stack, name: 'hideSelectStack', args: [] });
				functionCalls.push({
					trace: Error().stack,
					name: 'addToStack',
					args: [
						automaton.states.length - 1,
						`s${automaton.states.length - 1}`,
						'',
						`state-${elemIds.targetState}-title`
					]
				});
				stateStack.push(automaton.states.length - 1);
				functionCalls.push({
					trace: Error().stack,
					name: 'selectForStack',
					args: [`stack-${elemIds.stateStack}-${stateStack.length - 1}`]
				});

				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[26]] });
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				automaton.transitions.get(stateStack[0])?.set(symbol, automaton.states.length - 1);
				continue;
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[27]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[28]] });

			functionCalls.push({
				trace: Error().stack,
				name: 'addState',
				args: [stateStack[0], existent, null, symbol]
			});

			functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
			automaton.transitions.get(stateStack[0])?.set(symbol, existent);
		}
		functionCalls.push({ trace: Error().stack, name: 'hideSelectAlphabet', args: [] });

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[29]] });
		functionCalls.push({ trace: Error().stack, name: 'hideSelectStack', args: [] });

		functionCalls.push({ trace: Error().stack, name: 'removeFromStack', args: [0] });

		functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
		stateStack.shift();
	}

	functionCalls.push({ trace: Error().stack, name: 'hideSelectStack', args: [] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[]] });
	return { automaton, id };
}
