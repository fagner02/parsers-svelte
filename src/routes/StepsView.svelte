<script>
	import { getTextWidth, wait } from '$lib/textwidth';
	import { onMount } from 'svelte';

	let grammar = 'S -> A B\nA -> a a\nB -> bb';
	/**
	 * @type {Array.<{left: string, right: Array.<string>}>}
	 *
	 */
	export let rules = [];
	export let fontSize = 15;
	export let lineHeight = 23;
	export let charWidth = 0;
	export let floatingPadding = { h: 5, v: 2 };

	let maxfirst = { index: 0, value: 0 };
	let maxrule = { index: 0, value: 0 };
	console.log(rules);

	onMount(async () => {
		charWidth = getTextWidth('0', fontSize);

		grammar.split('\n').forEach((r) => {
			let s = r.split('->');

			if (s.length > 1) {
				rules.push({ left: s[0].replaceAll(' ', ''), right: s[1].replaceAll(' ', '').split('') });
				console.log(rules.length);
				if (rules[rules.length - 1].right.length > maxrule.value) {
					maxrule = { index: rules.length - 1, value: rules[rules.length - 1].right.length };
				}
			}
		});
		console.log(rules);
		document.querySelector('#grammar').style.height = `${lineHeight * rules.length}px`;

		// document.querySelector('#grammar').style.width =
		// 	`${getTextWidth(`${rules[maxrule.index].left} -> ${rules[maxrule.index].right.join('')}`, fontSize) + 5}px`;

		first.push({ left: 'S', right: [], showRight: false, whole: [] });
		console.log(first);
		document.querySelector('.card.first-card').style.height = `${lineHeight * first.length}px`;
		// document.querySelector('.card.first-card').style.width =
		// 	`${getTextWidth(`${first[maxfirst.index].left}: { ${first[maxfirst.index].right.join('')} }`, fontSize) + 5}px`;
		document.querySelector('.card.first-card').style.maxWidth = '0px';
		await wait(300);
		// first = first;
		rules = rules;
		await wait(200);
		// document.querySelector('#l0').style.background = 'hsl(200, 50%, 50%)';
		document.querySelector('#l0').classList.add('block');
		document.querySelector('#l0').classList.add('blue');
		// let rect = document.querySelector('#l0').getBoundingClientRect();
		// let parent = document.querySelector('.steps').getBoundingClientRect();
		// let floating = document.querySelector('.floating');
		// floating.style.opacity = '1';
		// floating.style.top = `${rect.top - parent.top - floatingPadding.v}px`;
		// floating.style.left = `${rect.left - parent.left - floatingPadding.h}px`;

		await wait(300);
		first = first;
		await wait(100);
		console.log(`${document.querySelector('.card.first-card').innerHTML}px`);
		document.querySelector('.card.first-card').style.maxWidth =
			`${document.querySelector('.card.first-card').scrollWidth}px`;

		await wait(300);
		// rect = document.querySelector('#ls').getBoundingClientRect();

		await wait(500);
		// floating.style.top = `${rect.top - parent.top - floatingPadding.v}px`;
		// floating.style.left = `${rect.left - parent.left - floatingPadding.h}px`;
		// await wait(500);
		// floating.style.opacity = 0;

		await wait(500);
		// floating.style.display = 'none';

		first[first.length - 1].showRight = true;

		await wait(0);

		document.querySelector('.card.first-card').style.maxWidth =
			`${document.querySelector('.card.first-card').scrollWidth}px`;
		await wait(500);
		const left = [':', '{', ' '];
		const right = ['}'];

		for (let i = 0; i < left.length; i++) {
			first[first.length - 1].whole = [...first[first.length - 1].whole, left[i]];

			await wait(0);
			document.querySelector('.card.first-card').style.maxWidth =
				`${document.querySelector('.card.first-card').scrollWidth}px`;
			await wait(100);
		}
		for (let i = 0; i < right.length; i++) {
			first[first.length - 1].whole = [...first[first.length - 1].whole, right[i]];

			await wait(0);
			document.querySelector('.card.first-card').style.maxWidth =
				`${document.querySelector('.card.first-card').scrollWidth}px`;
			await wait(100);
		}
		// let  = [':', '{', '}'];
		await wait(500);

		// for (let i = 0; i < 3; i++) {

		// 	first[first.length - 1].whole = [left, ...first[first.length - 1].right, right];

		// 	await wait(0);
		// 	document.querySelector('.card.first-card').style.maxWidth =
		// 		`${document.querySelector('.card.first-card').scrollWidth}px`;
		// 	await wait(100);
		// }
		// let parent = document.querySelector('.steps').getBoundingClientRect();
	});

	/**
	 * @type {Array.<{left: string, right: Array.<string>,showRight: boolean, whole: Array.<string>}>}
	 */
	export let first = [];
