<h2>O Algoritmo First na Análise Sintática: Uma Explicação Detalhada</h2>

<h3>O que é o Algoritmo First?</h3>
<p>
	O First é utilizado para determinar o conjunto de símbolos que podem iniciar uma determinada
	produção gramatical. Em outras palavras, o First de uma produção indica os possíveis primeiros
	símbolos de uma cadeia que pode ser derivada a partir dessa produção.
</p>
<h3>Para que serve o First?</h3>
<p>
	O conjunto First é crucial para a construção de tabelas de parsing, que são utilizadas por
	analisadores LL(1) e outros tipos de analisadores. Essas tabelas direcionam o processo de análise,
	indicando qual produção deve ser utilizada em cada passo, com base no símbolo lido da entrada.
</p>
<h3>Como o First é calculado?</h3>

<p>
	A construção do conjunto First envolve a aplicação de regras específicas, que variam ligeiramente
	dependendo da gramática e do tipo de analisador. No entanto, as regras básicas são:
</p>
<ol>
	<li>
		<b>Terminais:</b> Se uma produção começa com um terminal, esse terminal pertence ao First da produção.
	</li>
	<li>
		<b>Não-terminais:</b> Se uma produção começa com um não-terminal A, adicionamos ao First da produção
		todos os terminais que podem iniciar as cadeias derivadas de A. Se ε (cadeia vazia) pode ser derivada
		de A, adicionamos ε ao First da produção.
	</li>
	<li>
		<b>Combinações:</b> Para produções com múltiplos símbolos, o First é calculado considerando os Firsts
		de cada símbolo, com algumas adaptações para lidar com a derivação da cadeia vazia.
	</li>
</ol>
