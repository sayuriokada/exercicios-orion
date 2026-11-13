// Exercício 3 — Não relacional (CRUD Básico) com MongoDB
// Script para o mongosh. Banco usado: blog

// Recomeça do zero script - poder rodar várias vezes
db.posts.drop();

// Cria a coleção posts
db.createCollection("posts");

// Create: primeiro documento (titulo, autor e conteudo)
db.posts.insertOne({
  titulo: "Arquitetura da felicidade",
  autor: "Alain de Botton",
  conteudo: "Uma viagem pela filosofia e pela psicologia da arquitetura"
});

// Schema flexível: segundo documento com um campo novo (tags)
db.posts.insertOne({
  titulo: "Neuroarquitetura: A Neurociência no Ambiente Construído",
  autor: "Vilma Villarouco, Nicole Ferrer, Ana Paula Guedes, Julia Fonseca, Marie Monique Paiva",
  conteudo: "A conexão entre a neurociência e a arquitetura",
  tags: ["arquitetura", "neurociência", "psicologia"]
});

// Read: listar todos os documentos da coleção
const posts = db.posts.find().toArray();
console.log(JSON.stringify(posts, null, 2));