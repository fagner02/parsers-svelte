/**
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 * @param {Map<number, Set<string>>} firstSet
 */
export function follow(rules, nt, firstSet) {
	/** @type {Map<string, Set<string>>}*/
	let followSet = new Map();
	/** @type {Map<string, Set<string>>}*/
	let joinSet = new Map();

	followSet.set(rules[0].left, new Set(['$']));

	for (let i = 0; i < rules.length; i++) {
		for (let j = 0; j < rules[i].right.length; j++) {
			const symbol = rules[i].right[j];
			let followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

			if (!nt.includes(symbol)) {
				continue;
			}
			if (!followSet.has(symbol)) {
				followSet.set(symbol, new Set());
			}
			let pos = 1;
			while (true) {
				if (followingSymbol === null) {
					if (!joinSet.has(symbol)) {
						joinSet.set(symbol, new Set());
					}
					if (symbol !== rules[i].left) {
						joinSet.get(symbol)?.add(rules[i].left);
					}
					break;
				}
				if (nt.includes(followingSymbol)) {
					let empty = false;
					for (let [left, right] of firstSet) {
						if (rules[left].left === followingSymbol) {
							if (right.has('')) {
								empty = true;
								continue;
							}
							let union = new Set(/**@type {Set<string>}*/ followSet.get(symbol));
							for (let item of right) {
								union.add(item);
							}

							followSet.set(symbol, union);
						}
					}

					if (!empty) {
						break;
					}
					followingSymbol =
						j + 1 + pos == rules[i].right.length ? null : rules[i].right[j + 1 + pos];
					pos++;
				} else {
					followSet.get(symbol)?.add(followingSymbol);
					break;
				}
			}
		}
	}

	for (let item of joinSet.keys()) {
		if (joinSet.get(item)?.size === 0) {
			continue;
		}
		/** @type {Array<string>} */
		let joinStack = [item];

		while (joinStack.length > 0) {
			const topKey = joinStack[joinStack.length - 1];
			const top = /**@type {Set<string>}*/ (joinSet.get(topKey));
			const topValue = /**@type {string}*/ (top?.values().next().value);

			let nextSet = joinSet.get(topValue);
			if (nextSet !== undefined && !(nextSet.size === 0)) {
				joinStack.push(topValue);
				continue;
			}
			const _followSet = followSet.get(topKey);
			const setToJoin = /**@type {Set<String>}*/ (followSet.get(topValue));
			for (let item of setToJoin) {
				_followSet?.add(item);
			}

			top.delete(topValue);

			if (top.size === 0) {
				joinStack.pop();
			}
		}
	}

	return followSet;
}
