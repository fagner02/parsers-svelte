import { noJumpWait, wait } from '$lib/flowControl';

export class SyntaxTreeClass {
	id = '';
	vGap = 30;
	vGapPoint = this.vGap / 1.9;
	width = $state(0);
	height = $state(0);
	updating = $state(false);
	blockSize = 30;
	boxWidth = $state(0);
	count = 0;
	floating = false;
	/** @type {SVGGElement?} */
	svg = null;
	/** @type {Element?} */
	parentElement = null;
	/**@type {import('@/types').nodeId[]} */
	treeTop = [];
	/**@type {import('@/types').node[][]}*/
	levels = $state([[]]);

	constructor() {
		this.resetTree = this.resetTree.bind(this);
		this.setSvg = this.setSvg.bind(this);
		this.addToSvg = this.addToSvg.bind(this);
		this.addFloatingToSvg = this.addFloatingToSvg.bind(this);
		this.addParentToSvg = this.addParentToSvg.bind(this);
		this.addToTree = this.addToTree.bind(this);
		this.addFloatingNode = this.addFloatingNode.bind(this);
		this.addParent = this.addParent.bind(this);
		this.loadSyntaxTree = this.loadSyntaxTree.bind(this);
		this.loadFloatingTree = this.loadFloatingTree.bind(this);
		this.updateLevel = this.updateLevel.bind(this);
		this.updateFloatingLevel = this.updateFloatingLevel.bind(this);
		this.updateSize = this.updateSize.bind(this);
		this.setDPath = this.setDPath.bind(this);
		this.getLeftmost = this.getLeftmost.bind(this);
		this.addSpaceForNewNode = this.addSpaceForNewNode.bind(this);
		this.initializeTree = this.initializeTree.bind(this);
		this.findNode = this.findNode.bind(this);
	}

