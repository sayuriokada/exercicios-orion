# Estágio comum: só o manifesto de dependências, para aproveitar o cache de camadas
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- DEV: todas as dependências + nodemon ----------
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
# O src/ copiado aqui é substituído pelo volume no docker-compose.dev.yml
COPY src ./src
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- Dependências de produção (estágio intermediário) ----------
FROM base AS prod-deps
RUN npm ci --omit=dev

# ---------- PROD: imagem final, leva só o necessário para rodar ----------
FROM node:24-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
# Os arquivos ficam com o root: o usuário node consegue ler, mas não alterar o código
USER node
EXPOSE 3000
# 127.0.0.1 porque "localhost" pode resolver para IPv6, e a API só escuta em IPv4
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1
# node direto, sem npm: menos um processo e nada de nodemon em produção
CMD ["node", "src/app.js"]
