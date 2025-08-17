<script>
	const config = { attributes: true, childList: true, subtree: false };

	/** @type {HTMLDivElement} */
	let component;
	/** @type {Element} */
	let parent;

	const observer = new MutationObserver(setSize);
	const resize = new ResizeObserver(setSize);

	/**@type {{class?: string, style?: string,id?: string, fillHeight?: boolean, fillWidth?: boolean, children: any}}*/
	let { fillHeight = true, fillWidth = true, id = 'resize-wrapper', ...props } = $props();

	function setHeight() {
		parent = /**@type {HTMLElement}*/ (component.parentElement);
		if (parent === null) return;

		const map = window.getComputedStyle(parent);
		const compMap = window.getComputedStyle(component);
		let gap = parseFloat(map.gap);
		gap = isNaN(gap) ? 0 : gap;
		const height = /**@type {number}*/ (parent.clientHeight);
		let deduct = 0;

		if (
			(map.display !== 'flex' || map.flexDirection.includes('column')) &&
			typeof parent.firstElementChild?.className === 'string' &&
			!parent.firstElementChild?.className?.includes('unit')
		) {
			for (let i = 0; i < parent.childElementCount; i++) {
				if (parent.children[i].isSameNode(component)) {
					break;
				}
				const child = /**@type {HTMLElement}*/ (parent.children[i]);
				const childMap = window.getComputedStyle(child);

				deduct +=
					child.clientHeight +
					parseFloat(childMap.marginBottom) +
					parseFloat(childMap.marginTop) +
					gap;
			}
		}
		const compInsets =
			parseFloat(compMap.paddingTop) +
			parseFloat(compMap.paddingBottom) +
			parseFloat(compMap.marginBottom) +
			parseFloat(compMap.marginTop);
		const newHeight = `${height - deduct - compInsets}px`;
		if (component.style.height === newHeight) return;
		component.style.height = newHeight;
	}
	function setWidth() {
		parent = /**@type {HTMLElement}*/ (component.parentElement);
		if (parent === null) return;

		const map = window.getComputedStyle(parent);
		const compMap = window.getComputedStyle(component);

		const width = /**@type {number}*/ Math.round(parent.getBoundingClientRect().width);
		let deduct = 0;
		if (
			map.display === 'flex' &&
			map.flexDirection.includes('row') &&
			!(/**@type {string}*/ (parent.firstElementChild?.className).includes('unit'))
		) {
			for (let i = 0; i < parent.childElementCount; i++) {
				if (parent.children[i].isSameNode(component)) {
					break;
				}
				const child = /**@type {HTMLElement}*/ (parent.children[i]);
				const childMap = window.getComputedStyle(child);
				deduct +=
					child.clientWidth +
					parseFloat(childMap.marginLeft) +
					parseFloat(childMap.marginRight) +
					parseFloat(childMap.paddingRight) +
					parseFloat(childMap.paddingLeft);
			}
		}

		const compInsets =
			parseFloat(compMap.paddingRight) +
			parseFloat(compMap.paddingLeft) +
			parseFloat(compMap.marginLeft) +
			parseFloat(compMap.marginRight);
		const newWidth = `${width - deduct - compInsets}px`;
		if (component.style.maxWidth === newWidth) return;
		component.style.maxWidth = newWidth;
	}

	function setSize() {
		if (fillWidth) setWidth();
		if (fillHeight) setHeight();
	}

	/**
	 * @param {HTMLDivElement} comp
	 */
	function setup(comp) {
		observer.observe(/**@type {HTMLElement}*/ (comp.parentElement), config);
		resize.observe(/**@type {HTMLElement}*/ (comp.parentElement));

		component = comp;
		setSize();
	}
</script>

<div use:setup class="filled {props.class ?? ''}" style={props.style} {id}>
	{@render props.children()}
</div>

<style>
</style>
