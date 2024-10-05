export function lltable(
	/** @type {Array<import('@/types').GrammarItem>} */ rules,
	/** @type {string[]} */ nt,
	/** @type {string[]} */ t,
	/** @type {Map<number, Set<string>>} */ firstSet,
	/** @type {Map<string, Set<string>>}*/ followSet
) {
	/**@type {Map<string, Map<string, number>>} */
	let table = new Map();

	for (let item of nt) {
		table.set(item, new Map(t.map((x) => [x, -1])));
	}
	for (let [left, right] of firstSet) {
		if (right.has('')) {
			const follow = /**@type {Set<string>}*/ (followSet.get(rules[left].left));
			for (let followItem of follow) {
				table.get(rules[left].left)?.set(followItem, left);
				console.log(rules[left].left, followItem, left);
			}
		}
		for (let rightItem of right) {
			if (rightItem !== '') {
				table.get(rules[left].left)?.set(rightItem, left);
				console.log('right:', rules[left].left, rightItem, left);
			}
		}
	}

	return table;
}
