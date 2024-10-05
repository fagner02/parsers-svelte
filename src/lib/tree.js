/**@typedef {{initializeTree: (symbol: string)=>any, addToTree: (data: string[], parent:string)=>any, resetTree: (callId: number)=>any }} TreeFunctions*/

let treeFunctions = /**@type {TreeFunctions}*/ ({});
export function setTreeFunctions(/**@type {TreeFunctions}*/ funcs) {
	treeFunctions = funcs;
}

export function getTreeFunctions() {
	return treeFunctions;
}
