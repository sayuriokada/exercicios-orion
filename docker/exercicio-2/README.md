# Exercício 2: API + banco com Docker Compose

Stack com dois serviços: `api` (Node/Express, build via Dockerfile) e `db` (Postgres, imagem oficial).

## Como rodar

```bash
cp .env.example .env   # só na primeira vez; depois troque a senha no .env
docker compose up --build -d
docker compose ps      # db deve aparecer como "healthy"
```

## Testando os critérios de sucesso

**1. Os serviços se comunicam pela rede interna**

```bash
docker network ls | grep backend
curl http://localhost:3001/health
```

**2. A API grava dados no banco**

```bash
curl -X POST http://localhost:3001/mensagens \
  -H "Content-Type: application/json" \
  -d '{"texto":"Olá, Postgres!"}'

curl http://localhost:3001/mensagens
```

**3. O volume persiste os dados após o `down`**

```bash
docker compose down     # remove containers e rede, mantém o volume
docker volume ls | grep db_data
docker compose up -d
curl http://localhost:3001/mensagens   # a mensagem continua lá
```

Para apagar os dados de verdade: `docker compose down -v`.

## Extras

**Arquivo `.env`:** o Compose lê o `.env` sozinho e preenche os `${DB_USER}`, `${DB_PASS}` e `${DB_NAME}`.
O `.env` fica fora do Git e da imagem. Só o `.env.example`, sem senha real, é versionado.

**`depends_on`:** a API só sobe depois que o healthcheck do banco passa.

```bash
docker compose down -v
docker compose up -d
docker compose ps -a    # veja o db ficar healthy antes de a api iniciar
docker compose logs api
```

## Observações

A API fica na porta 3001.

O Postgres só usa `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` na primeira criação do volume.
Se você mudar a senha no `.env` depois disso, a API não conecta mais: rode `docker compose down -v`
(isso apaga os dados) para recriar o banco.
