async function follow() {
	try {
		await wait(100);
		await loadGrammar();
		await addPause();

		instruction = 'Since this thing is like that we have add to the stack';
		await codeCard?.highlightLines([0, 1]);

		await followSetElement?.addSetRow(rules[0].left, rules[0].left);
		await codeCard?.highlightLines([2]);

		await followSetElement?.joinSets(['$'], ['$'], null, rules[0].left);

		for (let i = 0; i < rules.length; i++) {
			await codeCard?.highlightLines([3]);

			await grammarFuncs?.selectFor(`gset${i}`);
			for (let j = 0; j < rules[i].right.length; j++) {
				await codeCard?.highlightLines([4]);

				const symbol = rules[i].right[j];

				await codeCard?.highlightLines([5]);
				let followingSymbolIndex = j + 1;
				let followingSymbol = j + 1 == rules[i].right.length ? null : rules[i].right[j + 1];

				await codeCard?.highlightLines([6]);
				if (!nt.includes(symbol)) {
					await codeCard?.highlightLines([7]);

					await selectRSymbol('g', i, j, colors.green, false);
					continue;
				}
				await codeCard?.highlightLines([8]);

				await selectRSymbol('g', i, j, colors.blue, false);

				if (!followIndexes.has(symbol)) {
					await codeCard?.highlightLines([9]);

					await followSetElement?.addSetRow(symbol, symbol, `gr${i}-${j}`);
				}

				await codeCard?.highlightLines([10]);
				let pos = 1;
				while (true) {
					await codeCard?.highlightLines([11]);
					await codeCard?.highlightLines([12]);
					if (followingSymbol === null) {
						await codeCard?.highlightLines([13]);
						if (!joinSetElement?.has(symbol)) {
							await codeCard?.highlightLines([14]);

							await joinSetElement?.addSetRow(symbol, symbol, `gr${i}-${j}`);
						}
						await codeCard?.highlightLines([15]);
						if (rules[i].left !== symbol) {
							await codeCard?.highlightLines([16]);
							await joinSetElement?.joinSets(
								[rules[i].left],
								[rules[i].left],
								null,
								symbol,
								`gl${i}`
							);
						}
						await codeCard?.highlightLines([17]);
						break;
					}
					await codeCard?.highlightLines([18]);

					await selectRSymbol('g', i, j + 1, colors.orange, false);
					if (nt.includes(followingSymbol)) {
						await codeCard?.highlightLines([19]);
						let empty = false;

						for (let [key, item] of $firstSet.entries()) {
							await codeCard?.highlightLines([20]);
							await codeCard?.highlightLines([21]);
							if (item.left === followingSymbol) {
								await codeCard?.highlightLines([22]);
								if (item.right.includes('')) {
									await codeCard?.highlightLines([23, 24]);
									empty = true;
									continue;
								}
								await codeCard?.highlightLines([25, 26]);

								await followSetElement?.joinSets(
									item.right,
									item.right,
									null,
									symbol,
									`firstl${key}`
								);
							}
						}
						await codeCard?.highlightLines([27]);
						if (!empty) {
							await codeCard?.highlightLines([28]);
							break;
						}
						await codeCard?.highlightLines([29, 30]);
						followingSymbolIndex = j + 1 + pos;
						followingSymbol =
							j + 1 + pos == rules[i].right.length ? null : rules[i].right[j + 1 + pos];
						pos++;
						await codeCard?.highlightLines([31]);
					} else {
						await codeCard?.highlightLines([31]);
						await codeCard?.highlightLines([32]);

						await followSetElement?.joinSets(
							[followingSymbol],
							[followingSymbol],
							null,
							symbol,
							`gr${i}-${followingSymbolIndex}`
						);
						await codeCard?.highlightLines([33]);
						break;
					}
				}

				await selectRSymbol('g', i, j, colors.green, false);
			}
		}
		grammarFuncs?.hideSelect();
		for (let item of joinIndexes.keys()) {
			await codeCard?.highlightLines([34]);
			await codeCard?.highlightLines([35]);
			if (joinSetElement?.get(item)?.length === 0) {
				await codeCard?.highlightLines([36]);
				continue;
			}
			await codeCard?.highlightLines([37]);
			await codeCard?.highlightLines([38]);

			await joinStackElement?.addToStack(
				item,
				item,
				'',
				`${joinSetElement?.getSetId()}l${joinIndexes.get(item)}`
			);
			await addPause();

			while ($joinStack.length > 0) {
				await codeCard?.highlightLines([39]);
				await codeCard?.highlightLines([40, 41]);
				const topKey = $joinStack[$joinStack.length - 1].data;
				const top = /**@type {Array<string>}*/ (joinSetElement?.get(topKey));

				await codeCard?.highlightLines([42]);
				let nextSet = joinSetElement?.get(top[0]);
				if (nextSet !== undefined && !(nextSet.length === 0)) {
					await codeCard?.highlightLines([43]);

					await joinStackElement?.addToStack(
						top[0],
						top[0],
						'',
						`${joinSetElement?.getSetId()}l${joinIndexes.get(top[0])}`
					);
					await codeCard?.highlightLines([44]);
					continue;
				}

				await selectRSymbol(
					/**@type {string}*/ (joinSetElement?.getSetId()),
					/**@type {number}*/ (joinIndexes.get(topKey)),
					0,
					colors.green
				);

				const setToJoin = /**@type {Array<string>}*/ (followSetElement?.get(top[0]));
				await codeCard?.highlightLines([45, 46]);

				await followSetElement?.joinSets(
					setToJoin,
					setToJoin,
					null,
					topKey,
					`${followSetElement.getSetId()}l${followIndexes.get(top[0])}`
				);
				await codeCard?.highlightLines([47]);

				await joinSetElement?.remove(topKey, top[0]);

				await codeCard?.highlightLines([48]);
				if (joinSetElement?.get(topKey)?.length === 0) {
					await codeCard?.highlightLines([49]);

					await joinStackElement?.removeFromStack($joinStack.length - 1);
				}
			}
		}

		limitHit();
		await addPause();
	} catch (e) {
		console.log(e);
	}
}
