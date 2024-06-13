export function follow(
	/** @type {Array<import('@/types').GrammarItem>} */ rules,
	/**@type {string[]} */ nt,
	/** @type {Map<number, Set<string>>} */ firstSet
) {
	/** @type {Map<string, Set<string>>}*/
	let followSet = new Map();
	/** @type {Map<string, Set<string>>}*/
	let joinSet = new Map();
	/** @type {Array<string>} */
	let joinStack = [];

	followSet.set(rules[0].left, new Set(['$']));

	for (let i = 0; i < rules.length; i++) {
		for (let j = 0; j < rules[i].right.length; j++) {
			const symbol = rules[i].right[j];
			const followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

			if (nt.includes(symbol)) {
				if (!followSet.has(symbol)) {
					followSet.set(symbol, new Set());
				}
				if (followingSymbol === null) {
					if (!joinSet.has(symbol)) {
						joinSet.set(symbol, new Set());
					}
					joinSet.get(symbol)?.add(rules[i].left);
				} else {
					if (nt.includes(followingSymbol)) {
						let empty = false;
						for (let [left, right] of firstSet) {
							if (rules[left].left === followingSymbol) {
								if (right.has('')) {
									empty = true;
									continue;
								}
								for (let rsymbol of right) {
									followSet.get(symbol)?.add(rsymbol);
								}
							}
						}

						if (empty) {
							if (!joinSet.has(symbol)) {
								joinSet.set(symbol, new Set());
							}
							joinSet.get(symbol)?.add(rules[i].right[j]);
						}
					} else {
						if (followSet.has(symbol)) {
							followSet.set(symbol, new Set());
						}

						followSet.get(symbol)?.add(followingSymbol);
					}
				}
			}
		}
	}
	for (let item of joinSet.keys()) {
		joinStack.push(item);
	}

	while (joinStack.length > 0) {
		const topKey = joinStack[joinStack.length - 1];
		const top = /**@type {Set<string>}*/ (joinSet.get(topKey));

		const topValue = top?.values().next().value;
		if (joinSet.has(topValue)) {
			joinStack.push(topValue);
			continue;
		}
		const followIndex = followSet.get(topKey);
		const joinIndex = /**@type {Set<String>}*/ (followSet.get(topValue));
		for (let item of joinIndex) {
			followIndex?.add(item);
		}

		top.delete(topValue);

		if (top.size === 0) {
			joinStack.pop();
		}
	}

	return followSet;
}
