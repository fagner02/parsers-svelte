<h2>Algoritmo de Parsing com a Tabela SLR(1)</h2>
<p>
	O algoritmo de parsing com a tabela SLR(1) é um método utilizado para analisar a sintaxe de uma
	cadeia de caracteres, verificando se ela está de acordo com uma gramática formal. Essa técnica é
	amplamente utilizada em compiladores e interpretadores para garantir a corretude sintática de um
	programa.
</p>
<h3>Como funciona o algoritmo?</h3>
<ol>
	<li>
		<p><strong>Inicialização:</strong></p>
		<ul>
			<li>
				Cria-se uma pilha e insere-se o símbolo de fim de entrada ($) e o estado inicial da tabela
				SLR(1).
			</li>
			<li>Aponta-se para o primeiro símbolo da cadeia de entrada.</li>
		</ul>
	</li>
	<li>
		<p><strong>Repete enquanto a pilha não estiver vazia:</strong></p>
		<ul>
			<li>Seja X o estado no topo da pilha e a o símbolo atual da entrada.</li>
			<li>Consulta-se a tabela SLR(1) na linha X e coluna a.</li>
			<li>
				<strong>Se a ação for &quot;shift s&quot;:</strong>
				<ul>
					<li>Empilha o símbolo a e o estado s.</li>
					<li>Avança para o próximo símbolo da entrada.</li>
				</ul>
			</li>
			<li>
				<strong>Se a ação for &quot;reduce A → α&quot;:</strong>
				<ul>
					<li>Remove da pilha os símbolos correspondentes à produção A → α.</li>
					<li>
						Consulta a tabela GOTO para encontrar o estado para o não-terminal A no topo da pilha.
					</li>
					<li>Empilha o estado encontrado.</li>
				</ul>
			</li>
			<li>
				<strong>Se a ação for &quot;accept&quot;:</strong>
				<ul>
					<li>A cadeia de entrada é válida.</li>
				</ul>
			</li>
			<li>
				<strong>Caso contrário:</strong>
				<ul>
					<li>Ocorre um erro de sintaxe.</li>
				</ul>
			</li>
		</ul>
	</li>
	<li>
		<p><strong>Fim:</strong></p>
		<ul>
			<li>
				Se a pilha estiver vazia e o símbolo de entrada for $, a cadeia de entrada é válida. Caso
				contrário, ocorre um erro de sintaxe.
			</li>
		</ul>
	</li>
</ol>
<h3>Exemplo</h3>
<p>
	Considere a tabela SLR(1) de um exemplo anterior. Suponha que a cadeia de entrada seja
	&quot;abc$&quot;.
</p>
<table>
	<thead>
		<tr>
			<th>Estado</th>
			<th>a</th>
			<th>b</th>
			<th>c</th>
			<th>$</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>0</td>
			<td>s1</td>
			<td>s2</td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>1</td>
			<td></td>
			<td></td>
			<td>s3</td>
			<td>r2</td>
		</tr>
		<tr>
			<td>2</td>
			<td></td>
			<td></td>
			<td></td>
			<td>r1</td>
		</tr>
		<tr>
			<td>3</td>
			<td></td>
			<td></td>
			<td></td>
			<td>r2</td>
		</tr>
	</tbody>
</table>
<h3>Passo a passo:</h3>
<ol>
	<li>Pilha: 0 Entrada: abc$</li>
	<li>Consulta a tabela para 0 e a: shift 1 Pilha: 0 1 Entrada: bc$</li>
	<li>Consulta a tabela para 1 e b: shift 2 Pilha: 0 1 2 Entrada: c$</li>
	<li>... (continuar até a pilha e a entrada estarem vazias ou ocorrer um erro)</li>
</ol>
<h3>Vantagens do SLR(1)</h3>
<ul>
	<li>
		<strong>Simples de implementar:</strong> O algoritmo SLR(1) é relativamente simples de implementar.
	</li>
	<li><strong>Eficiente:</strong> O algoritmo é eficiente para muitas gramáticas.</li>
</ul>
<h3>Desvantagens do SLR(1)</h3>
<ul>
	<li>
		<strong>Pode gerar conflitos:</strong> Em algumas gramáticas, podem ocorrer conflitos de redução-redução
		que não podem ser resolvidos pelo SLR(1).
	</li>
	<li>
		<strong>Menos poderoso que LR(1):</strong> O SLR(1) pode não ser capaz de analisar todas as gramáticas
		que podem ser analisadas por um analisador LR(1).
	</li>
</ul>
