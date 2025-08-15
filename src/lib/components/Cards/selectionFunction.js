/** @typedef {{interval: NodeJS.Timeout?,hideSelect: ()=>void, selectFor: (id:string)=>Promise<void>}} SelectionFunctions*/

/** @type {Map<string, SelectionFunctions>} */
let selectionFunctions = new Map();

export function getSelectionFunctions(/**@type {string}*/ cardId) {
	return /**@type {SelectionFunctions}*/ (selectionFunctions.get(cardId));
}

export function setSelectionFunctions(
	/**@type {string} */ cardId,
	/**@type {SelectionFunctions} */ functions
) {
	selectionFunctions.set(cardId, functions);
}

export function resetSelectionFunctions() {
	selectionFunctions.clear();
}

/**
 * @param {{ [s: string]: any; }} obj
 * @param {{name: string, args:any}[]} functionCalls
 * @param {number} step
 */
export function resetSelectFor(obj, functionCalls, step) {
	Object.entries(obj).forEach((x) => {
		if (x[0].includes('hideSelect')) {
			x[1]()?.();
		}
	});
	let calls = functionCalls
		.slice(0, step)
		.filter((x) => x.name.includes('selectFor') || x.name.includes('hideSelect'));

	while (calls.length > 0) {
		const call = calls[calls.length - 1];
		obj[call.name]()?.(...call.args);
		const name = call.name.replace('selectFor', '').replace('hideSelect', '');

		calls = calls.filter((x) => x.name !== 'selectFor' + name);
		calls = calls.filter((x) => x.name !== 'hideSelect' + name);
	}
}
