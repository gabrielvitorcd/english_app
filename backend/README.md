# LearnWatching · API

Backend do LearnWatching: lista as legendas de um vídeo do YouTube e guarda os dados do produto num Postgres
próprio. A transcodificação dos vídeos e o estudo acontecem no navegador (veja `app/`).

**Stack:**
- Python 3.13 com uv
- FastAPI, Pydantic v2 e SQLAlchemy 2 async (psycopg 3)
- PostgreSQL 17 e Alembic
- structlog
- yt-dlp e httpx para as legendas
- Na VPS, atrás da borda (o Caddy compartilhado com o core-studio)

## Arquitetura

O backend é um **monólito modular**, e cada módulo é hexagonal: `domain` (regras puras) → `application`
(casos de uso e ports) → `infrastructure` (ORM e adaptadores) → `api` (rotas e schemas). É a mesma
arquitetura do core-studio.

| Módulo | O que faz |
|---|---|
| `system` | `/health` (responde `"ESTAMOS ONLINE!"`) e `/ready` (testa o banco) |
| `subtitles` | `GET /api/subtitles/list?video_url=`: lista as legendas de um vídeo do YouTube (manuais primeiro, depois as automáticas). Domínio puro para o id do vídeo, a montagem da lista e a conversão VTT→SRT; a porta `SubtitleSource` é implementada pelo adaptador yt-dlp/httpx em `infrastructure/ytdlp.py` |
| `users` | por enquanto só a tabela `user` (`infrastructure/orm.py`), sem rotas |

Comum a todos fica em `app/core/`:
- `config.py`: configuração;
- `db.py`: banco, com engine async (psycopg 3) e a naming convention;
- `errors.py`: erros em Problem Details;
- `logging.py`: logs com structlog;
- `middleware.py`: o request id de cada resposta.

O `app/main.py` monta a aplicação com `create_app()` a partir da lista `MODULES`.

As fronteiras são verificadas pelo `lint-imports`:
- o `core` não conhece os módulos;
- o domínio não conhece frameworks;
- as camadas respeitam a ordem;
- os módulos só usam a interface pública (`__init__`) uns dos outros.

A chamada ao yt-dlp é bloqueante, por isso a rota é `def` (o FastAPI a roda numa thread, fora do event loop).
O yt-dlp só lê as informações do vídeo (`download=False`), então a imagem não precisa do `ffmpeg`.

## Rodar local

```bash
docker compose -f compose.dev.yml up -d   # Postgres em 127.0.0.1:5433 (learn/learn/learnwatching)
uv sync
make migrate
make dev                                  # API em http://localhost:8000 (docs em /docs)
```

Sem `.env`, a API usa o Postgres do `compose.dev.yml` e aceita o app do Vite (`http://localhost:5200`).
Para mudar alguma coisa, copie `.env.example` para `.env` e ajuste `DATABASE_URL`, `CORS_ORIGINS` e
`ENV=dev`. Para desligar o banco: `docker compose -f compose.dev.yml down` (`-v` apaga os dados).
A porta 5433 é para não brigar com o Postgres de dev do core-studio (5432).

## Testes e qualidade

```bash
make check     # ruff + format + lint-imports + mypy --strict + pytest
```

Os testes usam um Postgres real:
- se `TEST_DATABASE_URL` estiver definida, usam esse banco (o banco é apagado e recriado pelas migrations);
- senão, sobem um `postgres:17-alpine` com testcontainers (precisa de Docker).

Cada teste fora de `tests/unit` começa com o banco limpo (TRUNCATE). Os testes nunca acessam o YouTube:
`tests/unit` troca o yt-dlp e o httpx por versões falsas, e `tests/integration` injeta um adaptador falso da
porta `SubtitleSource` (`app.dependency_overrides`).

Mudou rota ou schema? Rode `make openapi` para atualizar `docs/openapi.json`, depois `npm run api:types`
em `app/`.

## Criar um novo módulo

1. Crie `app/modules/<nome>/` com `domain/`, `application/`, `infrastructure/`, `api/` e um `__init__.py`
   que exporta só o `router` e o que outros módulos podem usar. Siga o padrão de `subtitles`.
