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
		if (this.moveTarget) {
			this.moveTarget.style.cursor = 'unset';
			/**@type {HTMLElement}*/ (this.moveTarget.firstChild).style.pointerEvents = 'all';
		}
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
	 * @param {Map<string, Elem?>} handles
	 * @param {Elem} target
	 */
	setResizeInteraction(handles, target) {
		this.resizedElem = target;
		for (let h of 'lr') {
			for (let v of 'bt') {
				const handle = handles.get(h + v);
				if (handle) {
					let start = (/** @type {MouseEvent|TouchEvent} */ e) => {
						this.resizeDirLeft = h === 'l';
						this.resizeDirTop = v === 't';
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
	/**@type {Elem|undefined} */
	moveTarget;
	/**
	 * @param {Elem} target
	 */
	setMoveInteraction(target) {
		this.moveTarget = target;
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
		/**@type {HTMLElement}*/ (this.moveTarget.firstChild).style.pointerEvents = 'none';
	}

	removeMoveListeners() {
		if (!this.moveTarget) return;
		this.moveTarget.onmousedown = null;
		this.moveTarget.onmouseup = null;
		this.moveTarget.onmousemove = null;
	}

	/**
	 * @param {MouseEvent | TouchEvent} e
	 */
	moveStart(e) {
		e.preventDefault();
		e.stopImmediatePropagation();

		document.onmouseup = (e) => {
			this.moveEnd(e);
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
		};
		let x, y;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}
		this.dragPos = { x: x, y: y };
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

		this.moveTarget.style.top = `${this.movePos.y}px`;
		this.moveTarget.style.left = `${this.movePos.x}px`;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	moveEnd(e) {
		document.onmouseup = null;
		document.onmouseleave = null;
		document.onmousemove = null;
		document.ontouchend = null;
		document.ontouchmove = null;

		if (!this.dragPos || !this.moveTarget) return;
		let x, y;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}
		let diff = { x: x - this.dragPos.x, y: y - this.dragPos.y };
		this.movePos = { x: this.movePos.x + diff.x, y: this.movePos.y + diff.y };
		this.dragPos = null;
	}

	/**@type {Elem | undefined}*/
	resizedElem;
	/**@type {DOMRect | null} */
	resizeInitial = null;
	resizeDirLeft = false;
	resizeDirTop = false;

	resizeStart() {
		if (!this.resizedElem) return;
		this.resizeInitial = this.resizedElem.getBoundingClientRect();
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
	}

	resizeEnd() {
		this.resizeInitial = null;
		document.onmouseup = null;
		document.onmouseleave = null;
		document.onmousemove = null;
		document.ontouchend = null;
		document.ontouchmove = null;
	}

	/**
	 * @param {MouseEvent|TouchEvent} e
	 */
	resizeMove(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		if (!this.resizedElem || !this.resizeInitial) return;
		let x, y;
		if (e instanceof MouseEvent) {
			x = e.clientX;
			y = e.clientY;
		} else {
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}
		if (this.resizeDirLeft) {
			this.resizedElem.style.width = `${this.resizeInitial.right - x}px`;
		} else {
			this.resizedElem.style.width = `${x - this.resizeInitial.left}px`;
		}
		if (this.resizeDirTop) {
			this.resizedElem.style.height = `${this.resizeInitial.bottom - y}px`;
		} else {
			this.resizedElem.style.height = `${y - this.resizeInitial.top}px`;
		}
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
		e.preventDefault();
		e.stopImmediatePropagation();
		if (this.dragPos === null) return;
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
