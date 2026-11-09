# Imagem base leve, com Node LTS
FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

# Só o manifesto primeiro: alterar o código não reinstala as dependências
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# Os arquivos ficam com o root: o usuário node consegue ler, mas não alterar o código
USER node

EXPOSE 3000

# 127.0.0.1 porque "localhost" pode resolver para IPv6, e a API só escuta em IPv4
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1

# node direto, sem npm: menos um processo rodando
CMD ["node", "src/index.js"]
