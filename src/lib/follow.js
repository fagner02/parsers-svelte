import { colors } from './selectSymbol';

export const id = 'follow';

export const elemIds = {
	first: `${id}-first`,
	follow: `${id}-follow`,
	join: `${id}-join`,
	grammar: `${id}-grammar`,
	joinStack: `${id}-joinStack`
};

/**@type {any} */
export let functionCalls = [];
/**@type {{
 * follow: Map<string, Set<string>>,
 * join: Map<string, Set<string>>,
 * joinStack: string[],
 * grammarSelect: string,
 * functionCall: number}[]} */
export let saves = [];
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
	/**@type {Map<string, number>} */
	let joinIndexes = new Map();
	/**@type {Map<string, number>} */
	let followIndexes = new Map();

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		follow: structuredClone(followSet),
		join: structuredClone(joinSet),
		joinStack: [],
		grammarSelect: '',
		functionCall: functionCalls.length - 1
	});
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[0]] });
	functionCalls.push({
		trace: Error().stack,
		name: 'highlightLines',
		args: [[1]]
	});

	followSet.set(rules[0].left, new Set(['$']));
	followIndexes.set(rules[0].left, 0);
	functionCalls.push({
		trace: Error().stack,
		name: 'addSetRowFollow',
		args: [rules[0].left, `${elemIds.grammar}gl0`]
	});
	functionCalls.push({
		trace: Error().stack,
		name: 'highlightLines',
		args: [[2]]
	});
	functionCalls.push({
		trace: Error().stack,
		name: 'joinSetsFollow',
		args: [['$'], rules[0].left]
	});

	for (let i = 0; i < rules.length; i++) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
		functionCalls.push({
			trace: Error().stack,
			name: 'selectGrammar',
			args: [`${elemIds.grammar}gset${i}`]
		});

		for (let j = 0; j < rules[i].right.length; j++) {
			const symbol = rules[i].right[j];
			let followingSymbolIndex = j + 1;
			let followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[5]]
			});
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[6]]
			});
			if (!nt.includes(symbol)) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[7]] });
				functionCalls.push({
					trace: Error().stack,
					name: 'selectRSymbol',
					args: [`${elemIds.grammar}g`, i, j, colors.green, id, false]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addPause',
					args: [id]
				});
				saves.push({
					follow: structuredClone(followSet),
					join: structuredClone(joinSet),
					joinStack: [],
					grammarSelect: `${elemIds.grammar}gset${i}`,
					functionCall: functionCalls.length - 1
				});
				continue;
			}
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[8]]
			});
			functionCalls.push({
				trace: Error().stack,
				name: 'selectRSymbol',
				args: [`${elemIds.grammar}g`, i, j, colors.blue, id, false]
			});
			if (!followSet.has(symbol)) {
				followSet.set(symbol, new Set());
				followIndexes.set(symbol, followSet.size - 1);
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightLines',
					args: [[9]]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addSetRowFollow',
					args: [symbol, `${elemIds.grammar}gr${i}-${j}`]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addPause',
					args: [id]
				});
				saves.push({
					follow: structuredClone(followSet),
					join: structuredClone(joinSet),
					joinStack: [],
					grammarSelect: `${elemIds.grammar}gset${i}`,
					functionCall: functionCalls.length - 1
				});
			}

			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[10]]
			});
			let pos = 1;
			while (true) {
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightLines',
					args: [[11]]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightLines',
					args: [[12]]
				});

				if (!followingSymbol) {
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[13]]
					});

					if (!joinSet.has(symbol)) {
						joinSet.set(symbol, new Set());
						joinIndexes.set(symbol, joinSet.size - 1);
						functionCalls.push({
							trace: Error().stack,
							name: 'highlightLines',
							args: [[14]]
						});
						functionCalls.push({
							trace: Error().stack,
							name: 'addSetRowJoin',
							args: [symbol, `${elemIds.grammar}gr${i}-${j}`]
						});
						functionCalls.push({
							trace: Error().stack,
							name: 'addPause',
							args: [id]
						});
						saves.push({
							follow: structuredClone(followSet),
							join: structuredClone(joinSet),
							joinStack: [],
							grammarSelect: `${elemIds.grammar}gset${i}`,
							functionCall: functionCalls.length - 1
						});
					}
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[15]]
					});
					if (rules[i].left !== symbol) {
						joinSet.get(symbol)?.add(rules[i].left);
						functionCalls.push({
							trace: Error().stack,
							name: 'highlightLines',
							args: [[16]]
						});
						functionCalls.push({
							trace: Error().stack,
							name: 'joinSetsJoin',
							args: [[rules[i].left], symbol, `${elemIds.grammar}gl${i}`]
						});
						functionCalls.push({
							trace: Error().stack,
							name: 'addPause',
							args: [id]
						});
						saves.push({
							follow: structuredClone(followSet),
							join: structuredClone(joinSet),
							joinStack: [],
							grammarSelect: `${elemIds.grammar}gset${i}`,
							functionCall: functionCalls.length - 1
						});
					}
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[17]]
					});
					break;
				}
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightLines',
					args: [[18]]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'selectRSymbol',
					args: [`${elemIds.grammar}g`, i, j + 1, colors.orange, id, false]
				});

				if (nt.includes(followingSymbol)) {
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[19]]
					});
					let empty = false;
					for (const [left, right] of firstSet) {
						functionCalls.push({
							trace: Error().stack,
							name: 'highlightLines',
							args: [[20]]
						});
						functionCalls.push({
							trace: Error().stack,
							name: 'highlightLines',
							args: [[21]]
						});
						if (rules[left].left === followingSymbol) {
							functionCalls.push({
								trace: Error().stack,
								name: 'highlightLines',
								args: [[22]]
							});
							if (right.has('')) {
								functionCalls.push({
									trace: Error().stack,
									name: 'highlightLines',
									args: [[23]]
								});
								functionCalls.push({
									trace: Error().stack,
									name: 'highlightLines',
									args: [[24]]
								});
								empty = true;
								continue;
							}
							functionCalls.push({
								trace: Error().stack,
								name: 'highlightLines',
								args: [[25]]
							});
							functionCalls.push({
								trace: Error().stack,
								name: 'highlightLines',
								args: [[26]]
							});
							let union = new Set(/**@type {Set<string>}*/ followSet.get(symbol));
							for (let item of right) {
								union.add(item);
							}

							followSet.set(symbol, union);
							followIndexes.set(symbol, followSet.size - 1);
							functionCalls.push({
								trace: Error().stack,
								name: 'joinSetsFollow',
								args: [[...right], rules[left].left, `${elemIds.first}l${left}`]
							});
							functionCalls.push({
								trace: Error().stack,
								name: 'addPause',
								args: [id]
							});
							saves.push({
								follow: structuredClone(followSet),
								join: structuredClone(joinSet),
								joinStack: [],
								grammarSelect: `${elemIds.grammar}gset${i}`,
								functionCall: functionCalls.length - 1
							});
						}
					}
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[27]]
					});
					if (!empty) {
						functionCalls.push({
							trace: Error().stack,
							name: 'highlightLines',
							args: [[28]]
						});
						break;
					}
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[29]]
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[30]]
					});
					followingSymbolIndex = j + 1 + pos;
					followingSymbol =
						j + 1 + pos == rules[i].right.length ? null : rules[i].right[j + 1 + pos];
					pos++;
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[31]]
					});
				} else {
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[31]]
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[32]]
					});
					followSet.get(symbol)?.add(followingSymbol);
					functionCalls.push({
						trace: Error().stack,
						name: 'joinSetsFollow',
						args: [[followingSymbol], symbol, `${elemIds.grammar}gr${i}-${followingSymbolIndex}`]
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'addPause',
						args: [id]
					});
					saves.push({
						follow: structuredClone(followSet),
						join: structuredClone(joinSet),
						joinStack: [],
						grammarSelect: `${elemIds.grammar}gset${i}`,
						functionCall: functionCalls.length - 1
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightLines',
						args: [[33]]
					});
					break;
				}
			}
			functionCalls.push({
				trace: Error().stack,
				name: 'selectRSymbol',
				args: [`${elemIds.grammar}g`, i, j, colors.green, id, false]
			});
		}
	}
	functionCalls.push({
		trace: Error().stack,
		name: 'hideSelectGrammar',
		args: []
	});

	let addedToStack = [];
	for (const item of joinSet.keys()) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[34]] });
		functionCalls.push({
			trace: Error().stack,
			name: 'highlightLines',
			args: [[35]]
		});
		if (joinSet.get(item)?.size === 0) {
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[36]]
			});
			continue;
		}
		functionCalls.push({
			trace: Error().stack,
			name: 'highlightLines',
			args: [[37]]
		});
		functionCalls.push({
			trace: Error().stack,
			name: 'highlightLines',
			args: [[38]]
		});
		/** @type {Array<string>} */
		let joinStack = [item];
		addedToStack.push(item);
		functionCalls.push({
			trace: Error().stack,
			name: 'addToStack',
			args: [item, item, '', `${elemIds.join}l${joinIndexes.get(item)}`]
		});
		functionCalls.push({
			trace: Error().stack,
			name: 'addPause',
			args: [id]
		});
		saves.push({
			follow: structuredClone(followSet),
			join: structuredClone(joinSet),
			joinStack: structuredClone(joinStack),
			grammarSelect: '',
			functionCall: functionCalls.length - 1
		});

		while (joinStack.length > 0) {
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[39]]
			});
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[40]]
			});
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[41]]
			});
			const topKey = joinStack[joinStack.length - 1];
			const top = /**@type {Set<string>}*/ (joinSet.get(topKey));
			const topValue = /**@type {string}*/ (top?.values().next().value);

			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[42]]
			});
			let nextSet = joinSet.get(topValue);
			if (nextSet !== undefined && !(nextSet.size === 0) && !addedToStack.includes(item)) {
				joinStack.push(topValue);
				addedToStack.push(item);
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightLines',
					args: [[43]]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addToStack',
					args: [topValue, topValue, '', `${elemIds.join}l${joinIndexes.get(topValue)}`]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addPause',
					args: [id]
				});
				saves.push({
					follow: structuredClone(followSet),
					join: structuredClone(joinSet),
					joinStack: structuredClone(joinStack),
					grammarSelect: '',
					functionCall: functionCalls.length - 1
				});

				functionCalls.push({
					trace: Error().stack,
					name: 'highlightLines',
					args: [[44]]
				});
				continue;
			}
			functionCalls.push({
				trace: Error().stack,
				name: 'selectRSymbol',
				args: [elemIds.join, joinIndexes.get(topKey), 0, colors.green, id]
			});
			const _followSet = followSet.get(topKey);
			const setToJoin = /**@type {Set<String>}*/ (followSet.get(topValue));
			for (let item of setToJoin) {
				_followSet?.add(item);
			}
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[45]]
			});
			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[46]]
			});
			functionCalls.push({
				trace: Error().stack,
				name: 'joinSetsFollow',
				args: [[...setToJoin], topKey, `${elemIds.follow}gl${followIndexes.get(topKey)}`]
			});
			functionCalls.push({
				trace: Error().stack,
				name: 'addPause',
				args: [id]
			});
			saves.push({
				follow: structuredClone(followSet),
				join: structuredClone(joinSet),
				joinStack: structuredClone(joinStack),
				grammarSelect: '',
				functionCall: functionCalls.length - 1
			});

			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[47]]
			});
			top.delete(topValue);
			functionCalls.push({
				trace: Error().stack,
				name: 'removeSet',
				args: [topKey, topValue]
			});

			functionCalls.push({
				trace: Error().stack,
				name: 'highlightLines',
				args: [[48]]
			});
			if (top.size === 0) {
				joinStack.pop();
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightLines',
					args: [[49]]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'removeFromStack',
					args: [joinStack.length]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addPause',
					args: [id]
				});
				saves.push({
					follow: structuredClone(followSet),
					join: structuredClone(joinSet),
					joinStack: structuredClone(joinStack),
					grammarSelect: '',
					functionCall: functionCalls.length - 1
				});
			}
		}
	}

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		follow: structuredClone(followSet),
		join: structuredClone(joinSet),
		joinStack: [],
		grammarSelect: '',
		functionCall: functionCalls.length - 1
	});

	return { followSet, id };
}

