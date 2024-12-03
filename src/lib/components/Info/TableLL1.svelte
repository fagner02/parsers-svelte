<h2>Construindo a Tabela LL(1): Um Guia Detalhado</h2>
<p>
	A tabela LL(1) é uma estrutura fundamental na análise sintática, utilizada para direcionar o
	processo de parsing de uma gramática. Ela é construída com base nos conjuntos First e Follow de
	cada não-terminal da gramática.
</p>
<p><strong>O que é uma tabela LL(1)?</strong></p>
<p>
	A tabela LL(1) é uma matriz onde as linhas correspondem aos não-terminais da gramática e as
	colunas correspondem aos terminais e ao símbolo de fim de entrada ($). Cada célula da tabela
	contém a produção a ser utilizada quando o não-terminal da linha e o terminal da coluna são
	encontrados na entrada.
</p>
<p><strong>Como construir a tabela LL(1)?</strong></p>
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
<p><strong>Exemplo:</strong></p>
<p>Considere a gramática:</p>
<pre><code
		>S -&gt; aA | <span>b</span>
A -&gt; c | <span>ε</span>
</code></pre>
<p>Os conjuntos First e Follow já foram calculados anteriormente:</p>
<ul>
	<li>First(S) = {'{(a, b)}'}</li>
	<li>First(A) = {'{(c, ε)}'}</li>
	<li>Follow(S) = {'{$}'}</li>
	<li>Follow(A) = {'{(b, $)}'}</li>
</ul>
<p>A tabela LL(1) seria:</p>
<table>
	<thead>
		<tr>
			<th></th>
			<th>a</th>
			<th>b</th>
			<th>c</th>
			<th>$</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>S</td>
			<td>S-&gt;aA</td>
			<td>S-&gt;b</td>
			<td></td>
			<td></td>
		</tr>
		<tr>
			<td>A</td>
			<td></td>
			<td></td>
			<td>A-&gt;c</td>
			<td>A-&gt;ε</td>
		</tr>
	</tbody>
</table>
<p><strong>Explicação:</strong></p>
<ul>
	<li>
		<strong>S -&gt; aA:</strong> Como &#39;a&#39; está em First(aA), colocamos S -&gt; aA na célula [S,
		a].
	</li>
	<li>
		<strong>S -&gt; b:</strong> Como &#39;b&#39; está em First(b), colocamos S -&gt; b na célula [S,
		b].
	</li>
	<li>
		<strong>A -&gt; c:</strong> Como &#39;c&#39; está em First(c), colocamos A -&gt; c na célula [A,
		c].
	</li>
	<li>
		<strong>A -&gt; ε:</strong> Como ε está em First(ε) e &#39;b&#39; e &#39;$&#39; estão em Follow(A),
		colocamos A -&gt; ε nas células [A, b] e [A, $].
	</li>
</ul>
<p><strong>Utilizando a tabela LL(1):</strong></p>
<p>
	A tabela LL(1) é utilizada pelo analisador sintático para decidir qual produção aplicar em cada
	passo da análise. Dado um não-terminal na pilha e um terminal na entrada, o analisador consulta a
	tabela para encontrar a produção a ser utilizada.
</p>
<p><strong>Condições para uma gramática ser LL(1):</strong></p>
<ul>
	<li>Nenhuma célula da tabela deve conter mais de uma produção.</li>
	<li>
		Para cada produção A → α e A → β, First(α) e First(β) devem ser disjuntos, a menos que β derive
		ε, e nesse caso, First(α) e Follow(A) devem ser disjuntos.
	</li>
</ul>
