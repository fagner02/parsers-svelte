<script>
	let { receiveInput } = $props();
</script>

<div class="field col">
	<p>1. Dado o conjunto first a seguir, forneça uma gramática que gera esse conjunto first</p>
	<pre>{`E: {(, id}
X: {+}
X: {ε}
T: {(, id}
T': {*}
T': {ε}
F: {(}
F: {id}`}</pre>
	<textarea name="q1" id="q1" oninput={receiveInput} rows="4"></textarea>
</div>
<hr />
<div class="field col">
	<p>2. Dado o conjunto follow a seguir, forneça uma gramática que gera esse conjunto follow</p>
	<pre>
{`S: {$}
A: {C}
B: {a, C, $}`}</pre>
	<textarea name="q2" id="q2" oninput={receiveInput} rows="4"></textarea>
</div>
<hr />
<div class="field col">
	<p>3. Dada a tabela slr a seguir, forneça uma gramática que gera essa tabela</p>
	<pre>{`estados | +  | (  | )  | id | $  | E  | T 
--------+----+----+----+----+----+----+---
s0      |    |    |    |    |    | g1 |   
s1      | s2 |    |    |    | a  |    |   
s2      |    | s3 |    | s4 |    |    | g5
s3      |    | s3 |    | s4 |    |    | g6
s4      | r3 |    | r3 |    | r3 |    |   
s5      | r1 |    |    |    | r1 |    |   
s6      |    |    | s7 |    |    |    |   
s7      | r2 |    | r2 |    | r2 |    |   
`}</pre>
	<textarea name="q3" id="q3" oninput={receiveInput} rows="4"></textarea>
</div>
<hr />
<div class="field col">
	<p>4. Dada a tabela lr1 a seguir, forneça uma gramática que gera essa tabela</p>
	<pre>{`estados | c  | d  | $  | S  | C 
--------+----+----+----+----+---
s0      | s1 | s2 |    | g3 | g4
s1      | s1 | s2 |    |    | g5
s2      |    |    | r3 |    |   
s3      |    |    | a  |    |   
s4      |    |    | r1 |    |   
s5      |    |    | r2 |    |   
`}</pre>
	<textarea name="q4" id="q4" oninput={receiveInput} rows="4"></textarea>
</div>
<hr />
<div class="field col">
	<p>5. Dê o conjunto First da seguinte gramática</p>
	<pre>{`M -> S T
S -> C | SP
C -> CC CS
SP -> EC ES
T -> CO AC
CC -> cca | ccb
CP i -> sia | sib
EC -> ccb | ccc
EP i -> sia | sib | sic
CO -> ca | cb | cc
AC -> aa`}</pre>
	<textarea name="q6" id="q6" oninput={receiveInput} rows="4"></textarea>
</div>
<hr />
<div class="field col">
	<p>
		6. Mostre os passos da análise sintática ll(1) da string "a b a c" para a seguinte gramática
	</p>
	<pre>{`S -> a A
A -> b S | c`}</pre>
	<textarea name="q7" id="q7" oninput={receiveInput} rows="4"></textarea>
</div>
<hr />
<div class="field col">
	<p>7. Dê uma gramática que aceita essas entradas</p>
	<pre>{`num
num + num
num + num * num
(num - num) * num
num * (num)
((num + num) * num)
`}</pre>
	<textarea name="q8" id="q8" oninput={receiveInput} rows="4"></textarea>
</div>

<style>
	@import './assignment.css';
</style>
