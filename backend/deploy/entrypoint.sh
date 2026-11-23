#!/bin/sh
# A API aplica as migrations antes de subir. RUN_MIGRATIONS=0 pula essa etapa (ex.: um segundo processo
# com a mesma imagem).
set -e
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  # Banco à frente do código: acontece ao voltar para uma versão anterior (deploy.sh --voltar ou a volta
  # automática) depois de uma versão que trouxe migration. O código antigo não conhece a revisão nova e
  # o "upgrade head" falharia para sempre; segue sem migrar, com aviso (o dump de antes do deploy fica em
  # backups/, se for preciso voltar o banco também).
  if ! saida=$(alembic upgrade head 2>&1); then
    echo "$saida"
    case $saida in
      *"Can't locate revision"*)
        echo "AVISO: o banco está numa revisão que esta versão não conhece (mais nova). Sigo sem migrar." ;;
      *) exit 1 ;;
    esac
  else
    echo "$saida"
  fi
fi
exec "$@"
