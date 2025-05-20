/**
 * @template T
 * @typedef {{
 * data: T,
 * text: string,
 * note: string,
 * id: number
 * }} StackItem<T>
 */

/**
 * @typedef {{value: string, note: string, opacity: number, hide: boolean}} SetItem
 */

/**
 * @typedef {{left: any, right: Array<any>}} SetRow
 */

/**
 * @typedef {{left: string, right: Array.<string>, index: number}} GrammarItem
 */

/**@typedef {{comp: import("svelte").Component, name: string, desc: string, loaded: boolean, tabId: string}} TabItem*/

/**@typedef {{ x: number, y: number }} Vec2*/

/**
 * @typedef {{
 * data: string,
 * id: number,
 * done: boolean,
 * level: number,
 * index: number,
 * parentIndex: number,
 * opacity: number,
 * x: number,
 * y: number,
 * width: number,
 * d: string,
 * dashOffset: number,
 * parentLevel: number }} node
 */

/** @typedef {{level: number,index: number}} nodeId*/

/**
 * @typedef {{
 * data: string,
 * self: nodeId
 * parent: nodeId
 * }} DataNode
 */

/**
 * @template T
 * @typedef {{data: T, opacity: number,width:number, pos: number }} tableItem*/

/**
 * @template T
 * @typedef {Map<string, tableItem<T>>} tableCol*/

/** @typedef {{ruleIndex: number, pos: number, lookahead: Set<string>?}} LR0StateItem*/
/** @typedef {{ruleIndex: number, pos: number, lookahead: Set<string>}} LR1StateItem*/

/** @typedef {{index: number,items: LR0StateItem[]}} LR0State*/
/** @typedef {{index: number,items: LR1StateItem[]}} LR1State*/

/** @typedef {{states: LR0State[], transitions: Map<number, Map<string, number>>}} LR0Automaton*/
/** @typedef {{states: LR1State[], transitions: Map<number, Map<string, number>>}} LR1Automaton*/

/**
 * @typedef {{title: string, content: string}} ResultsTabItem
 */

export const unused = {};
