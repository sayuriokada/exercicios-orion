-- Exercício 2 — Banco relacional (JOINs e Filtros)
-- Usa o esquema e os dados do Exercício 1 (tabelas cursos e alunos).

SELECT
    a.nome       AS aluno,
    c.nome_curso AS curso
FROM alunos a
INNER JOIN cursos c ON a.curso_id = c.id
ORDER BY a.nome;

SELECT
    a.nome       AS aluno,
    c.nome_curso AS curso
FROM alunos a
INNER JOIN cursos c ON a.curso_id = c.id
WHERE c.nome_curso = 'Desenvolvimento Web'
ORDER BY a.nome;

UPDATE alunos
SET curso_id = (SELECT id FROM cursos WHERE nome_curso = 'DevOps')
WHERE nome = 'Bruna Barros';

SELECT
    a.nome       AS aluno,
    c.nome_curso AS curso
FROM alunos a
INNER JOIN cursos c ON a.curso_id = c.id
ORDER BY a.nome;

SELECT
    c.nome_curso AS curso_sem_alunos
FROM cursos c
LEFT JOIN alunos a ON a.curso_id = c.id
WHERE a.id IS NULL;