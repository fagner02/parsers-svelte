/** @typedef {{hideSelect: ()=>any, selectFor: (id:string)=>Promise<void>}} SelectionFunctions*/

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