/**
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 * @param {Map<number, Set<string>>} firstSet
 */
export function followDataOnly(rules, nt, firstSet) {
	/** @type {Map<string, Set<string>>}*/
	let followSet = new Map();
	/** @type {Map<string, Set<string>>}*/
	let joinSet = new Map();
	/**@type {Map<string, number>} */
	let joinIndexes = new Map();
	/**@type {Map<string, number>} */
	let followIndexes = new Map();

	followSet.set(rules[0].left, new Set(['$']));
	followIndexes.set(rules[0].left, 0);

	for (let i = 0; i < rules.length; i++) {
		for (let j = 0; j < rules[i].right.length; j++) {
			const symbol = rules[i].right[j];
			let followingSymbolIndex = j + 1;
			let followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

			if (!nt.includes(symbol)) {
				continue;
			}

			if (!followSet.has(symbol)) {
				followSet.set(symbol, new Set());
				followIndexes.set(symbol, followSet.size - 1);
			}

			let pos = 1;
			while (true) {
				if (!followingSymbol) {
					if (!joinSet.has(symbol)) {
						joinSet.set(symbol, new Set());
						joinIndexes.set(symbol, joinSet.size - 1);
					}

					if (rules[i].left !== symbol) {
						joinSet.get(symbol)?.add(rules[i].left);
					}
					break;
				}

				if (nt.includes(followingSymbol)) {
					let empty = false;
					for (const [left, right] of firstSet) {
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
							followIndexes.set(symbol, followSet.size - 1);
						}
					}

					if (!empty) {
						break;
					}

					followingSymbolIndex = j + 1 + pos;
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

	let addedToStack = [];
	for (const item of joinSet.keys()) {
		if (joinSet.get(item)?.size === 0) {
			continue;
		}
		/** @type {Array<string>} */
		let joinStack = [item];
		addedToStack.push(item);

		while (joinStack.length > 0) {
			const topKey = joinStack[joinStack.length - 1];
			const top = /**@type {Set<string>}*/ (joinSet.get(topKey));
			const topValue = /**@type {string}*/ (top?.values().next().value);

			let nextSet = joinSet.get(topValue);
			if (nextSet !== undefined && !(nextSet.size === 0) && !addedToStack.includes(item)) {
				joinStack.push(topValue);
				addedToStack.push(item);
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
	return { followSet, id };
}
