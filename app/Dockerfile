# Estágio de Build/Desenvolvimento
FROM node:20-slim

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (otimiza cache do Docker)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código (exceto node_modules, ignorado pelo .dockerignore)
COPY . .

# Expõe a porta que o Vite usará
EXPOSE 5200

# Variável de ambiente para o Vite funcionar em containers
ENV VITE_HMR_PORT=5200
ENV WDS_SOCKET_PORT=0

# Comando para rodar o Vite com host aberto para desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5200"]