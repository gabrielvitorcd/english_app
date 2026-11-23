#!/usr/bin/env bash
# Deploy de uma versão na VPS. Chamado pelo publicar.sh (no PC: `make deploy`, depois do merge na main)
# ou pelo GitHub Actions (workflow "deploy", desligado). À mão: deploy.sh <sha>  (ou deploy.sh --voltar).
#
# Layout em /opt/learnwatching (o .env e os dados ficam; o resto vem de cada versão):
#   .env                     segredos e domínios (feito à mão, nunca vai para o GitHub)
#   releases/<sha>/          compose.yml, deploy/ e app/ (o app estático) de cada versão; as 5 últimas ficam
#   compose.yml, deploy/     cópia da versão no ar
#   app-dist/                o app no ar (a borda monta esta pasta: atualizar o conteúdo, nunca recriar)
#   backups/                 dump do banco antes de cada deploy (os 10 últimos)
#   .deploy/atual, anterior  sha no ar e o de antes
#
# O servidor já foi preparado pelo core-studio (usuário core, Docker, firewall) e o HTTPS é da borda (o
# Caddy compartilhado da VPS, em /opt/borda; veja borda/README.md no core-studio). Cada versão traz o seu
# deploy/site.caddy, que este script grava em /opt/borda/sites/learnwatching.caddy com os domínios do .env
# (LEARN_DOMAIN, LEARN_APP_DOMAIN), valida e recarrega na borda; se a borda recusar, devolve o anterior.
# O site do core-studio nunca é tocado.
#
# Passos: confere (versão com site.caddy, borda instalada, domínios no .env, imagem montada) → backup do
# banco → configuração e app da versão → sobe → site na borda → espera a API ficar saudável. Se não ficar
# em 3 minutos, volta sozinho para a versão anterior e sai com erro.
set -euo pipefail

BASE=${DEPLOY_BASE:-/opt/learnwatching}
BORDA_SITES=${BORDA_SITES:-/opt/borda/sites}   # pasta dos sites da borda (montada no container da borda)
BORDA=${BORDA_CONTAINER:-borda}                 # container da borda (outro nome só em teste)
SITE=learnwatching                              # o site deste projeto: $BORDA_SITES/learnwatching.caddy
# Imagem da versão: montada na própria VPS pelo publicar.sh (sem registro de imagens por enquanto).
LOCAL_IMAGE=learnwatching-api
cd "$BASE"
mkdir -p .deploy backups releases app-dist

log() { echo "[deploy $(date +%H:%M:%S)] $*"; }

# ---------- borda ----------
# Estas funções são chamadas dentro de "if"/"||", onde o set -e não vale: cada passo devolve o erro
# explicitamente.

