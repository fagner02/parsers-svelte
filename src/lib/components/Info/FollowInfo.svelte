<h2>O Algoritmo Follow na Análise Sintática</h2>
<h3>O que é o Algoritmo Follow?</h3>
<p>
	O Follow é utilizado para determinar o conjunto de terminais que podem aparecer <strong
		>imediatamente após</strong
	> um determinado não-terminal em uma cadeia válida da linguagem.
</p>
<h3>Para que serve o Follow?</h3>
<p>
	O conjunto Follow, em conjunto com o conjunto First, é utilizado para construir a tabela de
	parsing de um analisador LL(1). Essa tabela indica qual produção deve ser utilizada em cada passo
	da análise, com base no símbolo lido da entrada. O Follow é crucial para resolver situações em que
	uma produção pode derivar a cadeia vazia (ε), ou quando existem múltiplas produções com o mesmo
	símbolo inicial.
</p>
<h3>Como o Follow é calculado?</h3>
<p>O cálculo do conjunto Follow envolve as seguintes regras:</p>
<ol>
	<li>
		<strong>$ (fim de entrada):</strong> O símbolo $ é adicionado ao Follow do não-terminal inicial da
		gramática.
	</li>
	<li>
		<strong>Produções A → αBβ:</strong> Se uma produção tem a forma A → αBβ, onde α e β são
		sequências de terminais e não-terminais, então:
		<ul>
			<li>Todos os terminais em First(β) são adicionados ao Follow(B), exceto ε.</li>
			<li>
				Se ε está em First(β), então todos os terminais em Follow(A) são adicionados ao Follow(B).
			</li>
		</ul>
	</li>
	<li>
		<strong>Produções A → αB:</strong> Se uma produção tem a forma A → αB, onde α é uma sequência de
		terminais e não-terminais, e B é o último símbolo à direita, então todos os terminais em Follow(A)
		são adicionados ao Follow(B).
	</li>
</ol>
