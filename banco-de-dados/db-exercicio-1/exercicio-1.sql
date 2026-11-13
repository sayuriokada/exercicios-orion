
--Exercício 1 — Banco relacional (SQL Básico)

-- Apaga as tabelas antes de criar, para o script começar sempre do zero
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS cursos;

--1. Tabela cursos

CREATE TABLE cursos (
    id         SERIAL PRIMARY KEY, 
    nome_curso TEXT NOT NULL
);

-- 2. Tabela alunos
CREATE TABLE alunos (
    id       SERIAL PRIMARY KEY,
    nome     TEXT NOT NULL,
    email    TEXT,
    curso_id INTEGER,

    CONSTRAINT fk_alunos_cursos
        FOREIGN KEY (curso_id) REFERENCES cursos (id)
);


-- 3. Inserindo dados
INSERT INTO cursos (nome_curso) VALUES
    ('Desenvolvimento Web'),   
    ('Banco de Dados'),        
    ('DevOps');

INSERT INTO alunos (nome, email, curso_id) VALUES
    ('Aline Astuta',   'aline.astuta@email.com',  1),
    ('Bruna Barros',   'bruna.barros@email.com',  2),
    ('Carla Cariani',  'carla.cariani@email.com', 3),
    ('Diana Dias',     'diana.dias@email.com',    1);


-- Consultas

SELECT * FROM cursos;
SELECT * FROM alunos;

-- Teste da chave estrangeira (deve DAR ERRO, pois o curso 99 não existe)

INSERT INTO alunos (nome, email, curso_id) VALUES
    ('Aluno Fantasma', 'fantasma@email.com', 99);