ler_env() {  # valor de $1 no .env (a última linha que o define), sem aspas nem comentário no fim
  local v
  v=$(grep -E "^[[:space:]]*$1=" .env 2>/dev/null | tail -n 1) || true
  v=${v#*=}
  v=${v%%[[:space:]]#*}
  v=${v#"${v%%[![:space:]]*}"}
  v=${v%"${v##*[![:space:]]}"}
  if [ ${#v} -ge 2 ] && [[ $v == \"*\" || $v == \'*\' ]]; then v=${v:1:${#v}-2}; fi
  printf '%s' "$v"
}

dominio_ok() {  # $1 = nome da variável, $2 = valor. Só letras, números, ponto e hífen (nada de espaço,
  # barra, & ou |, que estragariam o site), com ponto, e nunca o exemplo do .env.example.
  if [ -z "$2" ]; then
    log "falta $1 no $BASE/.env (o domínio que a borda atende)"; return 1
  fi
  if ! [[ $2 =~ ^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$ && $2 == *.* ]]; then
    log "$1 inválido no $BASE/.env: '$2' (só o domínio, sem https://, ex.: api.meudominio.com.br)"; return 1
  fi
  if [[ $2 == *exemplo.com.br ]]; then
    log "$1 no $BASE/.env ainda é o do .env.example ($2): defina o domínio real"; return 1
  fi
}

renderizar() {  # $1 = site.caddy da versão, $2 = destino. Troca {$LEARN_DOMAIN} e {$LEARN_APP_DOMAIN} pelos valores do .env.
  local dom app txt
  dom=$(ler_env LEARN_DOMAIN)
  app=$(ler_env LEARN_APP_DOMAIN)
  dominio_ok LEARN_DOMAIN "$dom" || return 1
  dominio_ok LEARN_APP_DOMAIN "$app" || return 1
  txt=$(<"$1") || return 1
  # Substituição do próprio bash (sem sed): o valor entre aspas é inserido literalmente.
  # shellcheck disable=SC2016  # '{$LEARN_DOMAIN}' é o texto literal do site.caddy, não uma variável
  txt=${txt//'{$LEARN_DOMAIN}'/"$dom"}
  # shellcheck disable=SC2016
  txt=${txt//'{$LEARN_APP_DOMAIN}'/"$app"}
  case $txt in *'{$'*) log "o $1 tem um placeholder {\$...} que o deploy não conhece"; return 1 ;; esac
  printf '%s\n' "$txt" > "$2" || return 1
}

borda_no_ar() { [ "$(docker inspect -f '{{.State.Running}}' "$BORDA" 2>/dev/null)" = true ]; }

borda_pronta() {  # espera a API de administração do Caddy da borda responder (até 15 s)
  for _ in $(seq 1 15); do
    docker exec "$BORDA" wget -q -O /dev/null http://127.0.0.1:2019/config/ >/dev/null 2>&1 && return 0
    sleep 1
  done
  return 1
}

caddy_borda() {  # caddy validate | reload no container da borda; mostra o erro se falhar
  local out
  out=$(docker exec "$BORDA" caddy "$1" --config /etc/caddy/Caddyfile --adapter caddyfile 2>&1) && return 0
  printf '%s\n' "$out" | tail -n 5
  return 1
}

conferir() {  # $1 = versão que vai entrar no ar. Roda ANTES de mexer em qualquer coisa.
  local sha=$1 rel="releases/$1"
  [ -d "$rel" ] || { log "versão $sha não está em releases/"; return 1; }
  # O LearnWatching já nasce com a borda, então toda versão publicada tem o site.caddy. A checagem fica
  # como barreira: uma versão sem ele não teria como entrar na borda.
  if [ ! -f "$rel/deploy/site.caddy" ]; then
    log "a versão $sha não tem deploy/site.caddy: não tenho o que instalar na borda. Publique uma versão nova."
    return 1
  fi
  if ! docker network inspect borda >/dev/null 2>&1 || ! docker container inspect "$BORDA" >/dev/null 2>&1; then
    log "a borda (rede \"borda\" e container \"$BORDA\") não existe nesta VPS. Rode antes o borda/instalar.sh"
    log "do core-studio (veja borda/README.md lá):"
    log "  scp -r borda core@<IP>:/tmp/borda && ssh -t core@<IP> bash /tmp/borda/instalar.sh"
    return 1
  fi
  if ! borda_no_ar; then
    # Quem liga a borda é o deploy do core-studio (a migração tira o Caddy antigo dele). Ligar daqui,
    # antes disso, tomaria as portas 80/443 e deixaria o Caddy antigo do core sem poder voltar.
    log "a borda (container \"$BORDA\") está parada. Ela é ligada pelo deploy do core-studio: publique"
    log "o core primeiro (veja o roteiro da borda no backend/README.md do core-studio). Se o core já"
    log "está na borda e ela caiu: docker logs $BORDA; docker start $BORDA."
    return 1
  fi
  if [ ! -d "$BORDA_SITES" ] || [ ! -w "$BORDA_SITES" ]; then
    log "não consigo gravar em $BORDA_SITES (rode o borda/instalar.sh do core-studio)"; return 1
  fi
  if ! docker image inspect "$LOCAL_IMAGE:$sha" >/dev/null 2>&1; then
    log "a imagem $LOCAL_IMAGE:$sha não existe nesta VPS (o publicar.sh monta antes de chamar o deploy)"
    return 1
  fi
  renderizar "$rel/deploy/site.caddy" /dev/null || return 1
}

instalar_site() {  # $1 = versão. Grava o site dela na borda, valida e recarrega; se falhar, devolve o anterior.
  local src="releases/$1/deploy/site.caddy" dst="$BORDA_SITES/$SITE.caddy" havia=0
  # Os temporários não terminam em .caddy, então a borda (import sites/*.caddy) não os lê.
  renderizar "$src" "$dst.novo" || { rm -f "$dst.novo"; return 1; }
  if [ -f "$dst" ]; then
    cp -p "$dst" "$dst.anterior" || return 1
    havia=1
  fi
  mv -f "$dst.novo" "$dst" || return 1
  if ! borda_no_ar; then
    # O conferir só deixa seguir com a borda no ar: se ela parou desde então, já servia o core e
    # pode ser religada.
    log "a borda parou durante o deploy: ligando de novo"
    docker start "$BORDA" >/dev/null || true
  fi
  if borda_pronta && caddy_borda validate && caddy_borda reload; then
    log "site na borda: $dst"
    return 0
  fi
  log "a borda recusou o site novo; devolvendo o anterior"
  if [ "$havia" = 1 ]; then mv -f "$dst.anterior" "$dst"; else rm -f "$dst"; fi
  borda_no_ar || docker start "$BORDA" >/dev/null 2>&1 || true
  { borda_pronta && caddy_borda reload; } || log "ATENÇÃO: a borda não recarregou o site anterior (docker logs $BORDA)"
  return 1
}

# ---------- versão ----------

ativar() {  # copia a configuração e o app da versão $1, sobe com a imagem dela e instala o site na borda
  local sha=$1 rel="releases/$1"
  [ -d "$rel" ] || { log "versão $sha não está em releases/"; return 1; }
  [ -f "$rel/deploy/site.caddy" ] || { log "versão $sha não tem deploy/site.caddy"; return 1; }
  # Dentro de "if ativar ..." o set -e não vale: cada passo devolve o erro explicitamente.
  cp "$rel/compose.yml" compose.yml || return 1
  # Sobrescreve no lugar: o postgresql.conf é montado pelo arquivo, e um arquivo novo não seria visto.
  { mkdir -p deploy && cp -r "$rel/deploy/." deploy/; } || return 1
  # Atualiza o conteúdo de app-dist sem recriar a pasta (a borda monta a pasta). --checksum: compara o
  # conteúdo, não só tamanho e data (o index.html de duas versões pode ter o mesmo tamanho).
  rsync -a --checksum --delete "$rel/app/" app-dist/ || return 1
  docker image inspect "$LOCAL_IMAGE:$sha" >/dev/null 2>&1 || { log "imagem $LOCAL_IMAGE:$sha não existe"; return 1; }
  export API_IMAGE="$LOCAL_IMAGE:$sha"
  # Anota no .env a imagem no ar: assim qualquer "docker compose ..." rodado à mão na VPS (inclusive o
  # backup.sh e o dump-diario.sh) usa esta versão.
  if grep -q '^API_IMAGE=' .env; then
    sed -i "s|^API_IMAGE=.*|API_IMAGE=$API_IMAGE|" .env || return 1
  else
    printf '\n# Imagem no ar (gravada pelo deploy.sh)\nAPI_IMAGE=%s\n' "$API_IMAGE" >> .env || return 1
  fi
  docker compose up -d --no-build --remove-orphans || return 1
  instalar_site "$sha" || return 1
}

saudavel() {  # espera a API responder (até 3 min)
  local id
  for _ in $(seq 1 36); do
    id=$(docker compose ps -q api || true)
    if [ -n "$id" ] && [ "$(docker inspect -f '{{.State.Health.Status}}' "$id" 2>/dev/null)" = "healthy" ]; then
      return 0
    fi
    sleep 5
  done
  return 1
}

backup() {  # dump do banco no ar (se houver) antes de subir a versão nova; ficam os 10 últimos
  if [ -f compose.yml ] && [ -n "$(docker compose ps -q db 2>/dev/null)" ]; then
    local f
    f="backups/antes-do-deploy-$(date +%Y%m%d-%H%M%S).dump"
    # shellcheck disable=SC2016  # $POSTGRES_USER e $POSTGRES_DB são do container do banco
    docker compose exec -T db sh -c 'pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$f"
    log "backup do banco: $f ($(du -h "$f" | cut -f1))"
    find backups -maxdepth 1 -name 'antes-do-deploy-*.dump' -printf '%T@ %p\n' | sort -rn | tail -n +11 \
      | cut -d' ' -f2- | xargs -r rm --
  fi
}

atual=$(cat .deploy/atual 2>/dev/null || true)

if [ "${1:-}" = "--voltar" ]; then
  alvo=$(cat .deploy/anterior 2>/dev/null || true)
  [ -n "$alvo" ] || { log "não há versão anterior registrada"; exit 1; }
  conferir "$alvo" || { log "não voltei: nada foi alterado"; exit 1; }
  log "voltando de ${atual:-?} para $alvo"
  if ! { ativar "$alvo" && saudavel; }; then
    log "a versão $alvo não ficou saudável"
    docker compose logs --tail 80 api || true
    # Não deixa a VPS com a configuração de uma versão e o registro de outra: volta para a que estava.
    if [ -n "$atual" ] && conferir "$atual"; then
      log "voltando para $atual"
      if ativar "$atual" && saudavel; then log "de volta em $atual"; else log "ATENÇÃO: $atual também falhou"; fi
    fi
    exit 1
  fi
  echo "$alvo" > .deploy/atual
  echo "$atual" > .deploy/anterior
  log "no ar: $alvo"
  exit 0
fi

novo=${1:?uso: deploy.sh <sha> | --voltar}
log "versão nova: $novo (no ar: ${atual:-nenhuma})"
conferir "$novo" || { log "não publiquei: nada foi alterado"; exit 1; }
backup
if ativar "$novo" && saudavel; then
  if [ -n "$atual" ] && [ "$atual" != "$novo" ]; then echo "$atual" > .deploy/anterior; fi
  echo "$novo" > .deploy/atual
  anterior=$(cat .deploy/anterior 2>/dev/null || true)
  # Guarda as 5 versões mais novas (e sempre a no ar e a anterior); apaga o resto e as imagens delas.
  find releases -mindepth 1 -maxdepth 1 -type d -printf '%T@ %f\n' | sort -rn | tail -n +6 | cut -d' ' -f2- \
    | while read -r r; do
      if [ "$r" = "$novo" ] || [ "$r" = "$anterior" ]; then continue; fi
      rm -rf "releases/$r"
      docker image rm "$LOCAL_IMAGE:$r" >/dev/null 2>&1 || true
    done
  docker image prune -f >/dev/null
  log "no ar: $novo"
else
  log "a versão $novo não ficou saudável"
  docker compose logs --tail 80 api || true
  if [ -n "$atual" ] && [ "$atual" != "$novo" ]; then
    if conferir "$atual"; then
      log "voltando para $atual"
      if ativar "$atual" && saudavel; then log "de volta em $atual"; else log "ATENÇÃO: a versão anterior também falhou"; fi
    else
      log "ATENÇÃO: não volto sozinho para $atual (veja acima). A versão $novo continua instalada."
    fi
  fi
  exit 1
fi
