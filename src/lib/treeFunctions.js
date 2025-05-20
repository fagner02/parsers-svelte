/**@type {import("@/Structures/SyntaxTreeClass.svelte").SyntaxTreeClass} */
let tree;

/**
 * @param {import("@/Structures/SyntaxTreeClass.svelte").SyntaxTreeClass} _tree
 */
export function setTree(_tree) {
	tree = _tree;
}

export function getTree() {
	return tree;
}
