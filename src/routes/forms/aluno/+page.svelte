<script>
	import '@/Assignments/assignment.css';
	import Form from '@/Assignments/Form.svelte';

	/** @type {((e: Event)=>void)?} */
	let receiveInput = $state(null);
</script>

<Form bind:receiveInput>
	{#snippet form()}
		<div class="field col">
			1. Você já havia estudado os algoritmos LL(1), SLR ou CLR antes de usar a ferramenta?
			<div class="col">
				<div>
					<input type="radio" id="q1-0" name="q1" value="Sim" /><label for="q1-0">Sim</label>
				</div>
				<div>
					<input type="radio" id="q1-1" name="q1" value="Não" /><label for="q1-1">Não</label>
				</div>
			</div>
		</div>
		<hr />
		<div class="field col">
			2. Qual o seu nível de conhecimento sobre Analisadores Sintáticos?
			<div class="col">
				<div>
					<input type="radio" id="q2-0" name="q2" value="Iniciante" /><label for="q2-0"
						>Iniciante</label
					>
				</div>
				<div>
					<input type="radio" id="q2-1" name="q2" value="Intermediário" /><label for="q2-1"
						>Intermediário</label
					>
				</div>
				<div>
					<input type="radio" id="q2-2" name="q2" value="Avançado" /><label for="q2-2"
						>Avançado</label
					>
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
			<div class="col">
				<div>
					<input type="radio" id="q4-0" name="q4" value="Sim, todos" /><label for="q4-0"
						>Sim, todos</label
					>
				</div>
				<div>
					<input type="radio" id="q4-1" name="q4" value="A maioria" /><label for="q4-1"
						>A maioria</label
					>
				</div>
				<div>
					<input type="radio" id="q4-2" name="q4" value="Alguns" /><label for="q4-2">Alguns</label>
				</div>
				<div>
					<input type="radio" id="q4-3" name="q4" value="Poucos" /><label for="q4-3">Poucos</label>
				</div>
				<div>
					<input type="radio" id="q4-4" name="q4" value="Nenhum" /><label for="q4-4">Nenhum</label>
				</div>
			</div>
		</div>
		<hr />
		<div class="field col">
			5. De 1 a 5, o quão útil foram os tooltips (descrições que aparecem ao passar o mouse por cima
			de botões)?
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
			8. De 1 a 5, como você avalia a organização das abas (abas de gramática, algoritmos e análise
			de string)?
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
			9. De 1 a 5, o quão útil foi a janela de diálogo com resultados para copiar como texto?
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
			11. De 1 a 5, quanto as animações (destaques, transições, movimentação de dados) foram úteis
			para acompanhar as mudanças nas estruturas de dados?
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
			12. De 1 a 5, quanto a visualização do autômato (itens canônicos) foi clara e ajudou no
			entendimento dos algoritmos SLR e LR(1)?
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
			13. De 1 a 5, quanto a visualização da árvore sintática ajudou no entendimento da análise
			sintática de strings?
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
			14. De 1 a 5, quanto a possibilidade de avançar, voltar e reiniciar os passos foi importante
			para o aprendizado?
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
			16. De 1 a 5, quanto a janela de diálogo com informações sobre os algoritmos ajudaram a
			entender o algoritmo?
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
			<div class="col">
				<div>
					<input type="radio" id="q17-0" name="q17" value="Excelente" /><label for="q17-0"
						>Excelente</label
					>
				</div>
				<div>
					<input type="radio" id="q17-1" name="q17" value="Boa" /><label for="q17-1">Boa</label>
				</div>
				<div>
					<input type="radio" id="q17-2" name="q17" value="Regular" /><label for="q17-2"
						>Regular</label
					>
				</div>
				<div>
					<input type="radio" id="q17-3" name="q17" value="Ruim" /><label for="q17-3">Ruim</label>
				</div>
				<div>
					<input type="radio" id="q17-4" name="q17" value="Péssima" /><label for="q17-4"
						>Péssima</label
					>
				</div>
			</div>
		</div>
		<hr />
		<div class="field col">
			18. Você usaria essa ferramenta novamente para estudar algoritmos de compiladores?
			<div class="col">
				<div>
					<input type="radio" id="q18-0" name="q18" value="Sim" /><label for="q18-0">Sim</label>
				</div>
				<div>
					<input type="radio" id="q18-1" name="q18" value="Talvez" /><label for="q18-1"
						>Talvez</label
					>
				</div>
				<div>
					<input type="radio" id="q18-2" name="q18" value="Não" /><label for="q18-2">Não</label>
				</div>
			</div>
		</div>
		<hr />
		<div class="field col">
			19. Recomendaria a ferramenta para outros alunos aprendendo sobre analisadores sintáticos?
			<div class="col">
				<div>
					<input type="radio" id="q19-0" name="q19" value="Sim" /><label for="q19-0">Sim</label>
				</div>
				<div>
					<input type="radio" id="q19-1" name="q19" value="Talvez" /><label for="q19-1"
						>Talvez</label
					>
				</div>
				<div>
					<input type="radio" id="q19-2" name="q19" value="Não" /><label for="q19-2">Não</label>
				</div>
			</div>
		</div>
		<hr />
		<div class="field col">
			20. Você já usou a ferramenta antes?
			<div class="col">
				<div>
					<input type="radio" id="q20-0" name="q20" value="Sim" /><label for="q20-0">Sim</label>
				</div>
				<div>
					<input type="radio" id="q20-1" name="q20" value="Não" /><label for="q20-1">Não</label>
				</div>
			</div>
		</div>
		<hr />
		<div class="field col">
			21. Sugestões, críticas ou comentários adicionais sobre a ferramenta:
			<textarea data-optional="true" name="q21" id="q21"></textarea>
		</div>
		<hr />
	{/snippet}
</Form>

<style>
</style>