2. As regras vão em `domain/models.py`, sem FastAPI, SQLAlchemy nem Pydantic (use dataclasses).
3. Os casos de uso ficam em `application/services.py` e recebem as portas (`typing.Protocol`, em
   `application/ports.py`) como parâmetro ou no construtor.
4. As tabelas ficam em `infrastructure/orm.py`, herdando de `app.core.db.Base`. O módulo é dono delas,
   então nada de JOIN com tabelas de outro módulo. Adaptadores externos (APIs, bibliotecas) também ficam em
   `infrastructure/`.
5. As rotas ficam em `api/routes.py` e os schemas Pydantic em `api/schemas.py`. A sessão do banco vem de
   `Depends(get_session, scope="function")` (veja `app/modules/system/routes.py`).
6. Registre o módulo em `MODULES`, no `app/main.py`.
7. Inclua o módulo nos contratos do `[tool.importlinter]` no `pyproject.toml` (camadas, domínio puro,
   independência e o contrato de interface pública).
8. Gere a migration com `make makemigration m="..."`, revise o arquivo, e atualize o contrato com
   `make openapi`.

## Como adicionar depois, seguindo o core-studio

Ficaram de fora por enquanto. O backend do core-studio já tem cada um pronto para servir de modelo:

- **Jobs (fila em segundo plano):**
  - pasta `app/jobs/` com a tabela `jobs` no Postgres (`SELECT … FOR UPDATE SKIP LOCKED`, `LISTEN/NOTIFY`,
    backoff exponencial);
  - o decorador `@job("<módulo>.<ação>")` em `<módulo>/jobs.py`, importado no `__init__.py` do módulo;
  - o processo `python -m app.jobs.worker`: alvo `make worker` e serviço `worker` no compose, com a mesma
    imagem e `RUN_MIGRATIONS=0`;
  - efeitos entre módulos passam a ir por jobs na mesma transação, idempotentes por `ref`;
  - acrescente `app.jobs` ao contrato "core não depende dos módulos".
- **Idempotência:**
  - `app/core/idempotency.py`: `IdempotencyMiddleware`, cabeçalho `Idempotency-Key` e resposta repetida
    com `Idempotent-Replayed`;
  - o middleware entra em `create_app()` antes do CORS, com a tabela das chaves e a limpeza periódica por
    job;
  - exponha `Idempotent-Replayed` em `expose_headers` do CORS.
- **Autenticação:**
  - o módulo `users` completo do core: `domain`, `application/services.py` e `api/deps.py` com
    `CurrentUser`/`Session`;
  - `app/core/security.py`: JWT de acesso curto, refresh com rotação, argon2 via `pwdlib` e limite de
    tentativas no banco;
  - exige `JWT_SECRET` no Settings e no `.env`; o `make openapi` passa a gerar um segredo provisório, como
    no core;
  - as rotas novas usam `CurrentUser`.
- **Arquivos por sha256:**
  - o módulo `files` do core: blobs em `DATA_DIR` endereçados pelo sha256, sem duplicar, e URLs assinadas
    com `PUBLIC_API_URL` e `FILE_URL_TTL_HOURS`;
  - exige `DATA_DIR` no Settings, um volume `/data` no compose e a pasta criada no Dockerfile, com dono do
    usuário do container.
- **Paginação:** `app/core/pagination.py` (paginação por cursor `(created_at, id)`), usada nas rotas de lista
  e nos repositórios (`page(after, limit)`).

## Deploy na VPS

Produção: app em `https://<domínio>` e API em `https://api.<domínio>`, na mesma VPS do core-studio
(Contabo, Ubuntu 24.04, usuário `core`). O domínio ainda não existe.

O servidor já está preparado pelo core-studio: usuário `core`, Docker e firewall. O HTTPS é da **borda**, o
Caddy compartilhado em `/opt/borda` (veja `borda/README.md` no core-studio). A API entra na rede Docker
`borda` como `learnwatching-api`. O Postgres é só deste projeto e não entra nela.

