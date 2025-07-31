<script>
	import { supabase } from '$lib/log';
	import FillSize from '@/Layout/FillSize.svelte';
	import { onMount } from 'svelte';

	let totalQuestions = $state(0);
	let totalAnswers = $state(0);
	let fileSent = $state(false);

	/**@type {Map<string,{value: string?, req: boolean}>}*/
	let answers = new Map();
	/**
	 * @param {Event} e
	 */
	function receiveInput(e) {
		const elem = /**@type {HTMLInputElement}*/ (e.target);
		console.log(elem.value);

		if (elem.value.trim().length > 0) {
			answers.set(elem.name, { value: elem.value, req: !elem.getAttribute('data-optional') });
		} else {
			answers.set(elem.name, { value: null, req: !elem.getAttribute('data-optional') });
		}

		totalAnswers = answers
			.values()
			.filter((x) => x.value != null && x.req)
			.toArray().length;
	}

	function sendForm() {
		let content = '';
		answers.entries().forEach(([k, v]) => {
			content += `${k}:${v.value}\n`;
		});

		console.log(content);
		supabase.storage.from('forms').upload(crypto.randomUUID(), content);
	}

	onMount(() => {
		const qs = /**@type {NodeListOf<HTMLInputElement>}*/ (
			document.querySelector('.form')?.querySelectorAll('input,textarea')
		);
		qs?.values().forEach((x) => {
			x.oninput = receiveInput;
			answers.set(x.name, {
				value: null,
				req: !x.getAttribute('data-optional')
			});
		});
		totalQuestions = answers
			.values()
			.filter((x) => x?.req)
			.toArray().length;
	});
</script>

