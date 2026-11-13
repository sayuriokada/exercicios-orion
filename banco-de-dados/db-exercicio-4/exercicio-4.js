// Exercício 4 — Não relacional (Consultas Avançadas) com MongoDB
// Usa a coleção "posts" do Exercício 3 (banco: blog).

// Update: adicionar o campo "comentarios"  em um post
db.posts.updateOne(
  { titulo: "Arquitetura da felicidade" },
  {
    $set: {
      comentarios: [
        { autor: "Marina", texto: "Adorei a abordagem sobre espaço e bem-estar.", nota: 5 },
        { autor: "Paulo",  texto: "Boa indicação de leitura.",                    nota: 4 }
      ]
    }
  }
);

// Consulta dentro de um array: posts que têm a tag "neurociência"
console.log("--- Posts com a tag 'neurociência' ---");
console.log(JSON.stringify(db.posts.find({ tags: "neurociência" }).toArray(), null, 2));

// Consulta por campo: posts de um autor específico
console.log("--- Posts do autor 'Alain de Botton' ---");
console.log(JSON.stringify(db.posts.find({ autor: "Alain de Botton" }).toArray(), null, 2));

// Extra: consulta dentro de documentos aninhados (comentários feitos pela Marina)
console.log("--- Posts com comentário da Marina ---");
console.log(JSON.stringify(db.posts.find({ "comentarios.autor": "Marina" }).toArray(), null, 2));