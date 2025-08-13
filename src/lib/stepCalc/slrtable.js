import { colors } from '../selectSymbol';

export let id = 'slrTable';
export let elemIds = {
	grammar: `${id}-grammar`,
	stateStack: `${id}-stateStack`,
	table: `${id}-table`,
	follow: `${id}-follow`,
	state: `${id}-state`
};

/**
 * @type {{
 * state: import('@/types').LR0StateItem[],
 * stateName: string,
 * table: Map<number, Map<string, string>>,
 * followSelect: string,
 * stackSelect: string,
 * stateSelect: string,
 * symbolIds: any[],
 * functionCall: number }[]}
 * */
export let saves = [];
/** @type {import("@/types").Command<ReturnType<typeof import("@/Algorithms/SLRTableAlgorithm.svelte").default>['obj']>[]} */
export let functionCalls = [];

/**
 * @param {import('@/types').LR0Automaton} automaton
 * @param {Array<import('@/types').GrammarItem>} rules
 * @param {string[]} nt
 * @param {string[]} t
 * @param {Map<string, Set<string>>} followSet
 */
export function slrTable(automaton, rules, nt, t, followSet) {
	/**@type {any[]} */
	let symbolIds = [];
	functionCalls = [];
	saves = [];
	const alphabet = [...t, ...nt];

	/**@type {Map<number,Map<string, string>>} */
	let table = new Map();
	for (let state of automaton.states) {
		table.set(state.index, new Map(alphabet.map((x) => [x, ''])));
	}

	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		state: [],
		table: structuredClone(table),
		stateName: '',
		followSelect: '',
		stackSelect: '',
		stateSelect: '',
		functionCall: 0,
		symbolIds: structuredClone(symbolIds)
	});
	functionCalls.push({ name: 'highlightLines', args: [[0]] });
	functionCalls.push({ name: 'highlightLines', args: [[1]] });
	functionCalls.push({ name: 'highlightLines', args: [[2]] });
	functionCalls.push({ name: 'highlightLines', args: [[3]] });

	for (let s of automaton.states) {
		functionCalls.push({ name: 'highlightLines', args: [[4]] });
		functionCalls.push({
			name: 'selectForStack',
			args: [`stack-${elemIds.stateStack}-${s.index}`]
		});
		functionCalls.push({ name: 'resetState', args: [true] });
		functionCalls.push({ name: 'stateName', args: [`s${s.index}`] });
		functionCalls.push({
			name: 'loadState',
			args: [structuredClone(s.items)]
		});

		for (let [index, item] of s.items.entries()) {
			functionCalls.push({ name: 'highlightLines', args: [[5]] });
			functionCalls.push({
				name: 'selectFor',
				args: [`state-${elemIds.state}-${index}`]
			});
			functionCalls.push({ name: 'addPause', args: [id] });
			saves.push({
				state: structuredClone(s.items),
				table: structuredClone(table),
				stateName: `s${s.index}`,
				followSelect: '',
				stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
				stateSelect: `state-${elemIds.state}-${index}`,
				functionCall: functionCalls.length - 1,
				symbolIds: structuredClone(symbolIds)
			});
			functionCalls.push({ name: 'highlightLines', args: [[6]] });

			if (
				item.pos === rules[item.ruleIndex].right.length ||
				rules[item.ruleIndex].right[0] === ''
			) {
				let followIndex = followSet.keys().toArray().indexOf(rules[item.ruleIndex].left);
				let follow = followSet.get(rules[item.ruleIndex].left);

				if (!follow) continue;

				functionCalls.push({ name: 'highlightLines', args: [[7]] });
				if (item.ruleIndex === 0) {
					functionCalls.push({ name: 'highlightLines', args: [[8]] });
					functionCalls.push({
						name: 'highlightDot',
						args: [index]
					});
					table.get(s.index)?.set('$', 'a');
					functionCalls.push({
						name: 'highlightOn',
						args: [`s${s.index}`, '$']
					});
					functionCalls.push({
						name: 'addToTable',
						args: ['a', `s${s.index}`, '$']
					});
					functionCalls.push({ name: 'highlightOff', args: [] });
					functionCalls.push({ name: 'highlightLines', args: [[13]] });
					functionCalls.push({ name: 'addPause', args: [id] });
					saves.push({
						state: structuredClone(s.items),
						table: structuredClone(table),
						stateName: `s${s.index}`,
						followSelect: '',
						stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
						stateSelect: `state-${elemIds.state}-${index}`,
						functionCall: functionCalls.length - 1,
						symbolIds: structuredClone(symbolIds)
					});
					continue;
				}

				functionCalls.push({ name: 'highlightLines', args: [[9]] });
				for (let symbol of follow) {
					functionCalls.push({ name: 'highlightLines', args: [[10]] });
					functionCalls.push({
						name: 'selectForFollow',
						args: [`${elemIds.follow}set${followIndex}`]
					});

					functionCalls.push({ name: 'highlightLines', args: [[11]] });
					functionCalls.push({ name: 'highlightDot', args: [index] });
					table.get(s.index)?.set(symbol, `r${item.ruleIndex}`);
					functionCalls.push({
						name: 'highlightOn',
						args: [`s${s.index}`, symbol]
					});
					functionCalls.push({
						name: 'addToTable',
						args: [`r${item.ruleIndex}`, `s${s.index}`, symbol]
					});
					functionCalls.push({ name: 'highlightOff', args: [] });
					functionCalls.push({ name: 'addPause', args: [id] });
					saves.push({
						state: structuredClone(s.items),
						table: structuredClone(table),
						stateName: `s${s.index}`,
						followSelect: `${elemIds.follow}set${followIndex}`,
						stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
						stateSelect: `state-${elemIds.state}-${index}`,
						functionCall: functionCalls.length - 1,
						symbolIds: structuredClone(symbolIds)
					});
				}
				functionCalls.push({ name: 'hideSelectFollow', args: [] });
				functionCalls.push({ name: 'highlightLines', args: [[12]] });
				continue;
			}

			functionCalls.push({ name: 'highlightLines', args: [[13]] });
			const currentSymbol = rules[item.ruleIndex].right[item.pos];
			functionCalls.push({ name: 'highlightLines', args: [[14]] });
			let transition = automaton.transitions.get(s.index)?.get(currentSymbol);

			functionCalls.push({ name: 'highlightLines', args: [[15]] });
			if (nt.includes(currentSymbol)) {
				functionCalls.push({ name: 'highlightLines', args: [[16]] });
				functionCalls.push({
					name: 'highlightDot',
					args: [index]
				});

				functionCalls.push({
					name: 'selectSymbol',
					args: [`state-${elemIds.state}-${index}-${item.pos}`, colors.pink, id, false]
				});
				symbolIds.push(functionCalls.at(-1)?.args);
				table.get(s.index)?.set(currentSymbol, `g${transition}`);
				functionCalls.push({
					name: 'highlightOn',
					args: [`s${s.index}`, currentSymbol]
				});
				functionCalls.push({
					name: 'addToTable',
					args: [`g${transition}`, `s${s.index}`, currentSymbol]
				});
				functionCalls.push({ name: 'highlightOff', args: [] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					state: structuredClone(s.items),
					table: structuredClone(table),
					stateName: `s${s.index}`,
					followSelect: '',
					stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
					stateSelect: `state-${elemIds.state}-${index}`,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
			} else {
				functionCalls.push({ name: 'highlightLines', args: [[17]] });
				functionCalls.push({ name: 'highlightLines', args: [[18]] });
				functionCalls.push({
					name: 'highlightDot',
					args: [index]
				});

				functionCalls.push({
					name: 'selectSymbol',
					args: [`state-${elemIds.state}-${index}-${item.pos}`, colors.pink, id, false]
				});
				symbolIds.push(functionCalls.at(-1)?.args);
				table.get(s.index)?.set(currentSymbol, `s${transition}`);
				functionCalls.push({
					name: 'highlightOn',
					args: [`s${s.index}`, currentSymbol]
				});
				functionCalls.push({
					name: 'addToTable',
					args: [`s${transition}`, `s${s.index}`, currentSymbol]
				});
				functionCalls.push({ name: 'highlightOff', args: [] });
				functionCalls.push({ name: 'addPause', args: [id] });
				saves.push({
					state: structuredClone(s.items),
					table: structuredClone(table),
					stateName: `s${s.index}`,
					followSelect: '',
					stackSelect: `stack-${elemIds.stateStack}-${s.index}`,
					stateSelect: `state-${elemIds.state}-${index}`,
					functionCall: functionCalls.length - 1,
					symbolIds: structuredClone(symbolIds)
				});
			}
			let symbolId = `state-${elemIds.state}-${index}-${item.pos}`;
			functionCalls.push({
				name: 'deselectSymbol',
				args: [symbolId, id]
			});
			symbolIds = symbolIds.filter((x) => x[0] != symbolId);
		}
		functionCalls.push({ name: 'hideSelect', args: [] });
	}
	functionCalls.push({ name: 'hideSelectStack', args: [] });

	functionCalls.push({ name: 'highlightLines', args: [[]] });
	functionCalls.push({ name: 'addPause', args: [id] });
	saves.push({
		state: saves[saves.length - 1].state,
		table: structuredClone(table),
		stateName: saves[saves.length - 1].stateName,
		followSelect: '',
		stackSelect: '',
		stateSelect: '',
		functionCall: functionCalls.length - 1,
		symbolIds: structuredClone(symbolIds)
	});

	return { table, functionCalls, id };
}
