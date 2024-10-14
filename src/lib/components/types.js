/**
 * @template T
 * @typedef {{
 * opacity: number,
 * height: number,
 * width: number,
 * top: number,
 * data: T,
 * text: string,
 * note: string,
 * transition: string,
 * id: string,
 * showBlock: boolean }} StackItem<T>
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

/**
 * @typedef {{
 * data: string,
 * done: boolean,
 * level:
 * number,
 * index: number,
 * parent: number,
 * id: number,
 * opacity: number,
 * x: number,
 * y: number,
 * width: number,
 * height: number,
 * d: string,
 * dashOffset: number,
 * pos: number }} node
 */

/** @typedef {{level: number,index: number}} nodeId*/

/** @typedef {{data: any, text: string, opacity: number,width:number, pos: number }} tableItem*/

/** @typedef {Map<string, tableItem>} tableCol*/

export const unused = {};
