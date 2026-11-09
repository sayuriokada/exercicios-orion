# Imagem base leve
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia só os arquivos de dependências primeiro (aproveita o cache de camadas)
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --omit=dev

# Copia o restante do código da aplicação
COPY . .

# Roda como usuário não-root (já existe na imagem node)
USER node

EXPOSE 3000

CMD ["node", "app.js"]
