<h2>Algoritmo de Construção da Tabela CLR(1) na Análise Sintática</h2>
<p>
	O algoritmo CLR(1) (Canonical LR(1)) é uma técnica para construir analisadores sintáticos que
	utilizam uma tabela de parsing para guiar a análise de uma cadeia de entrada. Ele é uma extensão
	do SLR(1) e oferece uma solução mais precisa para resolver conflitos de redução-redução, que podem
	ocorrer em algumas gramáticas.
</p>
<h3>Etapas para Construção da Tabela CLR(1)</h3>
<ol>
	<li>
		<p><strong>Construir o Autômato LR(0):</strong></p>
		<ul>
			<li>Seguir o algoritmo padrão para construir o autômato LR(0) para a gramática dada.</li>
			<li>Cada estado do autômato representa um conjunto de itens LR(0).</li>
		</ul>
	</li>
	<li>
		<p><strong>Calcular os Conjuntos Follow:</strong></p>
		<ul>
			<li>Determinar o conjunto Follow para cada não-terminal da gramática.</li>
		</ul>
	</li>
	<li>
		<p><strong>Construir os Itens LR(1):</strong></p>
		<ul>
			<li>
				Para cada item LR(0) [A → α · β] em um estado, criar um item LR(1) [A → α · β, a] para cada
				símbolo a em Follow(A) ou em First(β), se β não deriva a cadeia vazia.
			</li>
		</ul>
	</li>
	<li>
		<p><strong>Construir o Autômato LR(1):</strong></p>
		<ul>
			<li>
				Utilizar os itens LR(1) para construir o autômato LR(1), de forma similar ao LR(0), mas
				considerando o símbolo de lookahead.
			</li>
		</ul>
	</li>
	<li>
		<p><strong>Construir a Tabela CLR(1):</strong></p>
		<ul>
			<li>
				<strong>Ações:</strong>
				<ul>
					<li>
						<strong>Shift:</strong> Se um item [A → α · a β, a] está no estado i e existe uma transição
						de i para j sobre a, então a ação para o estado i e o símbolo a é &quot;shift j&quot;.
					</li>
					<li>
						<strong>Reduce:</strong> Se um item [A → α ·, a] está no estado i, então a ação para o estado
						i e o símbolo a é &quot;reduce A → α&quot;.
					</li>
					<li>
						<strong>Accept:</strong> Se o estado i contém o item [S&#39; → S ·, $], onde S&#39; é o símbolo
						inicial aumentado, então a ação para o estado i e o símbolo $ é &quot;accept&quot;.
					</li>
				</ul>
			</li>
			<li>
				<strong>Goto:</strong>
				<ul>
					<li>
						Se existe uma transição de i para j sobre o não-terminal A, então a entrada Goto[i, A] é
						j.
					</li>
				</ul>
			</li>
		</ul>
	</li>
</ol>
<h3>Resolvendo Conflitos</h3>
<ul>
	<li>
		<strong>Conflitos Shift-Reduce:</strong> O CLR(1) utiliza o símbolo de lookahead para resolver esses
		conflitos de forma mais precisa. Se o lookahead estiver no conjunto de símbolos que permitem a redução,
		então a ação &quot;reduce&quot; é escolhida. Caso contrário, a ação &quot;shift&quot; é escolhida.
	</li>
	<li>
		<strong>Conflitos Reduce-Reduce:</strong> O CLR(1) também pode resolver alguns conflitos de redução-redução
		que não podem ser resolvidos pelo SLR(1). Isso ocorre quando os conjuntos de lookahead para as duas
		reduções são disjuntos.
	</li>
</ul>
<h3>Vantagens do CLR(1) em relação ao SLR(1)</h3>
<ul>
	<li>
		<strong>Maior poder de reconhecimento:</strong> O CLR(1) pode analisar uma classe maior de gramáticas
		do que o SLR(1).
	</li>
	<li>
		<strong>Menos conflitos:</strong> O uso do símbolo de lookahead permite resolver mais conflitos de
		redução-redução.
	</li>
</ul>
<h3>Desvantagens do CLR(1)</h3>
<ul>
	<li>
		<strong>Maior complexidade:</strong> A construção do autômato LR(1) e da tabela CLR(1) é mais complexa
		do que para o SLR(1).
	</li>
	<li>
		<strong>Maior número de estados:</strong> O autômato LR(1) geralmente tem um número maior de estados
		do que o LR(0).
	</li>
</ul>
