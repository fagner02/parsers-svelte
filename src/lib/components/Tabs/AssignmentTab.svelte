<script>
	import { appendData, createFile, getFile } from '$lib/log';
	import FillSize from '@/Layout/FillSize.svelte';
	import { onMount } from 'svelte';

	let totalQuestions = $state(0);
	let totalAnswers = $state(0);
	let started = $state(false);
	let fileSent = $state(false);

	let answers = new Set();
	/**
	 * @param {Event} e
	 */
	function receiveInput(e) {
		const { name, value } = /**@type {HTMLInputElement}*/ (e.target);
		appendData(
			`form ${name},${value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\c')}`
		);
		localStorage.setItem('vansi-' + name, value);
		console.log('vansi-' + name);
		if (value.trim().length > 0) {
			answers.add(name);
		} else {
			answers.delete(name);
		}
		totalAnswers = answers.size;
	}
	let campus = $state('');
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		campus = urlParams.get('campus') ?? '';
		const inputs = document.querySelector('.form')?.querySelectorAll('input,textarea');
		inputs?.forEach((x) => {
			const name = /**@type {HTMLInputElement}*/ (x).name;
			const item = localStorage.getItem('vansi-' + name);
			console.log('vansi-' + name, item);
			if (item) {
				/**@type {HTMLInputElement}*/ (x).value = item;
				answers.add(name);
			}
		});
		totalQuestions = inputs?.length ?? 0;
		totalAnswers = answers.size;
		if (localStorage.getItem('vansi-file-sent')) {
			started = true;
			fileSent = true;
		}
	});
</script>

<FillSize class="unit">
	{#snippet content()}
		<div class="form">
			<div class="form-header">
				<button
					disabled={started}
					onclick={() => {
						createFile();
						started = true;
					}}>Iniciar</button
				>
				<p style="font-size: 0.9rem;align-content: center">
					Progresso: {totalAnswers}/{totalQuestions}
				</p>
				<button
					disabled={totalAnswers < totalQuestions || fileSent || !started}
					onclick={() => {
						fileSent = true;
						getFile();
					}}>{fileSent ? 'Finalizado' : 'Finalizar'}</button
				>
			</div>
			<FillSize class="form-content">
				{#snippet content()}
					<div
						class="fields"
						style={started && !fileSent ? 'opacity: 1' : 'pointer-events:none;opacity: 0.5'}
					>
						<hr style="margin-top: 0;" />
						<div style="display: flex;">
							<div class="field" style="flex: 1">
								<p>Nome Completo</p>
								<input oninput={receiveInput} name="name" id="name" />
							</div>
							<div class="field">
								<p>Matrícula</p>
								<input oninput={receiveInput} name="matricula" id="matricula" />
							</div>
						</div>
						<hr />
						<div class="field col">
							<p>
								1. Dado o conjunto first a seguir, forneça uma gramática que gera esse conjunto
								first
							</p>
							<pre>{`E: {(, id}
X: {+}
X: {ε}
T: {(, id}
T': {*}
T': {ε}
F: {(}
F: {id}`}</pre>
							<textarea name="q1" id="q1" oninput={receiveInput} rows="4"></textarea>
						</div>
						<hr />
						<div class="field col">
							<p>
								2. Dado o conjunto follow a seguir, forneça uma gramática que gera esse conjunto
								follow
							</p>
							<pre>
{`S: {$}
A: {C}
B: {a, C, $}`}</pre>
							<textarea name="q2" id="q2" oninput={receiveInput} rows="4"></textarea>
						</div>
						<hr />
						<div class="field col">
							<p>3. Dada a tabela slr a seguir, forneça uma gramática que gera essa tabela</p>
							<pre>{`estados | +  | (  | )  | id | $  | E  | T 
--------+----+----+----+----+----+----+---
s0      |    |    |    |    |    | g1 |   
s1      | s2 |    |    |    | a  |    |   
s2      |    | s3 |    | s4 |    |    | g5
s3      |    | s3 |    | s4 |    |    | g6
s4      | r3 |    | r3 |    | r3 |    |   
s5      | r1 |    |    |    | r1 |    |   
s6      |    |    | s7 |    |    |    |   
s7      | r2 |    | r2 |    | r2 |    |   
`}</pre>
							<textarea name="q3" id="q3" oninput={receiveInput} rows="4"></textarea>
						</div>
						<hr />
						<div class="field col">
							<p>4. Dada a tabela lr1 a seguir, forneça uma gramática que gera essa tabela</p>
							<pre>{`estados | c  | d  | $  | S  | C 
--------+----+----+----+----+---
s0      | s1 | s2 |    | g3 | g4
s1      | s1 | s2 |    |    | g5
s2      |    |    | r3 |    |   
s3      |    |    | a  |    |   
s4      |    |    | r1 |    |   
s5      |    |    | r2 |    |   
`}</pre>
							<textarea name="q4" id="q4" oninput={receiveInput} rows="4"></textarea>
						</div>
						<hr />
						<div class="field col">
							<p>5. Dê o conjunto First da seguinte gramática</p>
							<pre>{`Mass -> Shape Texture
Shape -> Circumscribed | Spiculated
Circumscribed -> Ccompactness Cspicindex
Spiculated -> Ecompactness Espicindex
Texture -> Contrast Acutance
Ccompactness -> cca | ccb
Cspic index -> sia | sib
Ecompactness -> ccb | ccc
Espic index -> sia | sib | sic
Contrast -> ca | cb | cc
Acutance -> aa`}</pre>
							<textarea name="q6" id="q6" oninput={receiveInput} rows="4"></textarea>
						</div>
						<hr />
						<div class="field col">
							<p>
								6. Mostre os passos da análise sintática ll(1) da string "a b a c" para a seguinte
								gramática
							</p>
							<pre>{`S -> a A
A -> b S | c`}</pre>
							<textarea name="q7" id="q7" oninput={receiveInput} rows="4"></textarea>
						</div>
						<hr />
						<div class="field col">
							<p>7. Dê uma gramática que aceita essas entradas</p>
							<pre>{`num
num + num
num + num * num
(num - num) * num
num * (num)
((num + num) * num)
`}</pre>
							<textarea name="q8" id="q8" oninput={receiveInput} rows="4"></textarea>
						</div>
					</div>
				{/snippet}
			</FillSize>
		</div>
	{/snippet}
</FillSize>

<style>
	.form {
		border: 1px solid hsl(0, 0%, 0%, 20%);
		height: inherit;
		border-radius: 8px;
		overflow: auto;
	}

	.fields {
		height: inherit;
		overflow: auto;
		flex-direction: column;
	}
	.form-header {
		padding: 10px;
		background: hsl(200, 50%, 50%);
		border-radius: 8px 8px 0px 0px;
		color: white;
		display: flex;
		justify-content: space-between;
	}
	.form-header > button {
		background: none;
		color: white;
		border: 1px solid;
	}
	.form-header > button:disabled {
		color: hsl(200, 50%, 60%);
		pointer-events: none;
	}
	textarea,
	input {
		border-radius: 5px;
	}

	.field {
		display: flex;
		gap: 20px;
		margin: 10px;
		align-items: center;
	}
	.field > input {
		flex: 1;
	}

	.col {
		flex-direction: column;
		align-items: normal;
		gap: 10px;
	}
</style>
