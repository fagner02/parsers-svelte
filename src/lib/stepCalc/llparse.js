import { colors } from '$lib/selectSymbol';
import { nt, rules } from '$lib/utils';

export const id = 'llparse';
export const elemIds = {
	grammar: `${id}-grammar`,
	input: `${id}-input`,
	states: `${id}-states`,
	table: `${id}-table`
};
/** @type {import("@/types").Command<ReturnType<typeof import("@/Algorithms/LLParse.svelte").default>['obj']>[]} */
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
 * @param {Map<string, Map<string, number>>} table
 * @returns {string}
 */
export function llParsing(startingSymbol, inputString, table) {
	functionCalls = [];
	saves = [];
	/** @type {typeof saves[0]['tree']} */
	let tree = [];

	let parseSteps = [];
	parseSteps.push('Step | Symbol Stack | Input Stack | Action');
	parseSteps.push('-----|--------------|-------------|-------');

	let stepCount = 0;

	/**
	 * @param {any[]} symbolStack
	 * @param {any[]} inputStack
	 * @param {string} action
	 */
	function addStep(symbolStack, inputStack, action) {
		stepCount++;
		const symbolStr = symbolStack.join(' ');
		const inputStr = inputStack.join(' ');
		parseSteps.push(
			`${stepCount.toString().padStart(4)} | ${symbolStr.padEnd(12)} | ${inputStr.padEnd(11)} | ${action}`
		);
	}

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

	addStep(symbolStack, ['$', ...inputString.toReversed()], 'Initialize');

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
				addStep(
					symbolStack,
					inputStack,
					`ERROR: No production for ${topSymbol} with input ${topInput}`
				);
				functionCalls.push({ name: 'setAccept', args: [false] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					symbolStack: structuredClone(symbolStack),
					inputStack: structuredClone(inputStack),
					functionCall: functionCalls.length - 1,
					accept: false,
					tree: structuredClone(tree)
				});
				return parseSteps.join('\n');
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
				addStep(
					symbolStack,
					inputStack,
					`REDUCE: ${topSymbol} → ${rules[production].right.join(' ')}`
				);
			} else {
				functionCalls.push({
					name: 'addToTree',
					args: [['\u03B5'], topSymbol],
					skip: true
				});
				addStep(symbolStack, inputStack, `REDUCE: ${topSymbol} → ε`);
				tree.push({ data: ['\u03B5'], parentData: topSymbol });
			}
			if (last.input === newLast.input && last.symbol === newLast.symbol) {
				functionCalls.push({
					name: 'showTooltip',
					args: [
						`input-${id}`,
						'A entrada processada gera um loop infinito. Provavelmente a gramática dada não é LL.',
						colors.red,
						1
					]
				});
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

				return parseSteps.join('\n');
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
				addStep(
					symbolStack,
					inputStack,
					`ERROR: Symbol '${topSymbol}' doesn't match input '${topInput}'`
				);
				functionCalls.push({ name: 'setAccept', args: [false] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					symbolStack: structuredClone(symbolStack),
					inputStack: structuredClone(inputStack),
					functionCall: functionCalls.length - 1,
					accept: false,
					tree: structuredClone(tree)
				});

				return parseSteps.join('\n');
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
			addStep(
				symbolStack,
				inputStack,
				`MATCH: Popped '${topSymbol}' and matched input '${topInput}'`
			);
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
	const accept = symbolStack.length === 0 && inputStack.length === 0;
	functionCalls.push({
		name: 'setAccept',
		args: [accept]
	});
	functionCalls.push({
		name: 'addPause',
		args: [id]
	});
	saves.push({
		symbolStack: structuredClone(symbolStack),
		inputStack: structuredClone(inputStack),
		functionCall: functionCalls.length - 1,
		accept: accept,
		tree: structuredClone(tree)
	});

	if (accept) {
		addStep(symbolStack, inputStack, 'ACCEPT: Parsing completed successfully');
	} else {
		addStep(symbolStack, inputStack, 'REJECT: Parsing failed');
	}

	return parseSteps.join('\n');
}
