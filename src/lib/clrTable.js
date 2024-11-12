/**
 * @param {import('@/types').LR1Automaton} automaton
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 * @param {string[]} t
 */
export function clrTable(automaton, rules, nt, t) {
	const alphabet = [...t, ...nt];
	/**@type {Map<number,Map<string, string>>} */
	let table = new Map();
	for (let state of automaton.states) {
		table.set(state.index, new Map(alphabet.map((x) => [x, ''])));
	}
	for (let s of automaton.states) {
		for (let i of s.items) {
			if (i.pos === rules[i.ruleIndex].right.length || rules[i.ruleIndex].right[0] === '') {
				if (i.ruleIndex === 0) {
					table.get(s.index)?.set('$', 'a');
					continue;
				}
				for (let symbol of i.lookahead) {
					table.get(s.index)?.set(symbol, `r${i.ruleIndex}`);
				}
				continue;
			}
			let transition = automaton.transitions.get(s.index)?.get(rules[i.ruleIndex].right[i.pos]);

			if (nt.includes(rules[i.ruleIndex].right[i.pos])) {
				table.get(s.index)?.set(`${rules[i.ruleIndex].right[i.pos]}`, `g${transition}`);
			} else {
				table.get(s.index)?.set(`${rules[i.ruleIndex].right[i.pos]}`, `s${transition}`);
			}
		}
	}
	return table;
}
