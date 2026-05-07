# LearnWatching

> Aprenda inglês assistindo vídeos com legendas inteligentes e prática de listening.

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)](https://github.com/gabrielvitorcd/english_app)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

---

## 📖 Sobre o Projeto

**LearnWatching** é uma plataforma de aprendizado de idiomas através de vídeos com legendas sincronizadas (SRT). O aluno assiste segmentos de vídeo, digita o que entendeu e recebe feedback imediato via IA.

### ✨ Funcionalidades

- **Player Inteligente** — Vídeo segmentado por timestamps do arquivo SRT
- **Avaliação por IA** — Comparação entre o entendimento do aluno e a legenda original
- **Shadowing** — Prática de repetição oral para trechos acertados
- **Revisão Espaçada** — Sistema estilo Anki para trechos com erro
- **Dashboard de Progresso** — Estatísticas e vocabulário aprendido

---

## 🏗️ Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│   FastAPI    │────▶│  PostgreSQL │
│  Frontend   │     │   Backend    │     │   Database  │
│  (Port 5200)│     │  (Port 8000) │     │  (Port 5432)│
└─────────────┘     └──────────────┘     └─────────────┘
```

### Stack Tecnológico

| Camada      | Tecnologia                          |
|-------------|-------------------------------------|
| Frontend    | React 19 + TypeScript + Vite        |
| Backend     | FastAPI + SQLAlchemy + Alembic      |
| Database    | PostgreSQL 15                       |
| Infra       | Docker + Docker Compose             |

---

## 📁 Estrutura do Projeto

```
english_srt/
├── backend/
│   ├── alembic/                 # Migrations do banco
│   ├── app/
│   │   ├── main.py              # Entry point da API
│   │   ├── domain/              # Entidades e regras de negócio
│   │   ├── application/         # Casos de uso
│   │   ├── infrastructure/
│   │   │   └── db/
│   │   │       ├── connection.py # SQLAlchemy engine
│   │   │       └── models.py    # Modelos ORM
│   │   └── interfaces/          # Rotas e controllers
│   ├── tests/                   # Testes com pytest
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/          # Navegação superior
│   │   │   ├── PlayerVideo/     # Player de vídeo
│   │   │   ├── Subtitle/        # Renderização de legenda
│   │   │   └── useSrt/          # Hook de sincronização SRT
│   │   └── pages/
│   │       ├── Select/          # Home / seleção de conteúdo
│   │       ├── Player/          # Player principal
│   │       ├── Shadowing/       # Prática de fala
│   │       └── Progresso/       # Dashboard de estatísticas
│   ├── public/
│   │   └── videos/              # Vídeos e legendas .srt
│   └── Dockerfile
├── docker-compose.yml           # Orquestração completa
├── .env.dev                     # Variáveis de ambiente
└── package.json                 # Scripts do root
```

---

## 🚀 Quick Start

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- Git clonado para sua máquina local

### 1. Clone o repositório

```bash
git clone https://github.com/gabrielvitorcd/english_app.git
cd english_app
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.dev .env
```

Edite `.env` com suas credenciais do banco:

```env
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=english_srt
DB_HOST=db
DB_PORT=5432
```

### 3. Suba os containers

```bash
docker-compose up --build
```

A aplicação estará disponível em:

| Serviço   | URL                  |
|-----------|----------------------|
| Frontend  | http://localhost:5200 |
| Backend   | http://localhost:8000 |
| Database  | localhost:5432       |

### 4. Health Check

```bash
curl http://localhost:8000/health
# Resposta: "ESTAMOS ONLINE!"
```

---

## 🛠️ Desenvolvimento

### Backend

```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Rodar servidor localmente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Migrations
alembic revision --autogenerate -m "descricao"
alembic upgrade head
alembic downgrade -1

# Testes
pytest
pytest -v        # Output detalhado
pytest -x        # Parar no primeiro erro
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Lint
npm run lint

# Preview do build
npm run preview
```

---

## 📦 Comandos Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f api
docker-compose logs -f web

# Rebuildar um serviço específico
docker-compose build api
docker-compose up -d api

# Acessar shell do container
docker exec -it fastapi_api_english sh
docker exec -it react_frontend_english sh
```

---

## 🧪 Testes

### Backend

Os testes usam `pytest` e estão localizados em `backend/tests/`.

```bash
# Rodar todos os testes
cd backend && pytest

# Com coverage
pytest --cov=app

# Teste específico
pytest tests/test_connection.py -v
```

### Frontend

```bash
cd frontend

# Lint (validação de código)
npm run lint

# Build (valida compilação TypeScript)
npm run build
```

---

## 🔌 API Endpoints

| Método | Endpoint     | Descrição              |
|--------|--------------|------------------------|
| GET    | `/health`    | Health check da API    |

> **Nota:** Endpoints adicionais serão documentados conforme implementação.

---

## 🎯 Como Funciona o Fluxo de Aprendizado

```
1. 📺 Assistir
   └─→ Vídeo segmentado por timestamps do SRT

2. ✍️ Digitar
   └─→ Aluno escreve o que entendeu do segmento

3. 🤖 Avaliar (IA)
   └─→ LLM compara com legenda original e dá feedback

4. ✅ Acertou?
   ├─→ SIM → Vai para Shadowing (repetição oral)
   └─→ NÃO → Vai para Revisão (fila espaçada)

5. 📊 Progresso
   └─→ Estatísticas e vocabulário salvos no dashboard
```

---

## 🔐 Variáveis de Ambiente

| Variável      | Descrição                | Padrão     |
|---------------|--------------------------|------------|
| `DB_USER`     | Usuário do PostgreSQL    | -          |
| `DB_PASSWORD` | Senha do PostgreSQL      | -          |
| `DB_NAME`     | Nome do banco            | -          |
| `DB_HOST`     | Host do banco            | `db`       |
| `DB_PORT`     | Porta do PostgreSQL      | `5432`     |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Distribuído sob a licença ISC. Veja `LICENSE` para mais informações.

---

## 👤 Autor

**Gabriel Vitor**  
[GitHub](https://github.com/gabrielvitorcd) • [LinkedIn](https://linkedin.com/in/dev-gabriel-vitor)

---

## 🙏 Agradecimentos

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/)
- [Vite](https://vitejs.dev/)

---

<p align="center">Feito com ❤️ para aprendizado de idiomas</p>
