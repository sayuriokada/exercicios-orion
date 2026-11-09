# Desafio Extra: aplicação completa com Docker Compose

Stack com três serviços ligados pela rede `backend`:

| Serviço | Imagem | Acesso |
| --- | --- | --- |
| `api` | build de `api/Dockerfile` (Node/Express) | <http://localhost:3004> |
| `db` | `postgres:17-alpine` | só pela rede interna, no hostname `db` |
| `pgadmin` | `dpage/pgadmin4:9` | <http://localhost:8080> |

## Estrutura

```text
desafio-extra/
├── api/
│   ├── src/index.js       # código da API
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
├── docker-compose.yml
├── .env.example           # modelo versionado; o .env fica fora do Git
└── .gitignore
```

## Como rodar

```bash
cp .env.example .env   # só na primeira vez
docker compose up -d
docker compose ps      # api e db devem aparecer como "healthy"
```

Depois de alterar o `Dockerfile` ou o `package.json`, rode `docker compose up --build -d`.

## Testando

**1. A API responde e grava no banco**

```bash
curl http://localhost:3004/health   # {"status":"ok","db":"ok"}

curl -X POST http://localhost:3004/mensagens \
  -H "Content-Type: application/json" \
  -d '{"texto":"Olá, pgAdmin!"}'

curl http://localhost:3004/mensagens
```

**2. Os dados aparecem na interface web**

1. Abra <http://localhost:8080> (o painel leva alguns segundos para subir na primeira vez).
2. Entre com o e-mail `senha@bootcamp.com.br` e a senha `orionsenhateste123#`.
3. Abra o servidor **Desafio Extra**, que já vem cadastrado, e digite a senha do banco quando ela for pedida. Ela também é `orionsenhateste123#`.
4. Navegue até **Databases > appdb > Schemas > public > Tables > mensagens**.
5. Clique com o botão direito na tabela e escolha **View/Edit Data > All Rows**.

**3. O código é montado por volume**

Altere algo em `api/src/index.js` e salve. A API reinicia sem novo build:

```bash
docker compose logs -f api   # Restarting 'src/index.js'. Ctrl+C sai dos logs
```

**4. Os dados persistem**

```bash
docker compose down     # remove containers e rede, mantém os volumes
docker volume ls | grep desafio-extra
docker compose up -d
curl http://localhost:3004/mensagens   # a mensagem continua lá
```

Para apagar os dados de verdade: `docker compose down -v`.

## Como os requisitos foram atendidos

- **Variáveis de ambiente:** o Compose lê o `.env` e preenche `DB_USER`, `DB_PASS`, `DB_NAME` e as credenciais do pgAdmin. Se faltar alguma, o `up` para e avisa qual é.
- **Volumes nomeados:** `db_data` guarda os dados do Postgres e `pgadmin_data` guarda as configurações do painel.
- **Rede nomeada:** `backend`. O DNS interno do Compose resolve o hostname `db` para a API e para o pgAdmin.
- **Dependências:** com `depends_on` e `condition: service_healthy`, a API e o pgAdmin só sobem depois que o healthcheck do banco passa.
- **Conexão do pgAdmin:** o servidor é cadastrado por um `servers.json` definido em `configs` no próprio Compose, o que permite usar as variáveis do `.env`. A senha não fica nesse arquivo.

## Dockerfile

- **Imagem leve:** usa `node:24-alpine` e instala só as dependências de produção.
- **Cache de camadas:** o `package*.json` é copiado antes do código, então alterar o código não reinstala as dependências.
- **`.dockerignore`:** mantém `node_modules` e arquivos desnecessários fora do build.
- **Segurança:** a API roda com o usuário `node`, sem permissão para alterar o próprio código.
- **`HEALTHCHECK`:** o Docker marca o container como `unhealthy` se a API ou o banco pararem de responder.
- **Um estágio só:** o reload usa o `node --watch-path`, nativo do Node. Sem `nodemon` não há dependências de desenvolvimento para separar, então um multi-stage não deixaria a imagem menor.

## Desenvolvimento e produção

O `docker-compose.yml` está configurado para desenvolvimento: monta `./api/src` por volume (somente leitura) e troca o comando do container para reiniciar a cada alteração. A imagem funciona sem isso, com o código copiado no build e `NODE_ENV=production`. O exercício 3 mostra como separar os dois ambientes em arquivos Compose.

## Observações

**Portas:** a API usa a 3004 porque as portas de 3000 a 3003 são usadas pelos outros exercícios. Para mudar, altere `API_PORT` ou `PGADMIN_PORT` no `.env`. O pgAdmin só aceita conexões desta máquina (`127.0.0.1`).

**Senha do banco:** o Postgres só usa as credenciais na primeira criação do volume. Se você trocar a senha no `.env` depois disso, a API não conecta mais. Para recriar o banco, rode `docker compose down -v` (isso apaga os dados).

**Login e servidor do pgAdmin:** o e-mail, a senha e o `servers.json` também só são lidos quando o volume `pgadmin_data` é criado. Mudanças depois disso precisam do mesmo `down -v`. O e-mail precisa ter formato válido: `admin@example.com` funciona, mas endereços como `admin@local` são recusados.
