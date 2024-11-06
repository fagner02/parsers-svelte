/**
 * @param {import('@/types').StateItem[]} state
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 */
export function closure(state, rules, nt) {
	let itemsToCheck = [...state];
	while (itemsToCheck.length > 0) {
		/**@type {import("@/types").StateItem[]}*/
		let temp = [];
		for (let item of itemsToCheck) {
			let symbol = rules[item.ruleIndex].right[item.pos];
			if (!nt.includes(symbol)) continue;

			for (let rule of rules) {
				if (!(rule.left === symbol)) continue;
				if (state.some((x) => x.ruleIndex === rule.index && x.pos === 0)) continue;
				state.push({ ruleIndex: rule.index, pos: 0, lookahead: null });
				temp.push({ ruleIndex: rule.index, pos: 0, lookahead: null });
			}
		}
		itemsToCheck = temp;
	}
}
/**
 * @param {import('@/types').GrammarItem[]} rules
 * @param {string[]} nt
 * @param {string[]} t
 */
export function automatonlr0(rules, nt, t) {
	/**@type {import('@/types').Automaton}*/
	let automaton = { states: [], transitions: new Map() };

	/**@type {import('@/types').StateItem[]} */
	let state0 = [{ pos: 0, ruleIndex: 0, lookahead: null }];

	/**@type {number[]} */
	let stateStack = [];
	closure(state0, rules, nt);

	automaton.states.push({ index: automaton.states.length, items: [...state0] });

	stateStack.push(0);
	let alphabet = [...nt, ...t].filter((x) => x !== '');
	while (stateStack.length > 0) {
		for (let symbol of alphabet) {
			/**@type {import('@/types').StateItem[]} */
			let state1 = [];
			for (let prod of automaton.states[stateStack[0]].items) {
				if (
					prod.pos >= rules[prod.ruleIndex].right.length ||
					rules[prod.ruleIndex].right[prod.pos] !== symbol
				)
					continue;
				if (state1.some((x) => x.ruleIndex === prod.ruleIndex && x.pos === prod.pos + 1)) continue;
				state1.push({ ruleIndex: prod.ruleIndex, pos: prod.pos + 1, lookahead: null });
			}
			if (state1.length === 0) continue;
			closure(state1, rules, nt);
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
			if (existent === -1) {
				automaton.states.push({ index: automaton.states.length, items: [...state1] });
				if (!automaton.transitions.has(stateStack[0]))
					automaton.transitions.set(automaton.states[stateStack[0]].index, new Map());
				automaton.transitions
					.get(automaton.states[stateStack[0]].index)
					?.set(symbol, automaton.states.length - 1);

				stateStack.push(automaton.states.length - 1);

				continue;
			}
		}
		stateStack.shift();
	}
	return automaton;
}
