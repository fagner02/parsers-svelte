export const id = 'llparse';
export const elemIds = {
	grammar: `${id}-grammar`,
	input: `${id}-input`,
	states: `${id}-states`,
	table: `${id}-table`
};
/**@type {any} */
export let functionCalls = [];
/**
 * @type {{
 * symbolStack: string[],
 * inputStack: string[],
 * functionCall: number,
 * accept?: boolean,
 * tree: {data: string[], parentData: string}[]}[]}
 * */
export let saves = [];

/**
 * @param {string} startingSymbol
 * @param {string[]} inputString
 * @param {string | any[]} nt
 * @param {Map<string, Map<string, number>>} table
 * @param {import('@/types').GrammarItem[]} rules
 */
export function llParsing(startingSymbol, inputString, nt, table, rules) {
	functionCalls = [];
	saves = [];
	/** @type {typeof saves[0]['tree']} */
	let tree = [];
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		symbolStack: [],
		inputStack: [],
		functionCall: functionCalls.length - 1,
		tree: []
	});
	functionCalls.push({ name: 'highlightLines', args: [[0]] });
	functionCalls.push({ name: 'resetTree', args: [] });
	functionCalls.push({ name: 'initializeTree', args: [startingSymbol] });
	functionCalls.push({ name: 'highlightLines', args: [[1]] });
	const symbolStack = ['$', startingSymbol];
	for (const i of symbolStack)
		functionCalls.push({
			name: 'addToStackSymbols',
			args: [i, i, '']
		});

	functionCalls.push({ name: 'highlightLines', args: [[2]] });
	const inputStack = ['$', ...inputString.toReversed()];
	for (const i of inputStack)
		functionCalls.push({
			name: 'addToStackInput',
			args: [i, i, '']
		});

	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		symbolStack: structuredClone(symbolStack),
		inputStack: structuredClone(inputStack),
		functionCall: functionCalls.length - 1,
		tree: structuredClone(tree)
	});

	functionCalls.push({ name: 'highlightLines', args: [[3]] });
	let last = { input: '', symbol: '' };
	while (inputStack.length > 0) {
		functionCalls.push({ name: 'highlightLines', args: [[4]] });
		functionCalls.push({ name: 'highlightLines', args: [[5]] });
		const topSymbol = symbolStack[symbolStack.length - 1];
		const topInput = inputStack[inputStack.length - 1];

		functionCalls.push({ name: 'highlightLines', args: [[6]] });
		if (nt.includes(topSymbol)) {
			functionCalls.push({ name: 'highlightLines', args: [[7]] });
			const production = table.get(topSymbol)?.get(topInput);
			let newLast = { input: topInput, symbol: topSymbol };
			if (production === undefined || production === -1) {
				functionCalls.push({ name: 'highlightLines', args: [[9]] });
				functionCalls.push({ name: 'setAccept', args: [false] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					symbolStack: structuredClone(symbolStack),
					inputStack: structuredClone(inputStack),
					functionCall: functionCalls.length - 1,
					accept: false,
					tree: structuredClone(tree)
				});
				return false;
			}

			functionCalls.push({
				name: 'highlightLines',
				args: [[10]]
			});
			symbolStack.pop();
			functionCalls.push({
				name: 'removeFromStackSymbols',
				args: [symbolStack.length]
			});
			functionCalls.push({
				name: 'highlightLines',
				args: [[11]]
			});
			if (!rules[production].right.includes('')) {
				functionCalls.push({
					name: 'highlightLines',
					args: [[12]]
				});
				const prod = rules[production].right.toReversed();
				symbolStack.push(...prod);
				functionCalls.push({
					name: 'addToTree',
					args: [prod, topSymbol],
					skip: true
				});
				tree.push({ data: prod, parentData: topSymbol });
				for (const i of prod) {
					functionCalls.push({
						name: 'addToStackSymbols',
						args: [i, i, '']
					});
				}
			} else {
				functionCalls.push({
					name: 'addToTree',
					args: [['\u03B5'], topSymbol],
					skip: true
				});

				tree.push({ data: ['\u03B5'], parentData: topSymbol });
			}
			if (last.input === newLast.input && last.symbol === newLast.symbol) {
				functionCalls.push({
					name: 'setAccept',
					args: [false]
				});
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					symbolStack: structuredClone(symbolStack),
					inputStack: structuredClone(inputStack),
					functionCall: functionCalls.length - 1,
					accept: false,
					tree: structuredClone(tree)
				});
				return false;
			}
			last = newLast;
		} else {
			functionCalls.push({
				name: 'highlightLines',
				args: [[13]]
			});
			functionCalls.push({
				name: 'highlightLines',
				args: [[14]]
			});
			if (topSymbol !== topInput) {
				functionCalls.push({ name: 'highlightLines', args: [[15]] });
				functionCalls.push({ name: 'setAccept', args: [false] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					symbolStack: structuredClone(symbolStack),
					inputStack: structuredClone(inputStack),
					functionCall: functionCalls.length - 1,
					accept: false,
					tree: structuredClone(tree)
				});

				return false;
			}
			functionCalls.push({
				name: 'highlightLines',
				args: [[16]]
			});
			functionCalls.push({
				name: 'removeFromStackInput',
				args: [inputStack.length]
			});
			symbolStack.pop();
			functionCalls.push({
				name: 'highlightLines',
				args: [[17]]
			});
			functionCalls.push({
				name: 'removeFromStackSymbols',
				args: [symbolStack.length]
			});
			inputStack.pop();
		}

		functionCalls.push({
			name: 'addPause',
			args: [id]
		});
		saves.push({
			symbolStack: structuredClone(symbolStack),
			inputStack: structuredClone(inputStack),
			functionCall: functionCalls.length - 1,
			tree: structuredClone(tree)
		});
	}
	functionCalls.push({
		name: 'highlightLines',
		args: [[18]]
	});
	functionCalls.push({
		name: 'setAccept',
		args: [symbolStack.length === 0 && inputStack.length === 0]
	});
	functionCalls.push({
		name: 'addPause',
		args: [id]
	});
	saves.push({
		symbolStack: structuredClone(symbolStack),
		inputStack: structuredClone(inputStack),
		functionCall: functionCalls.length - 1,
		accept: symbolStack.length === 0 && inputStack.length === 0,
		tree: structuredClone(tree)
	});
	return symbolStack.length === 0 && inputStack.length === 0;
}
