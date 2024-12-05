<h2>Construindo a Tabela LL(1): Um Guia Detalhado</h2>
<p>
	A tabela LL(1) é uma estrutura fundamental na análise sintática, utilizada para direcionar o
	processo de parsing de uma gramática. Ela é construída com base nos conjuntos First e Follow de
	cada não-terminal da gramática.
</p>
<h3>O que é uma tabela LL(1)?</h3>
<p>
	A tabela LL(1) é uma matriz onde as linhas correspondem aos não-terminais da gramática e as
	colunas correspondem aos terminais e ao símbolo de fim de entrada ($). Cada célula da tabela
	contém a produção a ser utilizada quando o não-terminal da linha e o terminal da coluna são
	encontrados na entrada.
</p>
<h3>Como construir a tabela LL(1)?</h3>
<ol>
	<li>
		<strong>Calcular os conjuntos First e Follow:</strong>
		<ul>
			<li>
				<strong>First:</strong> Determina os possíveis primeiros símbolos de uma cadeia derivada de um
				não-terminal.
			</li>
			<li>
				<strong>Follow:</strong> Determina os possíveis símbolos que podem aparecer imediatamente após
				um não-terminal em uma cadeia válida.
			</li>
		</ul>
	</li>
	<li>
		<strong>Criar a tabela:</strong>
		<ul>
			<li>
				Crie uma matriz com linhas para cada não-terminal e colunas para cada terminal e o símbolo
				$.
			</li>
		</ul>
	</li>
	<li>
		<strong>Preencher a tabela:</strong>
		<ul>
			<li>
				<strong>Para cada produção A → α:</strong>
				<ul>
					<li>
						<strong>Se a ∈ First(α),</strong> então para cada terminal b ∈ First(α), coloque A → α na
						célula [A, b].
					</li>
					<li>
						<strong>Se ε ∈ First(α),</strong> então para cada terminal b ∈ Follow(A), coloque A → α na
						célula [A, b].
					</li>
				</ul>
			</li>
		</ul>
	</li>
	<li>
		<strong>Verificar ambiguidades:</strong>
		<ul>
			<li>Se em alguma célula da tabela houver mais de uma produção, a gramática não é LL(1).</li>
		</ul>
	</li>
</ol>

<h3>Utilizando a tabela LL(1):</h3>
<p>
	A tabela LL(1) é utilizada pelo analisador sintático para decidir qual produção aplicar em cada
	passo da análise. Dado um não-terminal na pilha e um terminal na entrada, o analisador consulta a
	tabela para encontrar a produção a ser utilizada.
</p>
<h3>Condições para uma gramática ser LL(1):</h3>
<ul>
	<li>Nenhuma célula da tabela deve conter mais de uma produção.</li>
	<li>
		Para cada produção A → α e A → β, First(α) e First(β) devem ser disjuntos, a menos que β derive
		ε, e nesse caso, First(α) e Follow(A) devem ser disjuntos.
	</li>
</ul>
