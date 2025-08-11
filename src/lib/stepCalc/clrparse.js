export const id = 'clrparsing';
export const elemIds = {
	grammar: `${id}-grammar`,
	stateStack: `${id}-stateStack`,
	table: `${id}-table`,
	inputStack: `${id}-inputStack`
};
/**@type {any} */
export let functionCalls = [];

/**
 * @type {{
 * stateStack: string[]
 * inputStack: string[]
 * accept?: boolean
 * functionCall: number
 * tree: {parent?: string, data: string[]}[]
 * }[]}
 * */
export let saves = [];

/**
 * @param {string[]} inputString
 * @param {import('@/types').GrammarItem[]} augRules
 * @param {Map<number, Map<string, string>>} table
 */
export function clrparsing(inputString, augRules, table) {
	functionCalls = [];
	saves = [];
	/**@type {typeof saves[0]['tree']}*/
	let tree = [];
	/** @type {string[]} */
	const stateStack = [];
	/** @type {string[]} */
	const inputStack = [];

	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		inputStack: structuredClone(inputStack),
		stateStack: structuredClone(stateStack),
		tree: structuredClone(tree),
		functionCall: functionCalls.length - 1
	});
	functionCalls.push({ name: 'highlightLines', args: [[1]] });
	functionCalls.push({
		name: 'addToStackState',
		args: [0, 's0', '']
	});
	stateStack.push('s0');

	['$'].concat(inputString.toReversed()).forEach((char, i) => {
		functionCalls.push({ name: 'highlightLines', args: [[2]] });
		functionCalls.push({
			name: 'addToStackInput',
			args: [char, char, '']
		});
	});
	inputStack.push('$', ...inputString.toReversed());

	let accept = false;
	while (true) {
		functionCalls.push({ name: 'highlightLines', args: [[3]] });
		functionCalls.push({ name: 'highlightLines', args: [[4]] });
		const currentState = stateStack[stateStack.length - 1];
		const lookahead = inputStack[inputStack.length - 1];

		functionCalls.push({ name: 'highlightLines', args: [[5]] });
		functionCalls.push({ name: 'highlightLines', args: [[6]] });

		functionCalls.push({ name: 'highlightLines', args: [[7]] });
		const action = table.get(parseInt(currentState.slice(1)))?.get(lookahead);

		if (!action || action === '') {
			functionCalls.push({ name: 'highlightLines', args: [[8]] });
			break;
		}

		functionCalls.push({ name: 'highlightLines', args: [[9]] });

		if (action === 'a') {
			functionCalls.push({ name: 'highlightLines', args: [[10]] });
			accept = true;
			break;
		}

		functionCalls.push({ name: 'highlightLines', args: [[11]] });

		if (action.startsWith('s')) {
			functionCalls.push({ name: 'highlightLines', args: [[12]] });
			const newState = parseInt(action.slice(1));

			functionCalls.push({
				name: 'addFloatingNode',
				args: [[lookahead]],
				skip: true
			});
			tree.push({ data: [lookahead] });
			functionCalls.push({ name: 'highlightLines', args: [[13]] });
			functionCalls.push({
				name: 'addToStackState',
				args: [lookahead, lookahead, '']
			});
			stateStack.push(lookahead);
			functionCalls.push({ name: 'highlightLines', args: [[14]] });
			functionCalls.push({
				name: 'addToStackState',
				args: [newState, `s${newState}`, '']
			});
			stateStack.push(`s${newState}`);
			functionCalls.push({ name: 'highlightLines', args: [[15]] });
			functionCalls.push({
				name: 'removeFromStackInput',
				args: [inputStack.length - 1]
			});
			inputStack.pop();
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				inputStack: structuredClone(inputStack),
				stateStack: structuredClone(stateStack),
				tree: structuredClone(tree),
				functionCall: functionCalls.length - 1
			});
		}

		functionCalls.push({ name: 'highlightLines', args: [[16]] });

		if (action.startsWith('r')) {
			functionCalls.push({ name: 'highlightLines', args: [[17]] });
			functionCalls.push({ name: 'highlightLines', args: [[18]] });
			const ruleIndex = parseInt(action.slice(1));
			const production = augRules[ruleIndex];
			/**@type {string[]} */
			let children = [];
			functionCalls.push({ name: 'highlightLines', args: [[19]] });
			if (production.right[0] !== '') {
				for (let i = 0; i < production.right.length; i++) {
					functionCalls.push({ name: 'highlightLines', args: [[20]] });
					children.push(stateStack[stateStack.length - 2]);
					functionCalls.push({ name: 'highlightLines', args: [[21]] });
					functionCalls.push({
						name: 'removeFromStackState',
						args: [stateStack.length - 1]
					});
					stateStack.pop();
					functionCalls.push({ name: 'highlightLines', args: [[22]] });
					functionCalls.push({
						name: 'removeFromStackState',
						args: [stateStack.length - 1]
					});
					stateStack.pop();
				}
			}

			children.reverse();
			functionCalls.push({
				name: 'addParent',
				args: [production.left, children],
				skip: true
			});
			tree.push({ parent: production.left, data: children });
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				inputStack: structuredClone(inputStack),
				stateStack: structuredClone(stateStack),
				tree: structuredClone(tree),
				functionCall: functionCalls.length - 1
			});
			functionCalls.push({ name: 'highlightLines', args: [[23]] });
			functionCalls.push({ name: 'highlightLines', args: [[24]] });
			const stackState = parseInt(stateStack[stateStack.length - 1].slice(1));
			const gotoState = table.get(stackState)?.get(production.left);

			functionCalls.push({ name: 'highlightLines', args: [[25]] });
			if (!gotoState || gotoState === '') {
				functionCalls.push({ name: 'highlightLines', args: [[26]] });
				break;
			}

			functionCalls.push({ name: 'highlightLines', args: [[27]] });
			functionCalls.push({
				name: 'addToStackState',
				args: [production.left, production.left, '']
			});
			stateStack.push(production.left);
			const goto = parseInt(gotoState.slice(1));
			functionCalls.push({ name: 'highlightLines', args: [[28]] });
			functionCalls.push({
				name: 'addToStackState',
				args: [goto, `s${goto}`, '']
			});
			stateStack.push(`s${goto}`);
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				inputStack: structuredClone(inputStack),
				stateStack: structuredClone(stateStack),
				tree: structuredClone(tree),
				functionCall: functionCalls.length - 1
			});
		}
	}

	functionCalls.push({ name: 'setAccept', args: [accept] });
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		inputStack: structuredClone(inputStack),
		stateStack: structuredClone(stateStack),
		tree: structuredClone(tree),
		accept: accept,
		functionCall: functionCalls.length - 1
	});
}
