async function clrTable() {
	if (stateElem) stateSelection = getSelectionFunctions(stateElem.getId());
	try {
		await loadGrammar();
		await wait(500);

		for (let s of automaton.states) {
			for (let i of s.items) {
				await addPause();
				if (i.pos === augRules[i.ruleIndex].right.length || augRules[i.ruleIndex].right[0] === '') {
					if (i.ruleIndex === 0) {
						await tableElem?.addToTable(
							{ action: 'a', state: i.ruleIndex },
							`a`,
							`s${s.index}`,
							'$'
						);
						continue;
					}
					for (let symbol of i.lookahead) {
						await tableElem?.addToTable(
							{ action: 'r', state: i.ruleIndex },
							`r${i.ruleIndex}`,
							`s${s.index}`,
							symbol
						);
					}
					continue;
				}
				let transition = automaton.transitions
					.get(s.index)
					?.get(augRules[i.ruleIndex].right[i.pos]);

				if (nt.includes(augRules[i.ruleIndex].right[i.pos])) {
					await tableElem?.addToTable(
						{ action: 'g', state: transition },
						`g${transition}`,
						`s${s.index}`,
						`${augRules[i.ruleIndex].right[i.pos]}`
					);
				} else {
					await tableElem?.addToTable(
						{ action: 's', state: transition },
						`s${transition}`,
						`s${s.index}`,
						`${augRules[i.ruleIndex].right[i.pos]}`
					);
				}
			}
		}
		limitHit();
		await addPause();
	} catch (e) {
		console.log(e);
	}
}
