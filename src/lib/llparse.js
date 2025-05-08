/**
 * @param {any} startingSymbol
 * @param {string[]} inputString
 * @param {string | any[]} nt
 * @param {{ get: (arg0: any) => { (): any; new (): any; get: { (arg0: any): any; new (): any; }; }; }} table
 * @param {{ [x: string]: { right: any; }; }} rules
 */
function parsing(startingSymbol, inputString, nt, table, rules) {
	const symbolStack = ['$', startingSymbol];
	const inputStack = [...inputString.reverse(), '$'];

	while (inputStack.length > 0) {
		const topSymbol = symbolStack[symbolStack.length - 1];
		const topInput = inputStack[inputStack.length - 1];

		if (nt.includes(topSymbol)) {
			const production = table.get(topSymbol)?.get(topInput);
			if (production === undefined || production === -1) return false;

			symbolStack.pop();
			if (!rules[production].right.includes('')) {
				symbolStack.push(...[...rules[production].right].reverse());
			}
		} else {
			if (topSymbol !== topInput) return false;
			symbolStack.pop();
			inputStack.pop();
		}
	}

	return symbolStack.length === 0 && inputStack.length === 0;
}
