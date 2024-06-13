function nullable(
	/** @type {Array<import('@/types').GrammarItem>} */ rules,
	/**@type {string} symbol*/ symbol
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
	/**@type {string[]} */ nt
) {
	/** @type {Array<number>} */
	let symbolStack = [];
	/** @type {Map<number, Set<string>>} */
	let firstSet = new Map();
	for (let i = 0; i < rules.length; i++) {
		symbolStack.push(i);
	}

	while (symbolStack.length > 0) {
		if (!firstSet.has(symbolStack[symbolStack.length - 1])) {
			firstSet.set(symbolStack[symbolStack.length - 1], new Set());
		}

		let symbol = rules[symbolStack[symbolStack.length - 1]].right[0];

		if (nt.includes(symbol)) {
			const matchingRules = rules.filter((x) => x.left === symbol);

			let complete = true;
			for (let rule of matchingRules) {
				const firstToJoin = firstSet.get(rule.index);
				if (firstToJoin !== undefined) {
					for (let item of firstToJoin) {
						if (item === '') {
							let isNullable = true;
							for (let s of rules[/**@type {number}*/ (symbolStack.at(-1))].right) {
								if (!nullable(rules, s)) {
									isNullable = false;
									break;
								}
							}
							if (isNullable) {
								firstSet.get(symbolStack[symbolStack.length - 1])?.add('');
							}
						} else {
							firstSet.get(symbolStack[symbolStack.length - 1])?.add(item);
						}
					}
				} else {
					for (let i1 = 0; i1 < rules.length; i1++) {
						if (rules[i1].left === symbol) {
							symbolStack.push(i1);
						}
					}
					complete = false;
				}
			}
			if (complete) {
				symbolStack.pop();
			}
		} else {
			let index = symbolStack[symbolStack.length - 1];

			while (firstSet.has(index)) {
				firstSet.get(index)?.add(symbol);

				symbolStack.pop();
				if (symbol === '') break;
				index = symbolStack[symbolStack.length - 1];
			}
		}
	}
	return firstSet;
}