- **Teste no PC:** `make teste` sobe a branch atual em `https://app.localhost:8443` (API em
  `https://localhost:8443`).
  - Banco próprio (projeto `learnwatching-teste`) e Caddy próprio nas portas 8080/8443, para rodar junto
    com o teste do core.
  - Configuração em `backend/.env.teste` (fora do git; exemplo no topo de `backend/deploy/teste.sh`).
  - Fica observando `app/`.
  - Desligar: `make teste-parar`. Apagar os dados de teste: `backend/deploy/teste.sh --apagar`.
  - Os vídeos de `app/public/videos/` nunca vão para o build.
- **`main` = produção.** Depois do merge na `main`: `API_URL=https://api.<domínio> make deploy`
  (`deploy/publicar.sh`; quando o domínio existir, o padrão do `API_URL` passa a ser ele). O deploy:
  1. monta o app numa cópia limpa da `main`;
  2. leva o bundle do ffmpeg.wasm da sua pasta (sha256 no log; se faltar, `make wasm`);
  3. envia a versão e monta a imagem `learnwatching-api:<sha>` na VPS;
  4. roda o `deploy/deploy.sh`, que faz o backup do banco, sobe a versão e instala o site em
     `/opt/borda/sites/learnwatching.caddy` (validate/reload; se a borda recusar, devolve o anterior);
  5. espera a API ficar saudável; se não ficar em 3 minutos, volta sozinho para a versão anterior.

  Voltar à mão: `make deploy-voltar`.
- Na VPS: `/opt/learnwatching/{.env, compose.yml, deploy/, app-dist/, releases/<sha>/, backups/, .deploy/}`.

### Preparar (uma vez)
1. A borda instalada pelo core-studio (`borda/instalar.sh`; ele cria `/opt/learnwatching` e o `app-dist`
   com o usuário `core`). O PR do core-studio com a borda entra e é publicado **antes** do primeiro deploy
   do LearnWatching.
2. O `.env`, na VPS:
   ```bash
   install -d /opt/learnwatching/releases
   # copie backend/.env.example para /opt/learnwatching/.env e preencha: POSTGRES_PASSWORD
   # (openssl rand -hex 32), LEARN_DOMAIN=api.<domínio>, LEARN_APP_DOMAIN=<domínio>,
   # PUBLIC_API_URL=https://api.<domínio>, CORS_ORIGINS=https://<domínio>
   chmod 600 /opt/learnwatching/.env
   ```
3. DNS: registros `A` para o domínio raiz, `api` e `www`, com o IP da VPS. A borda emite os certificados.
4. Primeiro deploy: `API_URL=https://api.<domínio> make deploy`. Ele recusa enquanto o domínio for o do
   `.env.example`, e o `deploy.sh` recusa se a borda não existir. Confira `https://<domínio>` no navegador:
   o transcode precisa dos cabeçalhos COOP/COEP, que vêm do `site.caddy`.

### Deploy pelo GitHub Actions (desligado)
- Variáveis: `DEPLOY_ENABLED=true`, `PUBLIC_API_URL` e `FFMPEG_BUNDLE_SHA256`.
- Segredos: `DEPLOY_HOST`, `DEPLOY_USER` (`core`), `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS` e `FFMPEG_BUNDLE_URL`
  (o bundle não está no git).

### Backups
1. **Antes de cada deploy:** `backups/antes-do-deploy-*.dump` (ficam os 10 últimos).
2. **Dump diário na VPS (opcional):** `deploy/dump-diario.sh` no cron do `core`:
   ```
   30 3 * * * /opt/learnwatching/deploy/dump-diario.sh >> /opt/learnwatching/backups/dump-diario.log 2>&1
   ```
   Os dumps ficam em `backups/diario/`, por 14 dias.
3. **Cópia externa (opcional):** `deploy/backup.sh` para o restic, só do banco (7 diários, 4 semanais e
   6 mensais), com `/etc/learnwatching-backup.env`. As instruções estão no topo do script.

### Restaurar
```bash
cd /opt/learnwatching
docker compose stop api
docker compose exec -T db sh -c 'dropdb -U "$POSTGRES_USER" "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' < backups/diario/learnwatching-AAAAMMDD-HHMM.dump
docker compose start api
# do restic: restic dump latest learnwatching.dump --tag learnwatching > /tmp/learnwatching.dump
```
