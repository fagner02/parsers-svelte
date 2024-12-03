/**
 * @type {ConstructorOfATypedSvelteComponent?}
 */
export let component = null;

/**
 * @param {ConstructorOfATypedSvelteComponent} _component
 */
export function setInfoComponent(_component) {
	component = _component;
}
