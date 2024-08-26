// function nullable(
// 	/** @type {Array<import('@/types').GrammarItem>} */ rules,
// 	/** @type {string}*/ symbol
// ) {
// 	/** =========== FIX IT ===============================================*/
// 	const matchingRules = rules.filter((x) => x.left === symbol);
// 	for (let rule of matchingRules) {
// 		if (rule.right[0] === '') {
// 			return true;
// 		}
// 	}
// 	return false;
// 	/** =========== FIX IT ===============================================*/
// }

export function first(
	/** @type {Array<import('@/types').GrammarItem>} */ rules,
	/** @type {string[]} */ nt
) {
	/** @type {Map<number, Set<string>>} */
	let firstSet = new Map();
	/** @type {Map<number, Set<string>>}*/
	let joinSet = new Map();
	/** @type {Map<string, boolean>}*/
	let nullable = new Map();

	for (let i = 0; i < rules.length; i++) {
		if (rules[i].right[0] == '') {
			nullable.set(rules[i].left, true);
		} else {
			nullable.set(rules[i].left, nullable.get(rules[i].left) ?? false);
		}
	}

	let changed = false;
	while (changed) {
		for (let j = 0; j < rules.length; j++) {
			if (nullable.get(rules[j].left)) continue;
			let isnull = true;
			for (let k = 0; k < rules[j].right.length; k++) {
				if (!nullable.get(rules[j].right[k])) {
					isnull = false;
					break;
				}
			}
			if (isnull) {
				changed = true;
				nullable.set(rules[j].left, true);
			}
		}
	}

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
			if (!(nullable.get(symbol) ?? false)) break;
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
