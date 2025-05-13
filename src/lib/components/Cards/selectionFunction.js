/** @typedef {{hideSelect: ()=>void, selectFor: (id:string)=>Promise<void>, updateWidth:(width:number)=>Promise<void>}} SelectionFunctions*/

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