</script>

<div class="steps {$$props.class}" style="position: relative;">
	<div class="card" id="grammar">
		{#each rules as rule, i}
			<p style="line-height: {lineHeight}px; font-size: {fontSize}px">
				<span id="l{i}">{rule.left}</span>
				<span>{'->'}</span>
				<span>{rule.right.join('')}</span>
			</p>
		{/each}
	</div>
	<div class="card first-card">
		{#each first as f, index}
			<p
				id="fset{index}"
				style="line-height: {lineHeight}px;font-size:{fontSize}px; padding: 0px; width: fit-content"
			>
				<span id="ls">{f.left}</span>
				{#if f.showRight}
					{#each [...f.whole] as text}
						<span
							>{#if text != ' '}
								{text}
							{:else}
								&nbsp;
							{/if}</span
						>
					{/each}
				{/if}
			</p>
		{/each}
	</div>

	<!-- <p class="floating" style="padding: {floatingPadding.v}px {floatingPadding.h}px">S</p> -->
</div>

<style>
	.card {
		width: 0px;
		height: 0px;
		background: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 10px;
		padding: 5px 10px;
		margin: 5px;
		transition:
			width 0.3s,
			height 0.3s;
		overflow: hidden;
		width: fit-content;
		transition: max-width 0.5s;
	}

	.steps {
		display: flex;
		justify-content: center;
		align-items: start;
	}

	.floating {
		position: absolute;
		width: fit-content;
		background: hsl(200, 60%, 50%);
		color: white;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 6px;
		/* opacity: 0; */
		/* padding: ; */
		transition:
			top 0.5s,
			left 0.5s,
			opacity 0.5s;
	}

	.card > p > span {
		color: black;
		transition: color 0.3s;
	}

	.first-row {
		display: flex;
	}

	.first-card > p {
		padding: 0px;
		display: flex;
	}
	@keyframes appear {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.first-card > p > span {
		/* padding: 0px;
		display: flex; */
		/* opacity: 0; */
		/* transition: opacity 0.5s; */
		animation: appear 1s;
		z-index: 1;
	}
	@keyframes rotateAppear {
		from {
			transform: perspective(45px) rotateY(90deg);
		}
		to {
			transform: perspective(45px) rotateY(0deg);
		}
	}
	.block {
		position: relative;
		z-index: 0;
		color: white !important;
	}
	.block::after {
		content: '';
		position: absolute;
		z-index: -1;
		border-radius: 5px;
		transform: perspective(45px);
		--width: 100%;
		width: calc(var(--width) + 10px);
		--height: 23px;
		height: var(--height);
		top: 50%;
		translate: calc(var(--width) / -2) calc(var(--height) / -2);
		left: 50%;
		animation: rotateAppear 0.5s;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 6px;
	}

	.empty {
		position: relative;
		z-index: 0;
		color: black !important;
	}
	.empty::after {
		content: '';
		position: absolute;
		z-index: -1;
		border-radius: 5px;
		transform: perspective(45px);
		--width: 100%;
		width: calc(var(--width) + 8px);
		--height: 15px;
		height: var(--height);
		top: 50%;
		translate: calc(var(--width) / -2) calc(var(--height) / -2);
		left: 50%;
		animation: rotateAppear 0.5s;
		box-shadow: 0px 0px 5px 0px hsl(0, 0%, 0%, 30%);
		border-radius: 6px;
	}

	.blue::after {
		background: hsl(200, 60%, 50%);
	}
	.green::after {
		background: hsl(100, 60%, 50%);
	}
	.yellow::after {
		background: hsl(60, 60%, 50%);
	}
</style>
