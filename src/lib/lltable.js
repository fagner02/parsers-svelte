export function lltable(
	/** @type {Array<import('@/types').GrammarItem>} */ rules,
	/**@type {string[]} */ nt,
	/**@type {string[]} */ t,
	/** @type {Map<number, Set<string>>} */ firstSet,
	/** @type {Map<string, Set<string>>}*/ followSet
) {
	/**@type {Map<string, Map<string, number>>} */
	let table = new Map();

	for (let item of nt) {
		table.set(item, new Map(t.map((x) => [x, -1])));
	}
	for (let [left, right] of firstSet) {
		for (let rightItem of right) {
			if (right.has('')) {
				const follow = /**@type {Set<string>}*/ (followSet.get(rules[left].left));
				for (let followItem of follow) {
					table.get(rules[left].left)?.set(followItem, left);
				}
				continue;
			}
			table.get(rules[left].left)?.set(rightItem, left);
		}
	}

	return table;
}
