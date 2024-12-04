<h2>Algoritmo de Parsing com a Tabela CLR(1) na Análise Sintática</h2>
<p>
	O algoritmo de parsing com a tabela CLR(1) é um método utilizado para analisar a sintaxe de uma
	cadeia de caracteres, verificando se ela está de acordo com uma gramática formal. Essa técnica é
	uma das mais poderosas e precisas para a análise sintática, sendo amplamente utilizada em
	compiladores e interpretadores.
</p>
<h3>Como funciona o algoritmo?</h3>
<p>
	O algoritmo de parsing com a tabela CLR(1) funciona de forma semelhante aos outros algoritmos de
	parsing baseados em tabelas, como o SLR(1). A principal diferença está na construção da tabela,
	que utiliza informações mais precisas sobre os símbolos de lookahead, permitindo resolver um maior
	número de conflitos.
</p>
<ol>
	<li>
		<p><strong>Inicialização:</strong></p>
		<ul>
			<li>
				Cria-se uma pilha e insere-se o símbolo de fim de entrada ($) e o estado inicial da tabela
				CLR(1).
			</li>
			<li>Aponta-se para o primeiro símbolo da cadeia de entrada.</li>
		</ul>
	</li>
	<li>
		<p><strong>Repete enquanto a pilha não estiver vazia:</strong></p>
		<ul>
			<li>Seja X o estado no topo da pilha e a o símbolo atual da entrada.</li>
			<li>Consulta-se a tabela CLR(1) na linha X e coluna a.</li>
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
<h3>Exemplo:</h3>
<p>
	Considere a tabela CLR(1) de um exemplo anterior. Suponha que a cadeia de entrada seja
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
<h3>Vantagens do CLR(1):</h3>
<ul>
	<li>
		<strong>Maior poder de reconhecimento:</strong> O CLR(1) pode analisar uma classe maior de gramáticas
		do que o SLR(1).
	</li>
	<li>
		<strong>Menos conflitos:</strong> O uso do símbolo de lookahead permite resolver mais conflitos de
		redução-redução.
	</li>
	<li>
		<strong>Mais preciso:</strong> A tabela CLR(1) é construída de forma mais precisa, utilizando informações
		mais detalhadas sobre os símbolos de lookahead.
	</li>
</ul>
<h3>Desvantagens do CLR(1):</h3>
<ul>
	<li>
		<strong>Maior complexidade:</strong> A construção da tabela CLR(1) é mais complexa do que para o
		SLR(1).
	</li>
	<li>
		<strong>Maior número de estados:</strong> O autômato LR(1) geralmente tem um número maior de estados
		do que o LR(0).
	</li>
</ul>
