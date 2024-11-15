/**@typedef {HTMLElement | SVGElement} Elem*/
export class Interaction {
	scale = 0.7;
	pos = { x: 0, y: 0 };
	/**@type {{ x: number; y: number; } | null}*/
	dragPos = null;
	isClick = false;
	isScroll = false;
	lastDist = 0;
	/** @type {Elem | undefined} */
	cursor;
	/** @type {(Elem)[]} */
	targets = [];

	/**
	 * @param {Elem} listener
	 * @param {Elem} cursor
	 * @param {(Elem)[]} targets
	 */
	setTransformInteraction(listener, cursor, targets) {
		this.cursor = cursor;
		this.targets = targets;
		listener.onmousedown = (e) => {
			this.dragStart(e);
		};
		listener.onmouseleave = (e) => {
			this.dragEnd(e);
		};
		listener.onmouseup = (e) => {
			this.dragEnd(e);
		};
		listener.onmousemove = (e) => {
			this.dragMove(e);
		};
		listener.ontouchstart = (e) => {
			this.touchStart(e);
		};
		listener.ontouchmove = (e) => {
			this.touchMove(e);
		};
		listener.ontouchend = (_) => {
			this.touchEnd();
		};
		listener.onwheel = (e) => {
			this.wheel(e);
		};
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
					handle.onmousedown = (e) => {
						this.resizeDirLeft = h === 'l';
						this.resizeDirTop = v === 't';
						e.stopImmediatePropagation();
						e.preventDefault();
						this.resizeStart();
					};
				}
			}
		}
	}

	/**
	 * @param {Elem} target
	 */
	setMoveInteraction(target) {
		target.onmousedown = (e) => {
			this.moveStart(e, target);
		};
		target.onmouseup = (e) => {
			this.moveEnd(e, target);
		};
		target.onmousemove = (e) => {
			this.moveMove(e, target);
		};
	}

	/**
	 * @param {MouseEvent} e
	 * @param {Elem} target
	 */
	moveStart(e, target) {
		e.preventDefault();
		e.stopImmediatePropagation();
		this.dragPos = { x: e.clientX, y: e.clientY };

		target.style.cursor = 'grabbing';
	}

	/**
	 * @param {MouseEvent} e
	 * @param {Elem} target
	 */
	moveMove(e, target) {
		if (this.dragPos === null) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		let diff = { x: e.clientX - this.dragPos.x, y: e.clientY - this.dragPos.y };
		this.dragPos = { x: e.clientX, y: e.clientY };
		this.pos = { x: this.pos.x + diff.x, y: this.pos.y + diff.y };

		target.style.top = `${this.pos.y}px`;
		target.style.left = `${this.pos.x}px`;
	}

	/**
	 * @param {MouseEvent} e
	 * @param {Elem} target
	 */
	moveEnd(e, target) {
		if (this.dragPos === null) return;
		let diff = { x: e.clientX - this.dragPos.x, y: e.clientY - this.dragPos.y };
		this.pos = { x: this.pos.x + diff.x, y: this.pos.y + diff.y };
		this.dragPos = null;
		target.style.cursor = 'grab';
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
			this.resizeInitial = null;
			document.onmousemove = null;
			document.onmouseup = null;
		};
	}

	/**
	 * @param {MouseEvent} e
	 */
	resizeMove(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		if (!this.resizedElem || !this.resizeInitial) return;
		if (this.resizeDirLeft) {
			this.resizedElem.style.width = `${this.resizeInitial.right - e.clientX}px`;
		} else {
			this.resizedElem.style.width = `${e.clientX - this.resizeInitial.left}px`;
		}
		if (this.resizeDirTop) {
			this.resizedElem.style.height = `${this.resizeInitial.bottom - e.clientY}px`;
		} else {
			this.resizedElem.style.height = `${e.clientY - this.resizeInitial.top}px`;
		}
	}

	/**
	 * @param {MouseEvent} e
	 */
	dragStart(e) {
		if (!this.cursor || this.resizeInitial) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		this.isClick = true;
		this.dragPos = { x: e.clientX, y: e.clientY };
		this.cursor.style.cursor = 'grabbing';
	}

	/**
	 * @param {MouseEvent} e
	 */
	dragEnd(e) {
		if (!this.dragPos || !this.cursor || this.resizeInitial) return;
		let diff = { x: e.clientX - this.dragPos.x, y: e.clientY - this.dragPos.y };
		this.pos = { x: this.pos.x + diff.x, y: this.pos.y + diff.y };
		this.dragPos = null;
		this.cursor.style.cursor = 'grab';
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
