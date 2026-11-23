# Verificações de todo o repositório, no seu PC (as mesmas do GitHub Actions).
# O backend precisa de Postgres: Docker (testcontainers) ou TEST_DATABASE_URL.
.PHONY: check backend app hooks teste teste-parar deploy deploy-voltar wasm

# Build do app igual ao `vite build` do `npm run build`, mas sem copiar public/ para dist/: o
# app/public/videos/ (cerca de 4 GB, fora do git) não precisa ser copiado a cada verificação.
VITE_BUILD_SEM_PUBLIC = node --input-type=module -e 'import { build } from "vite"; await build({ logLevel: "warn", build: { copyPublicDir: false } });'

check: backend app
	@echo "Tudo certo."

backend:
	cd backend && $(MAKE) check

app:
	@test -s app/src/vendor/ffmpeg/ffmpeg.wasm && test -s app/src/vendor/ffmpeg/ffmpeg.js || { \
	  echo "falta app/src/vendor/ffmpeg/ (o bundle do ffmpeg.wasm não está no git): make wasm, ou copie da pasta principal"; exit 1; }
	cd app && npm run typecheck && npm run lint && npm run test && $(VITE_BUILD_SEM_PUBLIC)

hooks:            ## instala o gancho que roda as verificações antes de cada push
	git config core.hooksPath .githooks

teste:            ## sobe o ambiente de teste no PC com o código da branch atual → https://app.localhost:8443 e fica observando app/
	backend/deploy/teste.sh

teste-parar:      ## desliga o ambiente de teste (os dados ficam guardados)
	backend/deploy/teste.sh --parar

deploy:           ## publica a main do GitHub na VPS (produção); rode depois do merge da develop na main
	backend/deploy/publicar.sh

deploy-voltar:    ## volta a VPS para a versão anterior
	backend/deploy/publicar.sh --voltar

wasm:             ## compila o ffmpeg.wasm em app/src/vendor/ffmpeg/ (precisa do emsdk; veja docs/transcoding/02-build.md)
	bash scripts/build-x264.sh && bash scripts/build-ffmpeg.sh && bash scripts/link-ffmpeg-wasm.sh
