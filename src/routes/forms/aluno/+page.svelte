<script>
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/log';
	import FillSize from '@/Layout/FillSize.svelte';
	import { onMount } from 'svelte';
	import '@/Assignments/assignment.css';

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

		localStorage.setItem('vansi-form-' + elem.name, elem.value);

		totalAnswers = answers
			.values()
			.filter((x) => x.value != null && x.req)
			.toArray().length;
	}

	function sendForm() {
		let content = '';
		answers.entries().forEach(([k, v]) => {
			content += `${k}:${v.value?.replaceAll('\\', '\\\\').replaceAll('\n', '\\n')}\n`;
		});

		console.log(content);
		if (import.meta.env.PROD) {
			supabase.storage.from('logs').upload('form' + crypto.randomUUID(), content);
		} else {
			console.log(content);
		}
		goto('/');
	}

	onMount(() => {
		const qs = /**@type {NodeListOf<HTMLInputElement>}*/ (
			document.querySelector('.form')?.querySelectorAll('input,textarea')
		);
		qs?.values().forEach((x) => {
			x.oninput = receiveInput;
			const item = localStorage.getItem('vansi-form' + x.name);
			if (item) {
				/**@type {HTMLInputElement}*/ (x).value = item;
				answers.set(x.name, {
					value: item,
					req: !x.getAttribute('data-optional')
				});
			} else {
				answers.set(x.name, {
					value: null,
					req: !x.getAttribute('data-optional')
				});
			}
		});
		totalQuestions = answers
			.values()
			.filter((x) => x?.req)
			.toArray().length;
		totalAnswers = answers
			.values()
			.filter((x) => x.value != null && x.req)
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
					<datalist id="values">
						<option value="1"></option>
						<option value="2"></option>
						<option value="3"></option>
						<option value="4"></option>
						<option value="5"></option>
					</datalist>
					<div class="fields" style={!fileSent ? 'opacity: 1' : 'pointer-events:none;opacity: 0.5'}>
						<div class="field col">
							1. Você já havia estudado os algoritmos LL(1), SLR ou CLR antes de usar a ferramenta?
							<div class="row">
								<div>
									<input type="radio" name="q1" value="Sim" /><label for="q1">Sim</label>
								</div>
								<div>
									<input type="radio" name="q1" value="Não" /><label for="q1">Não</label>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							2. Qual o seu nível de conhecimento sobre Analisadores Sintáticos?
							<div class="row">
								<div>
									<input type="radio" name="q2" value="Iniciante" /><label for="q2">Iniciante</label
									>
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
						</div>
						<hr />
						<div class="field col">
							3. De 1 a 5, o quão fácil de navegar foi a interface da ferramenta?
							<div class="range-box">
								<input type="range" value="0" id="q3" min="1" max="5" name="q3" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							4. Os elementos da interface (botões, janelas) foram claros em sua função?
							<div class="row">
								<div>
									<input type="radio" name="q4" value="Sim, todos" /><label for="q4"
										>Sim, todos</label
									>
								</div>
								<div>
									<input type="radio" name="q4" value="A maioria" /><label for="q4">A maioria</label
									>
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
						</div>
						<hr />
						<div class="field col">
							5. De 1 a 5, o quão útil foram os tooltips (descrições que aparecem ao passar o mouse
							por cima de botões)?
							<div class="range-box">
								<input type="range" value="0" id="q5" min="1" max="5" name="q5" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							6. De 1 a 5, o quão útil foi a possibilidade de mover livremente os elementos de
							pseudocódigo/autômato?
							<div class="range-box">
								<input type="range" value="0" id="q6" min="1" max="5" name="q6" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							7. De 1 a 5, o quão útil foram as ações de minimizar/abrir os elementos de
							pseudocódigo/autômato?
							<div class="range-box">
								<input type="range" value="0" id="q7" min="1" max="5" name="q7" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							8. De 1 a 5, como você avalia a organização das abas (abas de gramática, algoritmos e
							análise de string)?
							<div class="range-box">
								<input type="range" value="0" id="q8" min="1" max="5" name="q8" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							9. De 1 a 5, o quão útil foi a janela de diálogo com resultados para copiar como
							texto?
							<div class="range-box">
								<input type="range" value="0" id="q9" min="1" max="5" name="q9" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							10. De 1 a 5, quanto a visualização passo a passo dos algoritmos ajudou a entender seu
							funcionamento?
							<div class="range-box">
								<input type="range" value="0" id="q10" min="1" max="5" name="q10" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							11. De 1 a 5, quanto as animações (destaques, transições, movimentação de dados) foram
							úteis para acompanhar as mudanças nas estruturas de dados?
							<div class="range-box">
								<input type="range" value="0" id="q11" min="1" max="5" name="q11" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							12. De 1 a 5, quanto a visualização do autômato (itens canônicos) foi clara e ajudou
							no entendimento dos algoritmos SLR e LR(1)?
							<div class="range-box">
								<input type="range" value="0" id="q12" min="1" max="5" name="q12" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							13. De 1 a 5, quanto a visualização da árvore sintática ajudou no entendimento da
							análise sintática de strings?
							<div class="range-box">
								<input type="range" value="0" id="q13" min="1" max="5" name="q13" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							14. De 1 a 5, quanto a possibilidade de avançar, voltar e reiniciar os passos foi
							importante para o aprendizado?
							<div class="range-box">
								<input type="range" value="0" id="q14" min="1" max="5" name="q14" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							15. De 1 a 5, quanto o pseudocódigo com breakpoints ajudou a relacionar a teoria com a
							execução?
							<div class="range-box">
								<input type="range" value="0" id="q15" min="1" max="5" name="q15" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							16. De 1 a 5, quanto a janela de diálogo com informações sobre os algoritmos ajudaram
							a entender o algoritmo?
							<div class="range-box">
								<input type="range" value="0" id="q16" min="1" max="5" name="q16" list="values" />
								<div class="values-box">
									<p>1</p>
									<p>2</p>
									<p>3</p>
									<p>4</p>
									<p>5</p>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							17. Em geral, como você avalia a ferramenta VANSI como apoio ao aprendizado de análise
							sintática?
							<div class="row">
								<div>
									<input type="radio" name="q17" value="Excelente" /><label for="q17"
										>Excelente</label
									>
								</div>
								<div>
									<input type="radio" name="q17" value="Boa" /><label for="q17">Boa</label>
								</div>
								<div>
									<input type="radio" name="q17" value="Regular" /><label for="q17">Regular</label>
								</div>
								<div>
									<input type="radio" name="q17" value="Ruim" /><label for="q17">Ruim</label>
								</div>
								<div>
									<input type="radio" name="q17" value="Péssima" /><label for="q17">Péssima</label>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							18. Você usaria essa ferramenta novamente para estudar algoritmos de compiladores?
							<div class="row">
								<div>
									<input type="radio" name="q18" value="Sim" /><label for="q18">Sim</label>
								</div>
								<div>
									<input type="radio" name="q18" value="Talvez" /><label for="q18">Talvez</label>
								</div>
								<div>
									<input type="radio" name="q18" value="Não" /><label for="q18">Não</label>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							19. Recomendaria a ferramenta para outros alunos aprendendo sobre analisadores
							sintáticos?
							<div class="row">
								<div>
									<input type="radio" name="q19" value="Sim" /><label for="q19">Sim</label>
								</div>
								<div>
									<input type="radio" name="q19" value="Talvez" /><label for="q19">Talvez</label>
								</div>
								<div>
									<input type="radio" name="q19" value="Não" /><label for="q19">Não</label>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							20. Você já usou a ferramenta antes?
							<div class="row">
								<div>
									<input type="radio" name="q20" value="Sim" /><label for="q20">Sim</label>
								</div>
								<div>
									<input type="radio" name="q20" value="Não" /><label for="q20">Não</label>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							21. Sugestões, críticas ou comentários adicionais sobre a ferramenta:
							<textarea data-optional="true" name="q21" id="q21"></textarea>
						</div>
						<hr />
					</div>
				{/snippet}
			</FillSize>
		</div>
	{/snippet}
</FillSize>

<style>
</style>
