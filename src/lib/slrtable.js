/**
 * @param {import('@/types').LR0Automaton} automaton
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 * @param {Map<string, Set<string>>} followSet
 */
export function slrTable(automaton, rules, nt, followSet) {
	/**@type {Map<number,Map<string, string>>} */
	let table = new Map();
	for (let state of automaton.states) {
		table.set(state.index, new Map());
	}
	for (let s of automaton.states) {
		for (let i of s.items) {
			if (i.pos === rules[i.ruleIndex].right.length || rules[i.ruleIndex].right[0] === '') {
				let follow = followSet.get(rules[i.ruleIndex].left);
				if (!follow) continue;
				for (let symbol of follow) table.get(s.index)?.set(symbol, `r${i.ruleIndex}`);
				continue;
			}
			let transition = automaton.transitions.get(s.index)?.get(rules[i.ruleIndex].right[i.pos]);

			if (nt.includes(rules[i.ruleIndex].right[i.pos])) {
				table.get(s.index)?.set(rules[i.ruleIndex].right[i.pos], `g${transition}`);
			} else {
				table.get(s.index)?.set(rules[i.ruleIndex].right[i.pos], `s${transition}`);
			}
		}
	}
	return table;
}
