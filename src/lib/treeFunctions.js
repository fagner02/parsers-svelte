/**
 * @typedef {{
 * initializeTree: (symbol: string, shouldWait?: boolean)=>Promise<void>,
 * addToTree: (data: string[], parent:string, shouldWait: boolean)=>Promise<void>,
 * resetTree: ()=>void,
 * addFloatingNode: (data: string[])=>Promise<any>,
 * addParent: (parent: string, children: string[]) => Promise<void>,
 * loadSyntaxTree: (levels: {data: string[], parentData: string}[], startingSymbol: string) => Promise<void>
 * }} TreeFunctions
 * */

let treeFunctions = /**@type {TreeFunctions}*/ ({});
export function setTreeFunctions(/**@type {TreeFunctions}*/ funcs) {
	treeFunctions = funcs;
}

export function getTreeFunctions() {
	return treeFunctions;
}
