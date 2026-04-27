# Estágio de Build/Desenvolvimento
FROM node:20-slim

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta que o Vite usará (5173 é o padrão)
EXPOSE 5200

# Comando para rodar o Vite com host aberto
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]