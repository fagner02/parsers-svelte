import { appendData } from '../../log';

/**
 * @param {HTMLElement} elem
 * @param {string} id
 */
export function stackFloatingWindows(elem, id) {
	setTimeout(() => {
		let boundingBox = document.querySelector(`#${id}-wrapper`);
		if (!boundingBox) return;
		let boundingBoxRect = boundingBox.getBoundingClientRect();
		const pad = 10;
		let top = pad + 10;
		for (let item of elem.children) {
			let margin = item.computedStyleMap().get('margin-bottom')?.toString() ?? '0';
			let rect = item.getBoundingClientRect();
			/**@type {HTMLElement}*/ (item).style.left = `${pad}px`;
			/**@type {HTMLElement}*/ (item).style.top =
				`${boundingBoxRect.bottom - parseFloat(margin) - rect.height - top - boundingBoxRect.top}px`;
			/**@type {HTMLElement}*/ (item).style.opacity = '1';

			top += rect.height + pad;
		}
	}, 500);
}

/**@typedef {HTMLElement | SVGElement} Elem*/
export class Interaction {
	scale = 0.7;
	pos = { x: 0, y: 0 };
	movePos = { x: 0, y: 0 };
	/**@type {{ x: number; y: number; } | null}*/
	dragPos = null;
	isClick = false;
	isScroll = false;
	lastDist = 0;
	/** @type {Elem | undefined} */
	cursor;
	/** @type {(Elem)[]} */
	targets = [];
	/**@type {Elem | undefined} */
	transformListener;
	/**@type {Elem|undefined} */
	moveTarget;
	/**@type {Elem?}*/
	parent = null;
	/**@type {Elem | undefined}*/
	resizedElem;
	/**@type {DOMRect | null} */
	resizeInitial = null;
	resizePoint = { x: 0, y: 0 };
	resizeDirLeft = false;
	resizeDirTop = false;

	/**@type {((value: boolean)=>void)?} */
	interactingCallback = null;

	/**
	 * @param {((value: boolean) => void)?} callback
	 */
	setInteractingCallback(callback) {
		this.interactingCallback = callback;
	}
	removeDocumentListeners() {
		document.onmouseup = null;
		document.onmouseleave = null;
		document.onmousemove = null;
		document.ontouchend = null;
		document.ontouchmove = null;
		document.ontouchcancel = null;
	}

	/**
	 * @param {Elem} target
	 * @param {Elem?} parent
	 */
	setMoveInteraction(target, parent = null) {
		this.moveTarget = target;
		this.parent = parent;
		if (!parent) {
			this.parent = this.moveTarget.parentElement;
		}
		this.attachMoveListeners();
	}

	attachMoveListeners() {
		this.dragPos = null;
		if (!this.moveTarget) return;
		this.moveTarget.onmousedown = (e) => {
			this.moveStart(e);
		};
		this.moveTarget.ontouchstart = (e) => {
			this.moveStart(e);
		};
		this.moveTarget.style.cursor = 'move';
	}

	removeMoveListeners() {
		if (!this.moveTarget) return;
		this.moveTarget.style.cursor = 'unset';
		/**@type {HTMLElement}*/ (this.moveTarget.firstChild).style.pointerEvents = 'all';
		this.moveTarget.onmousedown = null;
		this.moveTarget.ontouchstart = null;
		this.removeDocumentListeners();
	}

	/**
	 * @param {MouseEvent | TouchEvent} e
	 * @param {Function?} moveEndCallback
	 */
	moveStart(e, moveEndCallback = null) {
		if (this.moveTarget) {
			this.moveTarget.style.cursor = 'move';
		}

		if (e instanceof MouseEvent) {
			e.preventDefault();
			e.stopImmediatePropagation();
		}
		this.interactingCallback?.(true);
		document.onmouseup = (e) => {
			this.moveEnd(e);
			moveEndCallback?.();
		};
		document.onmouseleave = (e) => {
			this.moveEnd(e);
		};
		document.onmousemove = (e) => {
			this.moveMove(e);
		};
		document.ontouchmove = (e) => {
			this.moveMove(e);
		};
		document.ontouchend = (e) => {
			this.moveEnd(e);
			moveEndCallback?.();
		};
		document.ontouchcancel = (e) => {
			this.moveEnd(e);
		};

		let x, y;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}
		appendData(`w click,${x} ${y};${window.innerWidth} ${window.innerHeight}`);

		this.dragPos = { x: x, y: y };

		if (!this.parent) return;

