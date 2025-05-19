import { colors } from './selectSymbol';

export let id = 'slrTable';
export let elemIds = {
	grammar: `${id}-grammar`,
	stateStack: `${id}-stateStack`,
	table: `${id}-table`,
	follow: `${id}-follow`,
	state: `${id}-state`
};
/** @type {{
 * state: import('@/types').LR0StateItem[],
 * stateName: string,
 * table: Map<number, Map<string, string>>,
 * followSelect: string,
 * stackSelect: string,
 * stateSelect: string,
 * functionCall: number }[]}*/
export let saves = [
	{
		state: [],
		table: new Map(),
		stateName: '',
		followSelect: '',
		stackSelect: '',
		stateSelect: '',
		functionCall: -1
	}
];
/** @type {any}*/
export let functionCalls = [];

/**
 * @param {import('@/types').LR0Automaton} automaton
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 * @param {string[]} t
 * @param {Map<string, Set<string>>} followSet
 */
export function slrTable(automaton, rules, nt, t, followSet) {
	const alphabet = [...t, ...nt];

	/**@type {Map<number,Map<string, string>>} */
	let table = new Map();
	for (let state of automaton.states) {
		table.set(state.index, new Map(alphabet.map((x) => [x, ''])));
	}

	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[0]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[1]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[2]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[3]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[4]] });

	for (let s of automaton.states) {
		functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[5]] });
		functionCalls.push({
			trace: Error().stack,
			name: 'selectForStack',
			args: [`stack-${elemIds.stateStack}-${s.index}`]
		});
		functionCalls.push({ trace: Error().stack, name: 'resetState', args: [true] });
		functionCalls.push({ trace: Error().stack, name: 'stateName', args: [`s${s.index}`] });
		functionCalls.push({
			trace: Error().stack,
			name: 'loadState',
			args: [structuredClone(s.items)]
		});

		for (let [index, item] of s.items.entries()) {
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[6]] });
			functionCalls.push({
				trace: Error().stack,
				name: 'selectFor',
				args: [`state-${elemIds.state}-${index}`]
			});
			functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
			saves.push({
				state: structuredClone(s.items),
				table: structuredClone(table),
				stateName: `s${s.index}`,
				followSelect: '',
				stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
				stateSelect: `state-${elemIds.state}-${index}`,
				functionCall: functionCalls.length - 1
			});
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[7]] });

			if (
				item.pos === rules[item.ruleIndex].right.length ||
				rules[item.ruleIndex].right[0] === ''
			) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[8]] });
				let followIndex = followSet.keys().toArray().indexOf(rules[item.ruleIndex].left);
				let follow = followSet.get(rules[item.ruleIndex].left);
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[9]] });

				if (!follow) continue;

				if (item.ruleIndex === 0) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[12]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightDot',
						args: [index]
					});
					table.get(s.index)?.set('$', 'a');
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightOn',
						args: [`s${s.index}`, '$']
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'addToTable',
						args: [{ action: 'a', state: item.ruleIndex }, 'a', `s${s.index}`, '$']
					});
					functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[13]] });
					functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
					saves.push({
						state: structuredClone(s.items),
						table: structuredClone(table),
						stateName: `s${s.index}`,
						followSelect: '',
						stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
						stateSelect: `state-${elemIds.state}-${index}`,
						functionCall: functionCalls.length - 1
					});
					continue;
				}

				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[14]] });
				for (let symbol of follow) {
					functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[15]] });
					functionCalls.push({
						trace: Error().stack,
						name: 'selectForFollow',
						args: [`${elemIds.follow}set${followIndex}`]
					});
					functionCalls.push({ trace: Error().stack, name: 'highlightDot', args: [index] });
					table.get(s.index)?.set(symbol, `r${item.ruleIndex}`);
					functionCalls.push({
						trace: Error().stack,
						name: 'highlightOn',
						args: [`s${s.index}`, symbol]
					});
					functionCalls.push({
						trace: Error().stack,
						name: 'addToTable',
						args: [
							{ action: 'r', state: item.ruleIndex },
							`r${item.ruleIndex}`,
							`s${s.index}`,
							symbol
						]
					});
					functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
					functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
					saves.push({
						state: structuredClone(s.items),
						table: structuredClone(table),
						stateName: `s${s.index}`,
						followSelect: `${elemIds.follow}set${followIndex}`,
						stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
						stateSelect: `state-${elemIds.state}-${index}`,
						functionCall: functionCalls.length - 1
					});
				}
				functionCalls.push({ trace: Error().stack, name: 'hideSelectFollow', args: [] });
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[16]] });
				continue;
			}

			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[17]] });
			const currentSymbol = rules[item.ruleIndex].right[item.pos];
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[18]] });

			let transition = automaton.transitions.get(s.index)?.get(currentSymbol);
			functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[19]] });

			if (nt.includes(currentSymbol)) {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[20]] });
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightDot',
					args: [index]
				});

				functionCalls.push({
					trace: Error().stack,
					name: 'selectSymbol',
					args: [`state-${elemIds.state}-${index}-${item.pos}`, colors.pink, id, false]
				});
				table.get(s.index)?.set(currentSymbol, `g${transition}`);
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightOn',
					args: [`s${s.index}`, currentSymbol]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addToTable',
					args: [{ action: 'g', state: transition }, `g${transition}`, `s${s.index}`, currentSymbol]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					state: structuredClone(s.items),
					table: structuredClone(table),
					stateName: `s${s.index}`,
					followSelect: '',
					stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
					stateSelect: `state-${elemIds.state}-${index}`,
					functionCall: functionCalls.length - 1
				});
			} else {
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[21]] });
				functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[22]] });
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightDot',
					args: [index]
				});

				functionCalls.push({
					trace: Error().stack,
					name: 'selectSymbol',
					args: [`state-${elemIds.state}-${index}-${item.pos}`, colors.pink, id, false]
				});
				table.get(s.index)?.set(currentSymbol, `s${transition}`);
				functionCalls.push({
					trace: Error().stack,
					name: 'highlightOn',
					args: [`s${s.index}`, currentSymbol]
				});
				functionCalls.push({
					trace: Error().stack,
					name: 'addToTable',
					args: [{ action: 's', state: transition }, `s${transition}`, `s${s.index}`, currentSymbol]
				});
				functionCalls.push({ trace: Error().stack, name: 'highlightOff', args: [] });
				functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
				saves.push({
					state: structuredClone(s.items),
					table: structuredClone(table),
					stateName: `s${s.index}`,
					followSelect: '',
					stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
					stateSelect: `state-${elemIds.state}-${index}`,
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

	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[23]] });
	functionCalls.push({ trace: Error().stack, name: 'highlightLines', args: [[]] });
	functionCalls.push({ trace: Error().stack, name: 'addPause', args: [id] });
	saves.push({
		state: [],
		table: structuredClone(table),
		stateName: '',
		followSelect: '',
		stackSelect: '',
		stateSelect: '',
		functionCall: functionCalls.length - 1
	});

	return { table, functionCalls, id };
}
