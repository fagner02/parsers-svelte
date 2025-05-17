export const id = 'clrparsing';
export const elemIds = {
	grammar: `${id}-grammar`,
	stateStack: `${id}-stateStack`,
	table: `${id}-table`,
	inputStack: `${id}-inputStack`
};
/**@type {any} */
export let functionCalls = [];
/**@type {any} */
export let saves = [];
/**
 * @param {string[]} inputString
 * @param {import('@/types').GrammarItem[]} augRules
 * @param {Map<number, Map<string, string>>} table
 */
export function clrparsing(inputString, augRules, table) {
	functionCalls = [];
	const stateStack = ['s0'];
	const inputStack = ['$', ...inputString.reverse()];

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });
	functionCalls.push({
		trace: Error().stack,
		name: 'addToStackState',
		args: [0, 's0', '']
	});

	['$'].concat(inputString.reverse()).forEach((char, i) => {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
		functionCalls.push({
			trace: Error().stack,
			name: 'addToStackInput',
			args: [char, char, '']
		});
	});

	while (true) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });
		const currentState = stateStack[stateStack.length - 1];
		const lookahead = inputStack[inputStack.length - 1];

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5]] });
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[6]] });

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[7]] });
		const action = table.get(parseInt(currentState.slice(1)))?.get(lookahead);

		// Handle invalid/missing action
		if (!action || action === '') {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[8]] });
			functionCalls.push({ trace: Error().stack, name: 'setAccept', args: [false] });
			break;
		}

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[9]] });
		// Accept action
		if (action === 'a') {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[10]] });
			functionCalls.push({ trace: Error().stack, name: 'setAccept', args: [true] });
			break;
		}

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[11]] });
		// Shift action
		if (action.startsWith('s')) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[12]] });
			const newState = parseInt(action.slice(1));

			functionCalls.push({
				trace: Error().stack,
				name: 'addFloatingNode',
				args: [[lookahead]],
				skip: true
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[13]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addToStackState',
				args: [lookahead, lookahead, '']
			});
			stateStack.push(lookahead);
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[14]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addToStackState',
				args: [newState, `s${newState}`, '']
			});
			stateStack.push(`s${newState}`);
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[15]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'removeFromStackInput',
				args: [inputStack.length - 1]
			});
			inputStack.pop();
		}

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[16]] });
		// Reduce action
		if (action.startsWith('r')) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[17]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[18]] });
			const ruleIndex = parseInt(action.slice(1));
			const production = augRules[ruleIndex];
			/**@type {string[]} */
			let children = [];
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[19]] });
			if (production.right[0] !== '') {
				for (let i = 0; i < production.right.length; i++) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[20]] });
					children.push(stateStack[stateStack.length - 2]);
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[21]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'removeFromStackState',
						args: [stateStack.length - 1]
					});
					stateStack.pop();
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[22]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'removeFromStackState',
						args: [stateStack.length - 1]
					});
					stateStack.pop();
				}
			}
			children.reverse();
			functionCalls.push({
				trace: Error().stack,
				name: 'addParent',
				args: [production.left, children],
				skip: true
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[23]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[24]] });
			const stackState = parseInt(stateStack[stateStack.length - 1].slice(1));
			const gotoState = table.get(stackState)?.get(production.left);

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[25]] });
			if (!gotoState || gotoState === '') {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[26]] });
				functionCalls.push({ trace: Error().stack, name: 'setAccept', args: [false] });
				break;
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[27]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addToStackState',
				args: [production.left, production.left, '']
			});
			stateStack.push(production.left);
			const goto = parseInt(gotoState.slice(1));
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[28]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addToStackState',
				args: [goto, `s${goto}`, '']
			});
			stateStack.push(`s${goto}`);
		}

		functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	}
	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });

	return {
		accepted: false,
		functionCalls
	};
}
