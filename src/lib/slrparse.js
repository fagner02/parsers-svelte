export const id = 'lr0automaton';
export const elemIds = {};
/**@type {any} */
export let functionCalls = [];
/**@type {any} */
export let saves = [];
/**
 * @param {string[]} inputString
 * @param {any[]} augRules
 * @param {Map<number, Map<string, string>>} table
 */
export function slrparsing(inputString, augRules, table) {
	const stateStack = [0];
	const inputStack = [...inputString.reverse(), '$'];

	// Initial setup
	functionCalls.push({ trace: Error().stack, name: 'addPauseParse', args: [id] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });
	functionCalls.push({
		trace: Error().stack,
		name: 'addToStack',
		args: [0, 's0', '', 'state-stack']
	});

	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
	inputString.reverse().forEach((char, i) => {
		functionCalls.push({
			trace: Error().stack,
			name: 'addToStack',
			args: [char, char, '', `input-stack-${i}`]
		});
	});

	while (true) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3, 4]] });
		const currentState = stateStack[stateStack.length - 1];
		const lookahead = inputStack[inputStack.length - 1];

		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5, 6]] });

		const action = table.get(currentState)?.get(lookahead);

		// Handle invalid/missing action
		if (!action) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[8]] });
			functionCalls.push({ trace: Error().stack, name: 'setAccept', args: [false] });
			break;
		}

		// Accept action
		if (action === 'a') {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[10]] });
			functionCalls.push({ trace: Error().stack, name: 'setAccept', args: [true] });
			break;
		}

		// Shift action
		if (action.startsWith('s')) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[12]] });
			const newState = parseInt(action.slice(1));

			functionCalls.push({
				trace: Error().stack,
				name: 'addFloatingNode',
				args: [[lookahead], `node-${Date.now()}`]
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[13]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addToStack',
				args: [lookahead, lookahead, '', 'state-stack']
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[14]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addToStack',
				args: [newState, `s${newState}`, '', 'state-stack']
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[15]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'removeFromStack',
				args: [inputStack.length - 1, 'input-stack']
			});
		}

		// Reduce action
		if (action.startsWith('r')) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[17, 18]] });
			const ruleIndex = parseInt(action.slice(1));
			const production = augRules[ruleIndex];

			if (production.right[0] !== '') {
				for (let i = 0; i < production.right.length; i++) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[20]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'removeFromStack',
						args: [stateStack.length - 1, 'state-stack']
					});
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[21]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'removeFromStack',
						args: [stateStack.length - 2, 'state-stack']
					});
				}
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[23, 24]] });
			const gotoState = table.get(stateStack[stateStack.length - 1])?.get(production.left);

			if (!gotoState) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[26]] });
				functionCalls.push({ trace: Error().stack, name: 'setAccept', args: [false] });
				break;
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[27]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addParentNode',
				args: [production.left, production.right, `parent-${Date.now()}`]
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[28]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'addToStack',
				args: [gotoState, `s${gotoState}`, '', 'state-stack']
			});
		}

		functionCalls.push({ trace: Error().stack, name: 'addPauseParse', args: [id] });
	}

	functionCalls.push({ trace: Error().stack, name: 'limitHitParse', args: [id] });
	functionCalls.push({ trace: Error().stack, name: 'addPauseParse', args: [id] });

	return {
		accepted: false,
		functionCalls
	};
}
