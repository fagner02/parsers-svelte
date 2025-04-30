/**
 * @param {string} inputString
 * @param {any[]} augRules
 * @param {{ get: (arg0: string) => { (): any; new (): any; get: { (arg0: any): { (): any; new (): any; data: any; }; new (): any; }; }; }} table
 */
function slrparsing(inputString, augRules, table) {
	const stateStack = ['0']; // Pilha de estados: [estado_atual, ...]
	const inputStack = [...inputString.replaceAll(' ', '').split('').reverse(), '$'];

	while (true) {
		const currentState = stateStack[stateStack.length - 1];
		const lookahead = inputStack[inputStack.length - 1];
		const action = table.get(`s${currentState}`)?.get(lookahead);

		// Casos de aceitação/rejeição
		if (!action?.data) return false;
		if (action.data === 'a') return true;

		// Ação SHIFT
		if (action.data.startsWith('s')) {
			const newState = action.data.slice(1);
			inputStack.pop();
			stateStack.push(lookahead, newState);
		}
		// Ação REDUCE
		else if (action.data.startsWith('r')) {
			const ruleIndex = parseInt(action.data.slice(1));
			const production = augRules[ruleIndex];

			// Remove elementos manualmente com loop
			if (production.right[0] !== '') {
				for (let i = 0; i < production.right.length; i++) {
					stateStack.pop(); // Remove um elemento por iteração
					stateStack.pop(); // Remove o estado correspondente
				}
			}

			// Operação GOTO
			const gotoState = table
				.get(`s${stateStack[stateStack.length - 1]}`)
				?.get(production.left)?.data;

			if (!gotoState) return false;
			stateStack.push(production.left, gotoState);
		}
	}
}
