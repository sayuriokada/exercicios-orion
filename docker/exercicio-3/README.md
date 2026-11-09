# Exercício 3: boas práticas e múltiplos ambientes

A API e o banco do exercício 2, agora com ambientes de desenvolvimento e produção separados.

| | dev | prod |
| --- | --- | --- |
| Arquivo | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| Estágio do Dockerfile | `dev` | `prod` |
| Processo | `nodemon` (live reload) | `node` |
| Dependências | todas | só as de produção |
| Código | volume `./src:/app/src` | copiado para a imagem |
| API no host | `localhost:3002` | `localhost:3003` |
| Banco no host | `127.0.0.1:5433` | não exposto |

## Estrutura

```text
exercicio-3/
├── src/app.js                # código da API
├── Dockerfile                # estágios base, dev, prod-deps e prod
├── docker-compose.base.yml   # configuração comum, reaproveitada com "extends"
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .dockerignore
└── .env.example
```

## Como rodar

```bash
cp .env.example .env   # só na primeira vez; depois troque a senha no .env

docker compose -f docker-compose.dev.yml up --build -d    # dev
docker compose -f docker-compose.prod.yml up --build -d   # prod
```

O `-d` roda os containers em segundo plano e libera o terminal. Sem ele, cada ambiente ocupa um terminal e mostra os logs ali mesmo.

Sem o `--build`, o Compose reaproveita a imagem que já existe e não pega alterações feitas em prod ou nas dependências.

Para acompanhar os logs e para encerrar:

```bash
docker compose -f docker-compose.dev.yml logs -f api   # Ctrl+C sai dos logs, os containers continuam rodando
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.prod.yml down
```

## Testando os critérios de sucesso

**1. Os ambientes funcionam de forma independente**

Com os dois no ar:

```bash
curl http://localhost:3002/health   # "ambiente":"development"
curl http://localhost:3003/health   # "ambiente":"production"

curl -X POST http://localhost:3002/mensagens \
  -H "Content-Type: application/json" \
  -d '{"texto":"só no dev"}'

curl http://localhost:3002/mensagens   # mostra a mensagem
curl http://localhost:3003/mensagens   # lista vazia: cada ambiente tem seu banco

docker compose -f docker-compose.dev.yml down
curl http://localhost:3003/health      # prod continua respondendo
```

**2. O live reload funciona só no dev**

Altere algo em `src/app.js` e salve. O log do dev mostra `[nodemon] restarting due to changes...`, e a resposta em `localhost:3002` muda sem novo build. A de `localhost:3003` continua igual até um novo `up --build` do prod.

**3. O build segue as boas práticas**

```bash
docker images | grep exercicio-3-api                       # compare os tamanhos
docker image history exercicio-3-api:prod                  # camadas da imagem final
docker compose -f docker-compose.prod.yml exec api ls -a /app   # só node_modules, package.json e src
```

## Boas práticas aplicadas

- **Multi-stage build:** um único Dockerfile gera as duas imagens, e a de prod não leva o nodemon.
- **Cache de camadas:** o `package*.json` é copiado antes do código, então alterar o código não reinstala as dependências.
- **`npm ci --omit=dev`:** instala exatamente o que está no `package-lock.json`. É a forma atual do `--only=production`, que está obsoleto.
- **Imagem Alpine com Node LTS:** o exercício 2 usava Node 20, que saiu de suporte em abril de 2026, por isso aqui a base é `node:24-alpine`.
- **`.dockerignore`:** mantém `.env`, `node_modules` e arquivos de projeto fora da imagem.
- **Usuário sem privilégios:** a API roda como `node`, e em prod não consegue alterar o próprio código.
- **`HEALTHCHECK` em prod:** o Docker marca o container como `unhealthy` se a API ou o banco pararem de responder.

## Observações

**Nome do projeto:** o `name:` no início de cada arquivo Compose é o que separa os ambientes. Sem ele, os dois arquivos usariam o nome da pasta como projeto e dividiriam containers, rede e banco.

**Volume em prod:** a API não monta nenhum volume. O banco mantém o volume nomeado `db_data`, porque sem ele os dados se perderiam a cada `down`.

**Credenciais:** os dois ambientes leem o mesmo `.env`. Em um deploy real, o prod teria segredos próprios, por exemplo `docker compose --env-file .env.prod -f docker-compose.prod.yml up`.

**Novas dependências:** elas ficam na imagem, não no volume. Depois de alterar o `package.json`, rode o `up --build` de novo.

**Senha do banco:** o Postgres só usa as credenciais na primeira criação do volume. Se você trocar a senha no `.env` depois disso, a API não conecta mais. Para recriar o banco, rode `down -v` no ambiente em questão (isso apaga os dados dele):

```bash
docker compose -f docker-compose.dev.yml down -v
```

**Portas ocupadas:** altere `API_PORT_DEV`, `API_PORT_PROD` ou `DB_PORT_DEV` no `.env`.
