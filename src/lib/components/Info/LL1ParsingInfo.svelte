<h2>Algoritmo de Parsing com a Tabela LL(1)</h2>
<p>
	O algoritmo de parsing com a tabela LL(1) é um método para analisar a sintaxe de uma cadeia de
	caracteres, verificando se ela está de acordo com uma gramática formal.
</p>
<h3>Como funciona o algoritmo?</h3>
<ol>
	<li>
		<p><strong>Inicialização:</strong></p>
		<ul>
			<li>
				Cria-se uma pilha e insere-se o símbolo de fim de entrada ($) e o símbolo inicial da
				gramática na pilha.
			</li>
			<li>Aponta-se para o primeiro símbolo da cadeia de entrada.</li>
		</ul>
	</li>
	<li>
		<p><strong>Repete enquanto a pilha não estiver vazia:</strong></p>
		<ul>
			<li>Seja X o símbolo no topo da pilha e a o símbolo atual da entrada.</li>
			<li>
				<strong>Se X for um terminal:</strong>
				<ul>
					<li>Se X for igual a a, ambos são removidos da pilha e da entrada, respectivamente.</li>
					<li>Caso contrário, ocorre um erro de sintaxe.</li>
				</ul>
			</li>
			<li>
				<strong>Se X for um não-terminal:</strong>
				<ul>
					<li>Consulta-se a tabela LL(1) na linha X e coluna a.</li>
					<li>
						Se a célula [X, a] contiver uma produção A → α, substitui-se X na pilha por α (lendo α
						da direita para a esquerda).
					</li>
					<li>Caso contrário, ocorre um erro de sintaxe.</li>
				</ul>
			</li>
		</ul>
	</li>
	<li>
		<p><strong>Fim:</strong></p>
		<ul>
			<li>
				Se a pilha e a entrada estiverem vazias ao mesmo tempo, a cadeia de entrada é válida. Caso
				contrário, ocorre um erro de sintaxe.
			</li>
		</ul>
	</li>
</ol>
<h3>Condições para uma gramática ser LL(1)</h3>
<p>
	Para que uma gramática possa ser analisada utilizando o algoritmo LL(1), ela deve atender às
	seguintes condições:
</p>
<ul>
	<li>
		<strong>Não-ambiguidade:</strong> Cada célula da tabela LL(1) deve conter no máximo uma produção.
	</li>
	<li>
		<strong>Disjunção de First e Follow:</strong> Para cada produção A → α e A → β, First(α) e First(β)
		devem ser disjuntos, a menos que β derive ε, e nesse caso, First(α) e Follow(A) devem ser disjuntos.
	</li>
</ul>
<h3>Vantagens do parsing LL(1)</h3>
<ul>
	<li>
		<strong>Eficiência:</strong> O algoritmo é relativamente simples e eficiente, pois não requer backtracking.
	</li>
	<li>
		<strong>Determinismo:</strong> A tabela LL(1) determina de forma única qual produção deve ser aplicada
		em cada passo.
	</li>
	<li>
		<strong>Facilidade de implementação:</strong> A construção da tabela LL(1) e o algoritmo de parsing
		são relativamente simples de implementar.
	</li>
</ul>
<h3>Limitações</h3>
<ul>
	<li>
		<strong>Não todas as gramáticas são LL(1):</strong> Muitas gramáticas não atendem aos requisitos
		para serem analisadas por um analisador LL(1).
	</li>
	<li>
		<strong>Sensibilidade à ordem das produções:</strong> A ordem das produções na gramática pode afetar
		a construção da tabela LL(1).
	</li>
</ul>
