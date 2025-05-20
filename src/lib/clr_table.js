import { colors } from './selectSymbol';

export let id = 'clrTable';

export let elemIds = {
	stateStack: `${id}-stateStack`,
	state: `${id}-state`,
	grammar: `${id}-grammar`,
	table: `${id}-table`
};

/** @type {any} */
export let functionCalls = [];

/**
 * @type {{
 * state: import('@/types').LR1StateItem[],
 * table: Map<number, Map<string, string>>,
 * stateName: string,
 * functionCall: number }[]}
 * */
export let saves = [];

/**
 * @param {import('@/types').LR1Automaton} automaton
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 * @param {string[]} t
 */
export function clrTable(automaton, rules, nt, t) {
	functionCalls = [];
	saves = [];
	const alphabet = [...t, ...nt];
	/**@type {Map<number,Map<string, string>>} */
	let table = new Map();
	for (let state of automaton.states) {
		table.set(state.index, new Map(alphabet.map((x) => [x, ''])));
	}
	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		state: [],
		table: structuredClone(table),
		stateName: '',
		functionCall: functionCalls.length - 1
	});
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });

	for (let [sindex, s] of automaton.states.entries()) {
		functionCalls.push({
			trace: Error().stack,
			name: 'selectForStack',
			args: [`stack-${elemIds.stateStack}-${sindex}`]
		});
		functionCalls.push({ trace: Error().stack, name: 'resetState', args: [true] });
		functionCalls.push({ trace: Error().stack, name: 'stateName', args: [`s${sindex}`] });
		functionCalls.push({
			trace: Error().stack,
			name: 'loadState',
			args: [structuredClone(s.items)]
		});
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5]] });

		for (let [index, item] of s.items.entries()) {
			functionCalls.push({
				trace: Error().stack,
				name: 'selectFor',
				args: [`state-${elemIds.state}-${index}`]
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[6]] });
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[7]] });

			if (
				item.pos === rules[item.ruleIndex].right.length ||
				rules[item.ruleIndex].right[0] === ''
			) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[8]] });

				if (item.ruleIndex === 0) {
					functionCalls.push({ trace: Error().stack, name: 'highlightDot', args: [index] });
					table.get(s.index)?.set('$', 'a');
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[9]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightOn',
						args: [`s${s.index}`, '$']
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'addToTable',
						args: ['a', `s${s.index}`, '$']
					});
					functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
					functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
					saves.push({
						state: structuredClone(s.items),
						table: structuredClone(table),
						stateName: `s${s.index}`,
						functionCall: functionCalls.length - 1
					});
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[13]] });
					continue;
				}

				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[10]] });
				for (let symbol of item.lookahead) {
					table.get(s.index)?.set(symbol, `r${item.ruleIndex}`);
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[11]] });
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[12]] });
					functionCalls.push({ trace: Error().stack, name: 'highlightDot', args: [index] });
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightOn',
						args: [`s${s.index}`, symbol]
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'addToTable',
						args: [`r${item.ruleIndex}`, `s${s.index}`, symbol]
					});
					functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
					functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
					saves.push({
						state: structuredClone(s.items),
						table: structuredClone(table),
						stateName: `s${s.index}`,
						functionCall: functionCalls.length - 1
					});
				}
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					state: structuredClone(s.items),
					table: structuredClone(table),
					stateName: `s${s.index}`,
					functionCall: functionCalls.length - 1
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[13]] });
				continue;
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[14]] });
			const currentSymbol = rules[item.ruleIndex].right[item.pos];
			functionCalls.push({ trace: Error().stack, name: 'highlightDot', args: [index] });
			functionCalls.push({
				trace: Error().stack,
				name: 'selectSymbol',
				args: [`state-${elemIds.state}-${index}-${item.pos}`, colors.pink, id, false]
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[15]] });

			let transition = automaton.transitions.get(s.index)?.get(currentSymbol);
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[16]] });

			if (nt.includes(currentSymbol)) {
				table.get(s.index)?.set(`${rules[item.ruleIndex].right[item.pos]}`, `g${transition}`);
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[17]] });
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightOn',
					args: [`s${s.index}`, currentSymbol]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addToTable',
					args: [`g${transition}`, `s${s.index}`, currentSymbol]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					state: structuredClone(s.items),
					table: structuredClone(table),
					stateName: `s${s.index}`,
					functionCall: functionCalls.length - 1
				});
			} else {
				table.get(s.index)?.set(`${rules[item.ruleIndex].right[item.pos]}`, `s${transition}`);
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[18]] });
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[19]] });
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightOn',
					args: [`s${s.index}`, currentSymbol]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addToTable',
					args: [`s${transition}`, `s${s.index}`, currentSymbol]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					state: structuredClone(s.items),
					table: structuredClone(table),
					stateName: `s${s.index}`,
					functionCall: functionCalls.length - 1
				});
			}
			functionCalls.push({
				trace: Error().stack,
				name: 'deselectSymbol',
				args: [`state-${elemIds.state}-${index}-${item.pos}`, id]
			});
		}
		functionCalls.push({ trace: Error().stack, name: 'hideSelect', args: [] });
	}
	functionCalls.push({ trace: Error().stack, name: 'hideSelectStack', args: [] });

	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[]] });
	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		state: saves[saves.length - 1].state,
		table: structuredClone(table),
		stateName: saves[saves.length - 1].stateName,
		functionCall: functionCalls.length - 1
	});

	return { table, id };
}
