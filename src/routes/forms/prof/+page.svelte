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

		localStorage.setItem('vansi-form-prof' + elem.name, elem.value);

		totalAnswers = answers
			.values()
			.filter((x) => x.value != null && x.req)
			.toArray().length;
	}

	/**@param {MouseEvent} e*/
	function rangeInput(e) {
		receiveInput(e);
		if (e.target) /**@type {HTMLElement}*/ (e.target).onclick = null;
	}

	function sendForm() {
		let content = '';
		answers.entries().forEach(([k, v]) => {
			content += `${k}:${v.value?.replaceAll('\\', '\\\\').replaceAll('\n', '\\n')}\n`;
		});

		console.log(content);
		if (import.meta.env.PROD) {
			supabase.storage.from('logs').upload('form-prof' + crypto.randomUUID(), content);
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
			if (x.type === 'range') {
				x.onclick = rangeInput;
			}
			const item = localStorage.getItem('vansi-form-prof' + x.name);
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

<FillSize class="unit" style="margin: 10px">
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
							1. Em geral, como você avalia a VANSI como ferramenta de ensino de análise sintática?
							<div class="col">
								<div>
									<input type="radio" id="q1-0" name="q1" value="true" /><label for="q1-0"
										>Excelente</label
									>
								</div>
								<div>
									<input type="radio" id="q1-1" name="q1" value="true" /><label for="q1-1"
										>Boa</label
									>
								</div>
								<div>
									<input type="radio" id="q1-2" name="q1" value="true" /><label for="q1-2"
										>Regular</label
									>
								</div>
								<div>
									<input type="radio" id="q1-3" name="q1" value="true" /><label for="q1-3"
										>Ruim</label
									>
								</div>
								<div>
									<input type="radio" id="q1-4" name="q1" value="true" /><label for="q1-4"
										>Péssima</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							2. A ferramenta cobre adequadamente os tópicos que você ensina?
							<div class="col">
								<div>
									<input type="radio" id="q2-0" name="q2" value="true" /><label for="q2-0"
										>Sim, todos</label
									>
								</div>
								<div>
									<input type="radio" id="q2-1" name="q2" value="true" /><label for="q2-1"
										>A maioria</label
									>
								</div>
								<div>
									<input type="radio" id="q2-2" name="q2" value="true" /><label for="q2-2"
										>Alguns</label
									>
								</div>
								<div>
									<input type="radio" id="q2-3" name="q2" value="true" /><label for="q2-3"
										>Poucos</label
									>
								</div>
								<div>
									<input type="radio" id="q2-4" name="q2" value="true" /><label for="q2-4"
										>Nenhum</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							3. Quais algoritmos você considera mais bem representados na ferramenta?
							<div class="field-grid">
								<div>
									<input type="checkbox" id="q3-0" name="q3" value="Tabela LL(1)" /><label
										for="q3-0">Tabela LL(1)</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-1" name="q3" value="Tabela SLR" /><label for="q3-1"
										>Tabela SLR</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-2" name="q3" value="Tabela LR(1)" /><label
										for="q3-2">Tabela LR(1)</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-3" name="q3" value="Autômato LR(1)" /><label
										for="q3-3">Autômato LR(1)</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-4" name="q3" value="Autômato SLR" /><label
										for="q3-4">Autômato SLR</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-5" name="q3" value="Conjunto first" /><label
										for="q3-5">Conjunto first</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-6" name="q3" value="Conjunto follow" /><label
										for="q3-6">Conjunto follow</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-7" name="q3" value="Parsing LL(1)" /><label
										for="q3-7">Parsing LL(1)</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-8" name="q3" value="Parsing SLR" /><label for="q3-8"
										>Parsing SLR</label
									>
								</div>
								<div>
									<input type="checkbox" id="q3-9" name="q3" value="Parsing LR(1)" /><label
										for="q3-9">Parsing LR(1)</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							4. A VANSI ajuda a visualizar o funcionamento interno dos algoritmos?
							<div class="col">
								<div>
									<input type="radio" id="q4-0" name="q4" value="true" /><label for="q4-0"
										>Muito</label
									>
								</div>
								<div>
									<input type="radio" id="q4-1" name="q4" value="true" /><label for="q4-1"
										>Sim</label
									>
								</div>
								<div>
									<input type="radio" id="q4-2" name="q4" value="true" /><label for="q4-2"
										>Parcialmente</label
									>
								</div>
								<div>
									<input type="radio" id="q4-3" name="q4" value="true" /><label for="q4-3"
										>Pouco</label
									>
								</div>
								<div>
									<input type="radio" id="q4-4" name="q4" value="true" /><label for="q4-4"
										>Não</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							5. Você usaria a VANSI em suas aulas?
							<div class="col">
								<div>
									<input type="radio" id="q5-0" name="q5" value="true" /><label for="q5-0"
										>Sim, com certeza</label
									>
								</div>
								<div>
									<input type="radio" id="q5-1" name="q5" value="true" /><label for="q5-1"
										>Sim, talvez</label
									>
								</div>
								<div>
									<input type="radio" id="q5-2" name="q5" value="true" /><label for="q5-2"
										>Não, mas recomendaria</label
									>
								</div>
								<div>
									<input type="radio" id="q5-3" name="q5" value="true" /><label for="q5-3"
										>Não</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							6. Em quais contextos você consideraria usar a VANSI?
							<div class="field-grid">
								<div>
									<input type="checkbox" id="q6-0" name="q6" value="Explicação em aula" /><label
										for="q6-0">Explicação em aula</label
									>
								</div>
								<div>
									<input
										type="checkbox"
										id="q6-1"
										name="q6"
										value="Atividade prática em laboratório"
									/><label for="q6-1">Atividade prática em laboratório</label>
								</div>
								<div>
									<input
										type="checkbox"
										id="q6-2"
										name="q6"
										value="Estudo individual dos alunos"
									/><label for="q6-2">Estudo individual dos alunos</label>
								</div>
								<div>
									<input type="checkbox" id="q6-3" name="q6" value="Atividade avaliativa" /><label
										for="q6-3">Atividade avaliativa</label
									>
								</div>
								<div>
									<input type="checkbox" id="q6-4" name="q6" value="Monitoria ou reforço" /><label
										for="q6-4">Monitoria ou reforço</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							7. A ferramenta reduziria o tempo necessário para explicar os algoritmos?
							<div class="col">
								<div>
									<input type="radio" id="q7-0" name="q7" value="true" /><label for="q7-0"
										>Sim, significativamente</label
									>
								</div>
								<div>
									<input type="radio" id="q7-1" name="q7" value="true" /><label for="q7-1"
										>Sim, um pouco</label
									>
								</div>
								<div>
									<input type="radio" id="q7-2" name="q7" value="true" /><label for="q7-2"
										>Não</label
									>
								</div>
								<div>
									<input type="radio" id="q7-3" name="q7" value="true" /><label for="q7-3"
										>Não sei</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							8. Os elementos visuais (tabelas, autômato, árvore sintática) são claros e úteis?
							<div class="col">
								<div>
									<input type="radio" id="q8-0" name="q8" value="true" /><label for="q8-0"
										>Sim, todos</label
									>
								</div>
								<div>
									<input type="radio" id="q8-1" name="q8" value="true" /><label for="q8-1"
										>A maioria</label
									>
								</div>
								<div>
									<input type="radio" id="q8-2" name="q8" value="true" /><label for="q8-2"
										>Alguns</label
									>
								</div>
								<div>
									<input type="radio" id="q8-3" name="q8" value="true" /><label for="q8-3"
										>Poucos</label
									>
								</div>
								<div>
									<input type="radio" id="q8-4" name="q8" value="true" /><label for="q8-4"
										>Nenhum</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							9. Os tooltips e descrições ajudam a tornar a interface autoexplicativa?
							<div class="col">
								<div>
									<input type="radio" id="q9-0" name="q9" value="true" /><label for="q9-0"
										>Sim, muito</label
									>
								</div>
								<div>
									<input type="radio" id="q9-1" name="q9" value="true" /><label for="q9-1"
										>Sim</label
									>
								</div>
								<div>
									<input type="radio" id="q9-2" name="q9" value="true" /><label for="q9-2"
										>Parcialmente</label
									>
								</div>
								<div>
									<input type="radio" id="q9-3" name="q9" value="true" /><label for="q9-3"
										>Pouco</label
									>
								</div>
								<div>
									<input type="radio" id="q9-4" name="q9" value="true" /><label for="q9-4"
										>Não</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							10. Quais funcionalidades você gostaria de ver adicionadas?
							<textarea data-optional="true" name="q10" id="q10"></textarea>
						</div>
						<hr />
						<div class="field col">
							11. Você recomendaria a VANSI para outros professores da disciplina?
							<div class="col">
								<div>
									<input type="radio" id="q11-0" name="q11" value="true" /><label for="q11-0"
										>Sim</label
									>
								</div>
								<div>
									<input type="radio" id="q11-1" name="q11" value="true" /><label for="q11-1"
										>Talvez</label
									>
								</div>
								<div>
									<input type="radio" id="q11-2" name="q11" value="true" /><label for="q11-2"
										>Não</label
									>
								</div>
							</div>
						</div>
						<hr />
						<div class="field col">
							12. Justifique sua resposta da pergunta anterior:
							<textarea data-optional="true" name="q12" id="q12"></textarea>
						</div>
						<hr />
						<div class="field col">
							13. Comentários gerais sobre a ferramenta:
							<textarea data-optional="true" name="q13" id="q13"></textarea>
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
