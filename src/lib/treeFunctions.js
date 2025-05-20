/**@type {import("@/Structures/syntaxTreeClass.svelte").SyntaxTreeClass} */
let tree;

/**
 * @param {import("@/Structures/syntaxTreeClass.svelte").SyntaxTreeClass} _tree
 */
export function setTree(_tree) {
	tree = _tree;
}

export function getTree() {
	return tree;
}