	/**
	 * @param {SVGGElement} comp
	 */
	async setSvg(comp) {
		return new Promise(async (resolve, reject) => {
			try {
				this.svg = comp;
				this.parentElement = /**@type {Element}*/ (document.querySelector(`#svg-box${this.id}`));
				this.boxWidth = /**@type {number}*/ (this.parentElement?.clientWidth);
				this.width = this.boxWidth;

				await wait(this.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} data
	 */
	findNode(data) {
		/**@type {import('@/types').nodeId[]}*/
		let nodes = [{ level: 0, index: 0 }];

		while (nodes.length > 0) {
			const nodeId = /**@type {import('@/types').nodeId}*/ (nodes.pop());
			const node = this.levels[nodeId.level][nodeId.index];
			if (node === null) return;
			if (node.data === data && !node.done) {
				return node;
			}

			if (this.levels.length <= nodeId.level + 1) continue;

			for (let i = this.levels[nodeId.level + 1].length - 1; i > -1; i--) {
				if (this.levels[nodeId.level + 1][i].parentIndex === nodeId.index) {
					nodes.push({ level: nodeId.level + 1, index: this.levels[nodeId.level + 1][i].index });
				}
			}
		}
	}

	/**
	 * @param {number} level
	 */
	updateFloatingLevel(level) {
		for (let j = level; j < this.levels.length; j++) {
			for (let i = 0; i < this.levels[j].length; i++) {
				let item = this.levels[j][i];

				if (item.parentIndex === -1) continue;
				let parent = this.levels[item.parentLevel][item.parentIndex];
				this.setDPath(item, parent);
			}
		}
		this.levels = this.levels;
	}

	/**
	 * @param {{level: number, index: number, y: number, x: number}} parent
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} nodeId
	 * @param {boolean} shouldWait
	 */
	async addToSvg(parent, data, newItemIndex, nodeId, shouldWait) {
		return new Promise(async (resolve, reject) => {
			try {
				if (
					parent.level === -1 &&
					this.levels[parent.level + 1].length === 1 &&
					this.levels[parent.level + 1][0].index === nodeId
				) {
					return resolve(null);
				}

				this.addSpaceForNewNode(parent.level + 1, newItemIndex);
				this.updateLevel(parent.level + 2);

				this.levels[parent.level + 1].splice(newItemIndex, 0, {
					data: data,
					done: false,
					level: parent.level + 1,
					index: newItemIndex,
					parentIndex: parent.index,
					parentLevel: -1,
					opacity: 0,
					x: (newItemIndex + 1) * (this.width / (this.levels[parent.level + 1].length + 2)),
					y: this.vGap + parent.y + this.blockSize / 2,
					width: 0,
					d: '',
					dashOffset: 100,
					id: this.count++
				});

				this.levels = this.levels;
				await noJumpWait(0);

				let newNode = this.levels[parent.level + 1][newItemIndex];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text${this.id}-${newNode.id}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				this.blockSize = bbox.height;

				this.setDPath(newNode, parent);

				newNode.dashOffset = 0;
				this.levels = this.levels;
				this.height = this.svg?.getBBox().height ?? 0 + 100;
				if (shouldWait) await wait(this.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} data
	 * @param {boolean} shouldWait
	 */
	async addFloatingToSvg(data, shouldWait) {
		return new Promise(async (resolve, reject) => {
			try {
				const lastLevel = this.levels.length - 1;
				const index = this.levels[lastLevel].length;

				this.addSpaceForNewNode(lastLevel, index);

				this.levels[lastLevel].splice(index, 0, {
					data: data,
					done: false,
					level: lastLevel,
					index: index,
					parentIndex: -1,
					parentLevel: -1,
					opacity: 0,
					x: (index + 1) * (this.width / (this.levels[lastLevel].length + 2)),
					y: this.vGap + this.vGap * lastLevel + (this.blockSize / 2) * lastLevel,
					width: 0,
					d: '',
					dashOffset: 100,
					id: this.count++
				});
				this.treeTop.push({
					level: lastLevel,
					index: index
				});
				this.levels = this.levels;
				try {
					await wait(this.id, 100);
				} catch (e) {
					console.log(e);
					return reject(e);
				}
				let newNode = this.levels[lastLevel][index];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text${this.id}-${newNode.id}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				this.levels = this.levels;
				this.blockSize = bbox.height;
				this.height = this.svg?.getBBox().height ?? 0 + 100;
				if (shouldWait) await wait(this.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {string} data
	 * @param {number} newItemIndex
	 * @param {number} level
	 * @param {boolean} shouldWait
	 */
	async addParentToSvg(data, newItemIndex, level, shouldWait = true) {
		return new Promise(async (resolve, reject) => {
			try {
				this.addSpaceForNewNode(level, newItemIndex);
				this.updateFloatingLevel(level + 1);

				this.levels[level].splice(newItemIndex, 0, {
					data: data,
					done: false,
					level: level,
					index: newItemIndex,
					parentIndex: -1,
					parentLevel: -1,
					opacity: 0,
					x: (newItemIndex + 1) * (this.width / (this.levels[level].length + 2)),
					y: this.vGap + this.vGap * level + (this.blockSize / 2) * level,
					width: 0,
					d: '',
					dashOffset: 100,
					id: this.count++
				});
				this.levels = this.levels;
				try {
					await wait(this.id, 100);
				} catch (e) {
					return reject(e);
				}
				let newNode = this.levels[level][newItemIndex];
				let bbox = /**@type {SVGTextElement}*/ (
					document.querySelector(`#parse-text${this.id}-${newNode.id}`)
				)?.getBBox();
				if (!bbox) return resolve(null);
				newNode.opacity = 1;
				newNode.width = bbox.width;
				this.levels = this.levels;
				this.height = this.svg?.getBBox().height ?? 0 + 100;
				if (shouldWait) await wait(this.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {number} level
	 * @param {number} index
	 */
	getLeftmost(level, index) {
		let leftmostLoc = this.levels[level][index];

		for (let i = leftmostLoc.level + 1; i < this.levels.length; i++) {
			for (let j = 0; j < this.levels[i].length; j++) {
				if (
					this.levels[i][j].parentIndex === leftmostLoc.index &&
					this.levels[i][j].parentLevel === leftmostLoc.level
				) {
					leftmostLoc = this.levels[i][j];
					break;
				}
			}
		}
		return leftmostLoc;
	}

	/**
	 * @param {import('@/types').node} item
	 * @param {{ x: number; y: number; }} parent
	 */
	setDPath(item, parent) {
		const pos = {
			x: item.x,
			y: item.y - this.blockSize / 2 - 4
		};
		const parentPos = {
			x: parent.x,
			y: parent.y + this.blockSize / 2
		};
		item.d = `M ${parentPos.x} ${parentPos.y} C ${parentPos.x} ${parentPos.y + this.vGapPoint}, ${pos.x} ${pos.y - this.vGapPoint}, ${pos.x} ${pos.y}`;
	}

	/**
	 * @param {string} parentData
	 * @param {string[]} children
	 * @param {boolean} shouldWait
	 */
	async addParent(parentData, children, shouldWait = true) {
		return new Promise(async (resolve, reject) => {
			try {
				let matchLoc = -1;
				for (let j = 0; j < this.treeTop.length; j++) {
					let match = true;
					for (let i = 0; i < children.length; i++) {
						if (j + i >= this.treeTop.length) {
							match = false;
							break;
						}
						const symbol = this.levels[this.treeTop[j + i].level][this.treeTop[j + i].index].data;
						if (symbol !== children[i]) {
							match = false;
							break;
						}
					}
					if (match) {
						matchLoc = j;
						break;
					}
				}

				let highestLevel = this.treeTop[matchLoc].level;
				for (let i = matchLoc + 1; i < matchLoc + children.length; i++) {
					if (this.treeTop[i].level < highestLevel) highestLevel = this.treeTop[i].level;
				}

				if (highestLevel - 1 < 0) {
					highestLevel = 1;
					this.levels.unshift([]);
					for (let i = 0; i < this.treeTop.length; i++) {
						this.treeTop[i].level = this.treeTop[i].level + 1;
					}
					for (let j = 0; j < this.levels.length; j++) {
						for (let i = 0; i < this.levels[j].length; i++) {
							let node = this.levels[j][i];
							node.level = j;
							if (node?.parentLevel !== -1) {
								node.parentLevel += 1;
							}
							node.y = this.vGap + this.vGap * j + (this.blockSize / 2) * j;
							if (node.parentIndex === -1) continue;

							this.setDPath(node, this.levels[node.parentLevel][node.parentIndex]);
						}
					}
				}

				this.levels = this.levels;
				if (shouldWait) await wait(this.id, 500);

				let parentLevel = highestLevel - 1;
				let matchLeftmost = this.getLeftmost(
					this.treeTop[matchLoc].level,
					this.treeTop[matchLoc].index
				);
				let neighborIndex = 0;
				if (this.levels[parentLevel].length > 0) {
					let neighborLeftmost = this.getLeftmost(parentLevel, neighborIndex);
					while (neighborLeftmost.index < matchLeftmost.index) {
						neighborIndex++;
						if (neighborIndex >= this.levels[parentLevel].length) break;
						neighborLeftmost = this.getLeftmost(parentLevel, neighborIndex);
					}
				}
				let parentIndex = neighborIndex;

				await this.addParentToSvg(parentData, parentIndex, parentLevel, shouldWait);

				for (let i = matchLoc; i < matchLoc + children.length; i++) {
					let loc = this.treeTop[i];
					let node = this.levels[loc.level][loc.index];
					this.setDPath(node, this.levels[parentLevel][parentIndex]);

					node.parentIndex = parentIndex;
					node.parentLevel = parentLevel;
				}
				this.levels = this.levels;
				if (shouldWait) await wait(this.id, 500);
				for (let i = matchLoc; i < matchLoc + children.length; i++) {
					let loc = this.treeTop[i];
					let node = this.levels[loc.level][loc.index];
					node.dashOffset = 0;
				}
				this.levels = this.levels;
				this.treeTop.splice(matchLoc, children.length, {
					level: parentLevel,
					index: parentIndex
				});
				if (shouldWait) await wait(this.id, 500);
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {number} level
	 */
	updateLevel(level) {
		for (let j = level; j < this.levels.length; j++) {
			for (let i = 0; i < this.levels[j].length; i++) {
				let item = this.levels[j][i];

				let parent =
					j === 0
						? { x: this.width / 2, y: -this.vGap / 2, height: this.vGap }
						: this.levels[j - 1][item.parentIndex];

				item.x = (i + 1) * (this.width / (this.levels[j].length + 1));
				item.y = this.vGap + parent.y + this.blockSize / 2;
				item.index = i;
				this.setDPath(item, parent);
			}
		}
		this.levels = this.levels;
	}

	async updateSize() {
		return new Promise(async (resolve, reject) => {
			try {
				this.boxWidth = /**@type {number}*/ (this.parentElement?.clientWidth);
				this.width = this.boxWidth;

				this.updating = true;

				if (this.floating) {
					this.updateFloatingLevel(0);
				} else {
					this.updateLevel(0);
				}
				await wait(this.id, 10);
				this.updating = false;
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {number} level
	 * @param {number} newNodeIndex
	 */
	addSpaceForNewNode(level, newNodeIndex) {
		for (let i = 0; i < this.levels[level].length; i++) {
			let item = this.levels[level][i];
			item.index = i < newNodeIndex ? i : i + 1;
			item.x = (item.index + 1) * (this.width / (this.levels[level].length + 2));
			if (item.parentIndex === -1) continue;
			let parentLevel =
				item.parentLevel === -1 ? level - 1 : this.levels.length - item.parentLevel - 1;
			let parent = this.levels[this.floating ? item.parentLevel : parentLevel][item.parentIndex];
			this.setDPath(item, parent);
		}
		level++;
		if (this.floating && level < this.levels.length) {
			for (let i = 0; i < this.levels[level].length; i++) {
				let item = this.levels[level][i];
				if (item.parentIndex === -1) continue;
				this.setDPath(item, this.levels[item.parentLevel][item.parentIndex]);
			}
		}

		this.levels = this.levels;
	}
	/**
	 * @param {string[]} data
	 * @param {boolean} shouldWait
	 */
	async addFloatingNode(data, shouldWait = true) {
		return new Promise(async (resolve, reject) => {
			try {
				for (let i = 0; i < data.length; i++) {
					await this.addFloatingToSvg(data[i], shouldWait);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}
	/**
	 * @param {string[]} data
	 * @param {string} parentData
	 * @param {boolean} shouldWait
	 */
	async addToTree(data, parentData, shouldWait = false) {
		return new Promise(async (resolve, reject) => {
			try {
				const parent = /**@type {import('@/types').node}*/ (this.findNode(parentData));
				if (parent === undefined) return resolve(null);

				parent.done = true;
				if (this.levels.length <= parent.level + 1) this.levels.push([]);
				let levelIndex = this.levels[parent.level + 1].findIndex(
					(x) => x.parentIndex === parent.index + 1
				);

				levelIndex = levelIndex === -1 ? this.levels[parent.level + 1].length : levelIndex;

				for (let i = 0; i < data.length; i++) {
					await this.addToSvg(parent, data[i], levelIndex + i, i, shouldWait);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * @param {{data: string[], parentData: string}[]} levels
	 * @param {string} startingSymbol
	 */
	async loadSyntaxTree(levels, startingSymbol) {
		return new Promise(async (resolve, reject) => {
			try {
				this.initializeTree(startingSymbol, false);
				for (let i of levels) {
					await this.addToTree(i.data, i.parentData, false);
				}
				resolve(null);
			} catch (e) {
				reject(e);
			}
		});
	}

	/**@param {{data: string[], parent?: string}[]} levels*/
	async loadFloatingTree(levels) {
		return new Promise(async (resolve, _) => {
			try {
				for (let i of levels) {
					if (i.parent !== undefined) {
						await this.addParent(i.parent, i.data, false);
					} else {
						await this.addFloatingNode(i.data, false);
					}
				}
				resolve(null);
			} catch (e) {
				resolve(null);
			}
		});
	}

	/**
	 * @param {string} symbol
	 * @param {boolean} shouldWait
	 */
	async initializeTree(symbol, shouldWait = true) {
		await this.addToSvg(
			{
				level: -1,
				index: 0,
				x: this.width / 2,
				y: -this.vGap / 2
			},
			symbol,
			0,
			0,
			shouldWait
		);
	}

	resetTree() {
		this.levels = [[]];
		this.count = 0;
		this.treeTop = [];
	}
}
