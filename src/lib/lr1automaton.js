/**
 * @param {import('@/types').LR1StateItem[]} state
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {Map<string, Set<string>>} firstSet
 */
export function closure(state, rules, nt, firstSet) {
	let itemsToCheck = [...state.keys()];
	while (itemsToCheck.length > 0) {
		let item = state[itemsToCheck[0]];
		let symbol = rules[item.ruleIndex].right[item.pos];
		if (!nt.includes(symbol)) {
			itemsToCheck.shift();
			continue;
		}
		let lookahead = new Set();
		if (rules[item.ruleIndex].right.length - 1 === item.pos) {
			lookahead = new Set(item.lookahead);
		} else {
			let nullable = true;
			for (let i = 1; item.pos + i < rules[item.ruleIndex].right.length; i++) {
				let beta = rules[item.ruleIndex].right[item.pos + i];
				if (!nt.includes(beta)) {
					lookahead.add(beta);
					nullable = false;
					break;
				} else {
					let first = [.../**@type {Set<string>}*/ (firstSet.get(beta))];
					lookahead.union(new Set(first.filter((x) => x !== '')));

					if (!first.includes('')) {
						nullable = false;
						break;
					}
				}
			}
			if (nullable) {
				lookahead.union(item.lookahead);
			}
		}
		for (let rule of rules) {
			if (!(rule.left === symbol)) continue;
			let existent = state.findIndex((x) => x.ruleIndex === rule.index && x.pos === 0);

			if (existent === -1) {
				state.push({ ruleIndex: rule.index, pos: 0, lookahead: new Set(lookahead) });
				itemsToCheck.push(state.length - 1);
				continue;
			}
			let size = state[existent].lookahead.size;
			for (let l of lookahead) {
				state[existent].lookahead.add(l);
			}
			if (state[existent].lookahead.size === size) {
				continue;
			}

			itemsToCheck.push(existent);
		}

		itemsToCheck.shift();
	}
}

/**
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {string[]} t
 * @param {Map<string,Set<string>>} firstSet
 */
export function lr1Automaton(rules, nt, t, firstSet) {
	/**@type {import('@/types').LR1Automaton}*/
	let automaton = { states: [], transitions: new Map() };

	/**@type {import('@/types').LR1StateItem[]} */
	let state0 = [{ pos: 0, ruleIndex: 0, lookahead: new Set(['$']) }];

	/**@type {number[]} */
	let stateStack = [];
	closure(state0, rules, nt, firstSet);

	automaton.states.push({ index: 0, items: [...state0] });

	let count = 0;
	stateStack.push(0);
	let alphabet = [...t, ...nt].filter((x) => x !== '' && x !== '$');
	while (stateStack.length > 0) {
		for (let symbol of alphabet) {
			/**@type {import('@/types').LR1StateItem[]} */
			let state1 = [];
			count++;
			for (let prod of automaton.states[stateStack[0]].items) {
				if (
					prod.pos >= rules[prod.ruleIndex].right.length ||
					rules[prod.ruleIndex].right[prod.pos] !== symbol
				)
					continue;
				let existent = state1.findIndex(
					(x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1
				);
				if (existent === -1) {
					state1.push({ ruleIndex: prod.ruleIndex, pos: prod.pos + 1, lookahead: prod.lookahead });
				} else {
					state1[existent].lookahead = new Set([...state1[existent].lookahead, ...prod.lookahead]);
				}
			}
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

			if (!automaton.transitions.has(stateStack[0]))
				automaton.transitions.set(stateStack[0], new Map());

			if (existent === -1) {
				automaton.states.push({ index: automaton.states.length, items: [...state1] });
				automaton.transitions.get(stateStack[0])?.set(symbol, automaton.states.length - 1);
				stateStack.push(automaton.states.length - 1);
				continue;
			}

			automaton.transitions.get(stateStack[0])?.set(symbol, existent);
		}
		stateStack.shift();
	}
	return automaton;
}
