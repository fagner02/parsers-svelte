let a = 9;
while (true) {
    cut();
}
async function firstAlg() {
    try {
        await wait(100);
        await loadGrammar();
        await addPause();

        await addProdToStacks($rules[0].left);

        while ($symbolStack.length > 0) {
            if ($posStack[$posStack.length - 1].data == -1) {
                await selectLSymbol('g', $symbolStack[$symbolStack.length - 1].data, 'blue', false);
            }
            if (!firstIndexes.has($rules[$symbolStack[$symbolStack.length - 1].data]?.left)) {
                await firstSet.addSetRow(
                    $symbolStack[$symbolStack.length - 1].data,
                    $symbolStack[$symbolStack.length - 1].text
                );
            }

            while (true) {
                let symbol = await nextProdSymbol($symbolStack[$symbolStack.length - 1].data);

                if (symbol === null) {
                    await posStackElement.removeFromStack($posStack.length - 1);

                    let topRule = $rules[$symbolStack[$symbolStack.length - 1].data];
                    await symbolStackElement.removeFromStack($symbolStack.length - 1);
                    await wait(1000);
                    if ($symbolStack.length > 0) {
                        let lastRule = $rules[$symbolStack[$symbolStack.length - 1].data];
                        await firstSet.joinSets(
                            $first[firstIndexes.get(topRule.left)].right,
                            firstIndexes.get(lastRule.left)
                        );
                    }
                    if ($symbolStack.length == 0) {
                        for (let i0 = 0; i0 < nt.length; i0++) {
                            if (!firstIndexes.has(nt[i0])) {
                                await addProdToStacks(nt[i0]);
                            }
                        }
                    }
                    break;
                }
                if (nt.includes(symbol)) {
                    if (firstIndexes.has(symbol)) {
                        await firstSet.joinSets(
                            $first[firstIndexes.get(symbol)].right,
                            firstIndexes.get($rules[$symbolStack[$symbolStack.length - 1].data].left)
                        );
                    } else {
                        await wait(1000);
                        await addProdToStacks(symbol);
                        break;
                    }
                } else {
                    let index = firstIndexes.get($rules[$symbolStack[$symbolStack.length - 1].data].left);
                    await firstSet.joinSets([symbol], index);
                }
            }
        }
        limitHit();
        addPause();
    } catch {}
}
