const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// As credenciais vêm das variáveis de ambiente definidas no docker-compose.yml.
// DB_HOST é "db": o DNS interno do Compose resolve o nome do serviço para o IP do container.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Sem este handler, uma queda do banco derrubaria a API junto com a conexão ociosa
pool.on("error", (err) => {
  console.error("Conexão com o banco perdida:", err.message);
});

app.use(express.json());

// Status da aplicação, incluindo o acesso ao banco
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: "erro", db: "indisponível" });
  }
});

// Lista as mensagens gravadas
app.get("/mensagens", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, texto, criada_em FROM mensagens ORDER BY id"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Falha ao listar mensagens" });
  }
});

// Grava uma nova mensagem
app.post("/mensagens", async (req, res) => {
  const { texto } = req.body ?? {};

  if (typeof texto !== "string" || texto.trim() === "") {
    return res.status(400).json({ erro: 'Envie um JSON com o campo "texto"' });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO mensagens (texto) VALUES ($1) RETURNING id, texto, criada_em",
      [texto]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Falha ao gravar mensagem" });
  }
});

async function iniciar() {
  // IF NOT EXISTS: a tabela sobrevive entre execuções graças ao volume
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id SERIAL PRIMARY KEY,
      texto TEXT NOT NULL,
      criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log(`Conectado ao banco em ${process.env.DB_HOST}`);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API rodando na porta ${PORT}`);
  });
}

iniciar().catch((err) => {
  console.error("Não foi possível conectar ao banco:", err);
  process.exit(1);
});