<FillSize class="unit">
	{#snippet content()}
		<div class="form">
			<div class="form-header">
				<p style="font-size: 0.9rem;align-content: center">
					Progresso: {totalAnswers}/{totalQuestions}
				</p>
				<button
					disabled={totalAnswers < totalQuestions || fileSent}
					onclick={() => {
						fileSent = true;
						sendForm();
					}}>{fileSent ? 'Enviado' : 'Finalizar'}</button
				>
			</div>
			<FillSize class="form-content">
				{#snippet content()}
					<div class="fields" style={!fileSent ? 'opacity: 1' : 'pointer-events:none;opacity: 0.5'}>
						<div class="field col">
							1. Você já havia estudado os algoritmos LL(1), SLR ou CLR antes de usar a ferramenta?
							<div>
								<input type="radio" name="q1" value="Sim" /><label for="q1">Sim</label>
							</div>
							<div>
								<input type="radio" name="q1" value="Não" /><label for="q1">Não</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							2. Em qual nível você se considera em Compiladores?
							<div>
								<input type="radio" name="q2" value="Iniciante" /><label for="q2">Iniciante</label>
							</div>
							<div>
								<input type="radio" name="q2" value="Intermediário" /><label for="q2"
									>Intermediário</label
								>
							</div>
							<div>
								<input type="radio" name="q2" value="Avançado" /><label for="q2">Avançado</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							3. A interface da ferramenta foi fácil de navegar?
							<div>
								<input type="radio" name="q3" value="Muito fácil" /><label for="q3"
									>Muito fácil</label
								>
							</div>
							<div>
								<input type="radio" name="q3" value="Fácil" /><label for="q3">Fácil</label>
							</div>
							<div>
								<input type="radio" name="q3" value="Neutra" /><label for="q3">Neutra</label>
							</div>
							<div>
								<input type="radio" name="q3" value="Difícil" /><label for="q3">Difícil</label>
							</div>
							<div>
								<input type="radio" name="q3" value="Muito difícil" /><label for="q3"
									>Muito difícil</label
								>
							</div>
						</div>
						<hr />
						<div class="field col">
							4. Os elementos da interface (botões, janelas, tooltips) foram claros em sua função?
							<div>
								<input type="radio" name="q4" value="Sim, todos" /><label for="q4">Sim, todos</label
								>
							</div>
							<div>
								<input type="radio" name="q4" value="A maioria" /><label for="q4">A maioria</label>
							</div>
							<div>
								<input type="radio" name="q4" value="Alguns" /><label for="q4">Alguns</label>
							</div>
							<div>
								<input type="radio" name="q4" value="Poucos" /><label for="q4">Poucos</label>
							</div>
							<div>
								<input type="radio" name="q4" value="Nenhum" /><label for="q4">Nenhum</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							5. Os tooltips (dicas ao passar o mouse) foram úteis?
							<div>
								<input type="radio" name="q5" value="Muito úteis" /><label for="q5"
									>Muito úteis</label
								>
							</div>
							<div>
								<input type="radio" name="q5" value="Úteis" /><label for="q5">Úteis</label>
							</div>
							<div>
								<input type="radio" name="q5" value="Neutros" /><label for="q5">Neutros</label>
							</div>
							<div>
								<input type="radio" name="q5" value="Pouco úteis" /><label for="q5"
									>Pouco úteis</label
								>
							</div>
							<div>
								<input type="radio" name="q5" value="Inúteis" /><label for="q5">Inúteis</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							6. Como você avalia a organização das abas (gramática, algoritmos, análise de string)?
							<div>
								<input type="radio" name="q6" value="Muito boa" /><label for="q6">Muito boa</label>
							</div>
							<div>
								<input type="radio" name="q6" value="Boa" /><label for="q6">Boa</label>
							</div>
							<div>
								<input type="radio" name="q6" value="Regular" /><label for="q6">Regular</label>
							</div>
							<div>
								<input type="radio" name="q6" value="Ruim" /><label for="q6">Ruim</label>
							</div>
							<div>
								<input type="radio" name="q6" value="Muito ruim" /><label for="q6">Muito ruim</label
								>
							</div>
						</div>
						<hr />
						<div class="field col">
							7. A visualização passo a passo dos algoritmos ajudou a entender seu funcionamento?
							<div>
								<input type="radio" name="q7" value="Muito" /><label for="q7">Muito</label>
							</div>
							<div>
								<input type="radio" name="q7" value="Sim" /><label for="q7">Sim</label>
							</div>
							<div>
								<input type="radio" name="q7" value="Parcialmente" /><label for="q7"
									>Parcialmente</label
								>
							</div>
							<div>
								<input type="radio" name="q7" value="Pouco" /><label for="q7">Pouco</label>
							</div>
							<div>
								<input type="radio" name="q7" value="Não ajudou" /><label for="q7">Não ajudou</label
								>
							</div>
						</div>
						<hr />
						<div class="field col">
							8. As animações (destaques, transições, movimentação de dados) foram úteis para
							acompanhar as mudanças nas estruturas?
							<div>
								<input type="radio" name="q8" value="Muito úteis" /><label for="q8"
									>Muito úteis</label
								>
							</div>
							<div>
								<input type="radio" name="q8" value="Úteis" /><label for="q8">Úteis</label>
							</div>
							<div>
								<input type="radio" name="q8" value="Neutras" /><label for="q8">Neutras</label>
							</div>
							<div>
								<input type="radio" name="q8" value="Pouco úteis" /><label for="q8"
									>Pouco úteis</label
								>
							</div>
							<div>
								<input type="radio" name="q8" value="Não foram úteis" /><label for="q8"
									>Não foram úteis</label
								>
							</div>
						</div>
						<hr />
						<div class="field col">
							9. A visualização do autômato (itens canônicos) foi clara e ajudou no entendimento do
							algoritmo?
							<div>
								<input type="radio" name="q9" value="Sim" /><label for="q9">Sim</label>
							</div>
							<div>
								<input type="radio" name="q9" value="Parcialmente" /><label for="q9"
									>Parcialmente</label
								>
							</div>
							<div>
								<input type="radio" name="q9" value="Não" /><label for="q9">Não</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							10. A possibilidade de avançar, voltar e reiniciar os passos foi importante para o
							aprendizado?
							<div>
								<input type="radio" name="q10" value="Muito importante" /><label for="q10"
									>Muito importante</label
								>
							</div>
							<div>
								<input type="radio" name="q10" value="Importante" /><label for="q10"
									>Importante</label
								>
							</div>
							<div>
								<input type="radio" name="q10" value="Neutra" /><label for="q10">Neutra</label>
							</div>
							<div>
								<input type="radio" name="q10" value="Pouco importante" /><label for="q10"
									>Pouco importante</label
								>
							</div>
							<div>
								<input type="radio" name="q10" value="Irrelevante" /><label for="q10"
									>Irrelevante</label
								>
							</div>
						</div>
						<hr />
						<div class="field col">
							11. O pseudocódigo com breakpoints ajudou a relacionar a teoria com a execução?
							<div>
								<input type="radio" name="q11" value="Sim" /><label for="q11">Sim</label>
							</div>
							<div>
								<input type="radio" name="q11" value="Parcialmente" /><label for="q11"
									>Parcialmente</label
								>
							</div>
							<div>
								<input type="radio" name="q11" value="Não" /><label for="q11">Não</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							12. Em geral, como você avalia a ferramenta VANSI como apoio ao aprendizado de análise
							sintática?
							<div>
								<input type="radio" name="q12" value="Excelente" /><label for="q12">Excelente</label
								>
							</div>
							<div>
								<input type="radio" name="q12" value="Boa" /><label for="q12">Boa</label>
							</div>
							<div>
								<input type="radio" name="q12" value="Regular" /><label for="q12">Regular</label>
							</div>
							<div>
								<input type="radio" name="q12" value="Ruim" /><label for="q12">Ruim</label>
							</div>
							<div>
								<input type="radio" name="q12" value="Péssima" /><label for="q12">Péssima</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							13. Você usaria essa ferramenta novamente para estudar algoritmos de compiladores?
							<div>
								<input type="radio" name="q13" value="Sim" /><label for="q13">Sim</label>
							</div>
							<div>
								<input type="radio" name="q13" value="Talvez" /><label for="q13">Talvez</label>
							</div>
							<div>
								<input type="radio" name="q13" value="Não" /><label for="q13">Não</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							14. Recomendaria a ferramenta para outros alunos?
							<div>
								<input type="radio" name="q14" value="Sim" /><label for="q14">Sim</label>
							</div>
							<div>
								<input type="radio" name="q14" value="Talvez" /><label for="q14">Talvez</label>
							</div>
							<div>
								<input type="radio" name="q14" value="Não" /><label for="q14">Não</label>
							</div>
						</div>
						<hr />
						<div class="field col">
							15. Sugestões ou comentários adicionais sobre a ferramenta
							<textarea data-optional="true" name="feedback" id="feedback"></textarea>
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
	.field {
		display: flex;
		gap: 20px;
		margin: 10px;
		align-items: center;
	}

	.col {
		flex-direction: column;
		align-items: normal;
		gap: 10px;
	}
</style>
