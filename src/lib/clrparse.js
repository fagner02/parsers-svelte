/**
 * @param {string} inputString
 * @param {any[]} augRules
 * @param {{ get: (arg0: string) => { (): any; new (): any; get: { (arg0: any): { (): any; new (): any; data: any; }; new (): any; }; }; }} table
 */
function clrparsing(inputString, augRules, table) {
	const stateStack = ['0']; // Pilha de estados: [estado_atual]
	const inputStack = [...inputString.replaceAll(' ', '').split('').reverse(), '$'];

	while (true) {
		const currentState = stateStack[stateStack.length - 1];
		const lookahead = inputStack[inputStack.length - 1];
		const action = table.get(`s${currentState}`)?.get(lookahead);

		// Caso de erro
		if (!action?.data) return false;

		// Aceitação
		if (action.data === 'a') return true;

		// Ação SHIFT
		if (action.data.startsWith('s')) {
			const newState = action.data.slice(1);
			stateStack.push(lookahead, newState); // Empilha símbolo + estado
			inputStack.pop();
		}

		// Ação REDUCE
		if (action.data.startsWith('r')) {
			const ruleIndex = parseInt(action.data.slice(1));
			const production = augRules[ruleIndex];

			// Remove elementos correspondentes à produção
			if (production.right[0] !== '') {
				for (let i = 0; i < production.right.length; i++) {
					stateStack.pop(); // Remove estado
					stateStack.pop(); // Remove símbolo
				}
			}

			// Calcula GOTO
			const gotoState = table
				.get(`s${stateStack[stateStack.length - 1]}`)
				?.get(production.left)?.data;

			if (!gotoState) return false;
			stateStack.push(production.left, gotoState); // Empilha NT + novo estado
		}
	}
}