		this.movePos = {
			x: parseFloat(this.parent.style.left) || 0,
			y: parseFloat(this.parent.style.top) || 0
		};
	}

	/**
	 * @param {MouseEvent | TouchEvent} e
	 */
	moveMove(e) {
		if (!this.dragPos || !this.moveTarget) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		let x, y;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}
		let diff = { x: x - this.dragPos.x, y: y - this.dragPos.y };
		this.dragPos = { x: x, y: y };
		this.movePos = { x: this.movePos.x + diff.x, y: this.movePos.y + diff.y };

		/**@type {HTMLElement}*/ (this.parent).style.top = `${this.movePos.y}px`;
		/**@type {HTMLElement}*/ (this.parent).style.left = `${this.movePos.x}px`;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	moveEnd(e) {
		this.removeDocumentListeners();
		this.interactingCallback?.(false);
		if (this.parent) {
			const rect = this.parent.getBoundingClientRect();
			appendData(`move float, end;${rect.left} ${rect.top};${rect.width} ${rect.height}`);
		}
		if (!this.dragPos || !this.moveTarget) return;

		let x, y;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			if (e.touches.length === 0) return;
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}
		let diff = { x: x - this.dragPos.x, y: y - this.dragPos.y };
		this.movePos = { x: this.movePos.x + diff.x, y: this.movePos.y + diff.y };
		this.dragPos = null;
	}

	/**
	 * @param {Map<string, Elem?>} handles
	 * @param {Elem} target
	 * @param {string} id
	 */
	setResizeInteraction(handles, target, id) {
		this.resizedElem = target;
		for (let h of 'lr') {
			for (let v of 'bt') {
				const handle = handles.get(h + v);
				if (handle) {
					let start = (/** @type {MouseEvent|TouchEvent} */ e) => {
						this.resizeDirLeft = h === 'l';
						this.resizeDirTop = v === 't';
						appendData(`resize float, start;${id}`);
						let x, y;
						if (e instanceof MouseEvent) {
							x = e.clientX;
							y = e.clientY;
						} else {
							if (e.touches.length === 0) return;
							x = e.touches[0].clientX;
							y = e.touches[0].clientY;
						}
						appendData(`w click,${x} ${y};${window.innerWidth} ${window.innerHeight}`);
						e.stopImmediatePropagation();
						e.preventDefault();
						this.resizeStart();
					};
					handle.onmousedown = start;
					handle.ontouchstart = start;
				}
			}
		}
	}

	resizeStart() {
		if (!this.resizedElem) return;
		this.interactingCallback?.(true);
		this.resizeInitial = this.resizedElem.getBoundingClientRect();
		if (this.moveTarget?.parentElement) {
			this.resizePoint.x = parseFloat(this.moveTarget.parentElement.style.left);
			this.resizePoint.y = parseFloat(this.moveTarget.parentElement.style.top);
		}
		document.onmousemove = (e) => {
			this.resizeMove(e);
		};
		document.onmouseup = () => {
			this.resizeEnd();
		};
		document.onmouseleave = () => {
			this.resizeEnd();
		};
		document.ontouchmove = (e) => {
			this.resizeMove(e);
		};
		document.ontouchend = () => {
			this.resizeEnd();
		};
		document.ontouchcancel = () => {
			this.resizeEnd();
		};
	}

	resizeEnd() {
		if (this.moveTarget?.parentElement) {
			let rect = this.moveTarget?.parentElement.getBoundingClientRect();
			appendData(`resize float, end;${rect.x} ${rect.y};${rect.width} ${rect.height}`);
		}
		this.interactingCallback?.(false);
		this.resizeInitial = null;
		this.removeDocumentListeners();
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	resizeMove(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		if (!this.resizedElem || !this.resizeInitial || !this.moveTarget?.parentElement) return;
		let x, y;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			if (e.touches.length == 0) return;
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}

		if (this.resizeDirLeft) {
			const width = this.resizeInitial.right - x;
			const left = this.resizePoint.x - (width - this.resizeInitial.width);
			this.resizedElem.style.width = `${width}px`;
			this.moveTarget.parentElement.style.left = `${left}px`;
		} else {
			const width = x - this.resizeInitial.left;

			this.resizedElem.style.width = `${width}px`;
		}
		if (this.resizeDirTop) {
			const height = this.resizeInitial.bottom - y;
			const top = this.resizePoint.y - (height - this.resizeInitial.height);
			this.resizedElem.style.height = `${height}px`;

			this.moveTarget.parentElement.style.top = `${top}px`;
		} else {
			const height = y - this.resizeInitial.top;
			this.resizedElem.style.height = `${height}px`;
		}
	}

	/**
	 * @param {Elem} listener
	 * @param {(Elem)[]} targets
	 */
	setTransformInteraction(listener, targets) {
		this.targets = targets;
		this.transformListener = listener;
		listener.style.cursor = 'grab';
		this.attachTransformListeners();
	}

	attachTransformListeners() {
		this.dragPos = null;
		if (!this.transformListener) return;
		this.transformListener.onmousedown = (e) => {
			this.dragStart(e);
		};
		this.transformListener.onmouseleave = (e) => {
			this.dragEnd(e);
		};
		this.transformListener.onmouseup = (e) => {
			this.dragEnd(e);
		};
		this.transformListener.onmousemove = (e) => {
			this.dragMove(e);
		};
		this.transformListener.ontouchstart = (e) => {
			this.touchStart(e);
		};
		this.transformListener.ontouchmove = (e) => {
			this.touchMove(e);
		};
		this.transformListener.ontouchend = (_) => {
			this.touchEnd();
		};
		this.transformListener.onwheel = (e) => {
			this.wheel(e);
		};
	}

	removeTransformListeners() {
		if (!this.transformListener) return;
		this.transformListener.onmousedown = null;
		this.transformListener.onmouseleave = null;
		this.transformListener.onmouseup = null;
		this.transformListener.onmousemove = null;
		this.transformListener.ontouchstart = null;
		this.transformListener.ontouchmove = null;
		this.transformListener.ontouchend = null;
		this.transformListener.onwheel = null;
	}

	/**
	 * @param {MouseEvent} e
	 */
	dragStart(e) {
		if (!this.transformListener || this.resizeInitial) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		this.isClick = true;
		this.dragPos = { x: e.clientX, y: e.clientY };
		this.transformListener.style.cursor = 'grabbing';
	}

	/**
	 * @param {MouseEvent} e
	 */
	dragEnd(e) {
		if (!this.dragPos || !this.transformListener || this.resizeInitial) return;
		let diff = { x: e.clientX - this.dragPos.x, y: e.clientY - this.dragPos.y };
		this.pos = { x: this.pos.x + diff.x, y: this.pos.y + diff.y };
		this.dragPos = null;
		this.transformListener.style.cursor = 'grab';
	}

	/**
	 * @param {MouseEvent} e
	 */
	dragMove(e) {
		if (this.resizeInitial) return;
		if (this.dragPos === null) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		this.isClick = false;

		let diff = { x: e.clientX - this.dragPos.x, y: e.clientY - this.dragPos.y };

		for (let elem of this.targets) {
			elem.style.transform = `translate(${this.pos.x + diff.x}px,${this.pos.y + diff.y}px) scale(${this.scale})`;
		}
	}

	/**
	 * @param {TouchEvent} e
	 */
	touchStart(e) {
		e.preventDefault();
		if (e.touches.length > 1) {
			this.isScroll = false;
			let diff = {
				x: e.touches[0].clientX - e.touches[1].clientX,
				y: e.touches[0].clientY - e.touches[1].clientY
			};
			this.lastDist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
		} else {
			this.isScroll = true;
			this.dragPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		}
	}

	touchMove(/**@type {TouchEvent}*/ e) {
		e.preventDefault();
		if (this.isScroll) {
			if (this.dragPos === null) return;
			let diff = {
				x: e.touches[0].clientX - this.dragPos.x,
				y: e.touches[0].clientY - this.dragPos.y
			};
			this.dragPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			this.pos.x += diff.x;
			this.pos.y += diff.y;
			this.setTransform();

			return;
		}
		if (e.touches.length < 2) return;
		let diff = {
			x: e.touches[0].clientX - e.touches[1].clientX,
			y: e.touches[0].clientY - e.touches[1].clientY
		};
		let dist = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
		this.scale += (dist - this.lastDist) * 0.001;
		this.lastDist = dist;
		this.setTransform();
	}

	touchEnd() {
		this.dragPos = null;
	}

	wheel(/**@type {WheelEvent}*/ e) {
		e.preventDefault();

		if (Math.round(e.deltaX) !== e.deltaX || Math.round(e.deltaY) !== e.deltaY) {
			this.scale += e.deltaY * -0.01;
			if (this.scale < 0) this.scale = 0;
		} else {
			this.pos = { x: this.pos.x + e.deltaX, y: this.pos.y + e.deltaY };
		}
		this.setTransform();
	}

	setTransform() {
		for (let elem of this.targets) {
			elem.style.transform = `translate(${this.pos.x}px,${this.pos.y}px) scale(${this.scale})`;
		}
	}

	/**
	 * @param {(Elem)[]} targets
	 */
	updateTargets(targets) {
		this.targets = targets;
		this.setTransform();
	}
}
