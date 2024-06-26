function nullable(
	/** @type {Array<import('@/types').GrammarItem>} */ rules,
	/** @type {string}*/ symbol
) {
	const matchingRules = rules.filter((x) => x.left === symbol);
	for (let rule of matchingRules) {
		if (rule.right[0] === '') {
			return true;
		}
	}
	return false;
}

export function first(
	/** @type {Array<import('@/types').GrammarItem>} */ rules,
	/** @type {string[]} */ nt
) {
	/** @type {Map<number, Set<string>>} */
	let firstSet = new Map();
	/** @type {Map<number, Set<string>>}*/
	let joinSet = new Map();

	for (let i = 0; i < rules.length; i++) {
		firstSet.set(i, new Set());

		for (let j = 0; j < rules[i].right.length; j++) {
			let symbol = rules[i].right[j];
			if (nt.includes(symbol)) {
				if (!joinSet.has(i)) {
					joinSet.set(i, new Set());
				}
				joinSet.get(i)?.add(symbol);
			} else {
				firstSet.get(i)?.add(symbol);
			}
			if (!nullable(rules, symbol)) break;
		}
	}

	for (let item of joinSet.keys()) {
		/** @type {Array<number>} */
		let joinStack = [item];

		while (joinStack.length > 0) {
			const topKey = joinStack[joinStack.length - 1];
			const top = /**@type {Set<string>}*/ (joinSet.get(topKey));
			const topValue = top?.values().next().value;

			if (joinSet.has(topValue) && !joinStack.includes(topValue)) {
				joinStack.push(topValue);
				continue;
			}
			const _firstSet = firstSet.get(topKey);
			const matchingRules = rules.filter((x) => x.left === topValue);
			for (let rule of matchingRules) {
				const setToJoin = /**@type {Set<String>}*/ (firstSet.get(rule.index));
				for (let item of setToJoin) {
					_firstSet?.add(item);
				}
			}

			top.delete(topValue);

			if (top.size === 0) {
				joinStack.pop();
			}
		}
	}
	return firstSet;
}
