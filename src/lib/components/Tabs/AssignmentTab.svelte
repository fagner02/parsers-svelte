<script>
	import { fontSize } from '$lib/globalStyle';
	import FillSize from '@/Layout/FillSize.svelte';

	let totalQuestions = 9;
	let totalAnswers = 0;
</script>

<FillSize>
	<div class="form">
		<div class="form-header">
			<button>Iniciar</button>
			<p style="font-size: 0.9rem;align-content: center">
				Progresso: {totalAnswers}/{totalQuestions}
			</p>
			<button disabled>Finalizar</button>
		</div>
		<FillSize class="form-content">
			<div class="fields">
				<hr style="margin-top: 0;" />
				<div class="row">
					<div class="field">
						<p>Nome Completo</p>
						<input name="name" id="name" />
					</div>
					<div class="field">
						<p>Matrícula</p>
						<input name="ra" id="ra" />
					</div>
				</div>
				<hr />
				<div class="field col">
					<p>1. Dado um conjunto first, forneça uma gramática que gera esse conjunto first</p>
					<textarea name="algorithm" id="algorithm" rows="4" />
				</div>
				<hr />
				<div class="field col">
					<p>2. Dado um conjunto follow, forneça uma gramática que gera esse conjunto follow</p>
					<textarea name="table" id="table" rows="4"></textarea>
				</div>
				<hr />
				<div class="field col">
					<p>3. Dada uma tabela slr, forneça uma gramática que gera essa tabela</p>
					<textarea name="automaton" id="automaton" rows="4"></textarea>
				</div>
				<hr />
				<div class="field col">
					<p>4. Dada uma tabela lr1, forneça uma gramática que gera essa tabela</p>
					<textarea name="automaton" id="automaton" rows="4"></textarea>
				</div>
				<hr />
				<div class="field col">
					<p>A gramática é ll1?</p>
					<textarea name="automaton" id="automaton" rows="4"></textarea>
				</div>
				<hr />
				<div class="field col">
					<p>Construir conjunto First de uma gramática grande</p>
					<textarea name="automaton" id="automaton" rows="4"></textarea>
				</div>
				<hr />
				<div class="field col">
					<p>Mostre os passos da análise sintática</p>
					<textarea name="automaton" id="automaton" rows="4"></textarea>
				</div>
				<hr />
				<div class="field col">
					<p>Dê uma gramática que aceita essas entradas</p>
					<textarea name="automaton" id="automaton" rows="4"></textarea>
				</div>
			</div>
		</FillSize>
	</div>
</FillSize>

<style>
	.form {
		border: 1px solid hsl(0, 0%, 0%, 20%);
		height: inherit;
		border-radius: 8px;
		overflow: hidden;
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
	}
	.field {
		display: flex;
		gap: 20px;
		margin: 10px;
		align-items: center;
	}
	.field > textarea,
	.field > input {
		resize: none;
		border-radius: 5px;
		padding: 5px;
		flex: 1;
	}

	.row {
		display: flex;
		margin: -10px 0px;
	}

	.col {
		flex-direction: column;
		align-items: normal;
		gap: 10px;
	}
</style>
