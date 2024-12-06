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
 * @typedef {{left: string, right: Array<any>, note: string | null, showRight: boolean, rightProps: Array<SetItem>}} SetRow
 */

/**
 * @typedef {{left: string, right: Array.<string>, index: number}} GrammarItem
 */

/**@typedef {{comp: ConstructorOfATypedSvelteComponent, name: string}} TabItem*/

/**@typedef {{ x: number, y: number }} Vec2*/

/**
 * @typedef {{
 * data: string,
 * done: boolean,
 * level:
 * number,
 * index: number,
 * parent: number,
 * opacity: number,
 * x: number,
 * y: number,
 * width: number,
 * d: string,
 * dashOffset: number,
 * parentPos?: number }} node
 */

/** @typedef {{level: number,index: number}} nodeId*/

/**
 * @template T
 * @typedef {{data: T, text: string, opacity: number,width:number, pos: number }} tableItem*/

/**
 * @template T
 * @typedef {Map<string, tableItem<T>>} tableCol*/

/** @typedef {{ruleIndex: number, pos: number, lookahead: Set<string>?}} LR0StateItem*/
/** @typedef {{ruleIndex: number, pos: number, lookahead: Set<string>}} LR1StateItem*/

/** @typedef {{index: number,items: LR0StateItem[]}} LR0State*/
/** @typedef {{index: number,items: LR1StateItem[]}} LR1State*/

/** @typedef {{states: LR0State[], transitions: Map<number, Map<string, number>>}} LR0Automaton*/
/** @typedef {{states: LR1State[], transitions: Map<number, Map<string, number>>}} LR1Automaton*/

export const unused = {};
