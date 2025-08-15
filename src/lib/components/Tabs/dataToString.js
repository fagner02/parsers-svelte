import { augRules, rules } from '$lib/utils';

/**
 * @param {Map<any, Map<any, any>>} data
 * @param {string} title
 * @param {{key?: function(any): string, cell?: function(any): string}} convert
 */
export function tableToString(data, title, convert) {
	let result = '';
	const innerKeysArray = data.values().next().value?.keys().toArray() || [];

	const outerKeysArray = Array.from(data.keys()).map((key) =>
		convert.key ? convert.key(key) : key.toString()
	);
	const outerKeyWidth = Math.max(title.length, ...outerKeysArray.map((k) => k.toString().length));

	const innerKeyWidths = innerKeysArray.map((innerKey) =>
		Math.max(
			innerKey.length,
			...Array.from(data.values()).map((innerMap) => {
				let value = innerMap.get(innerKey);
				return convert.cell
					? convert.cell(value).replaceAll('->', '>').length
					: (value ?? '').toString().replaceAll('->', '>').length;
			})
		)
	);

	let header = title.padEnd(outerKeyWidth);
	innerKeysArray.forEach((key, i) => {
		header += ' | ' + key.padEnd(innerKeyWidths[i]);
	});
	result += header + '\n';

	let separator = '-'.repeat(outerKeyWidth);
	innerKeysArray.forEach((_, i) => {
		separator += '-+-' + '-'.repeat(innerKeyWidths[i]);
	});

	result += separator + '\n';
	for (let [outerKey, innerMap] of data.entries()) {
		let row = convert.key ? convert.key(outerKey) : outerKey;
		row = row.padEnd(outerKeyWidth);
		innerKeysArray.forEach((innerKey, i) => {
			let value = innerMap.get(innerKey);
			value = convert.cell ? convert.cell(value) : value ?? '';
			value = value.replaceAll('->', '>').padEnd(innerKeyWidths[i]);
			row += ' | ' + value.replaceAll('>', '->');
		});
		result += row + '\n';
	}
	return result;
}

/**
 *
 * @param {(import("@/types").LR1State|import("@/types").LR0State)[]} states
 */
export function automatonToString(states) {
	let content = '';
	for (let s of states) {
		content += `s${s.index}: {`;
		for (let [index, item] of s.items.entries()) {
			content += `[${augRules[item.ruleIndex].left} -> `;
			let right = augRules[item.ruleIndex].right;
			content += `${right.slice(0, item.pos).join(' ')}.${right.slice(item.pos).join(' ')},`;
			content += item.lookahead ? `{${[...item.lookahead].join(', ')}}` : '';
			content += `]`;
			if (index < s.items.length - 1) {
				content += '; ';
			}
		}
		content += '}\n';
	}
	return content;
}

/**
 * @param {Map<number, Set<string>> } set
 */
export function firstToString(set) {
	return set
		.entries()
		.map((x) => `${x[0]}.${rules[x[0]].left}: {${[...x[1]].join(', ')}}`)
		.toArray()
		.join('\n');
}

/**
 * @param {Map<string, Set<string>> } set
 */
export function followToString(set) {
	return set
		.entries()
		.map((x) => `${x[0]}: {${[...x[1]].join(', ')}}`)
		.toArray()
		.join('\n');
}
