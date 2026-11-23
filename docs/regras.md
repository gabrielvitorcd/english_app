## Fluxo de uma task
1. A task é aberta no Orca, que cria uma worktree com uma branch saindo da develop.
2. A primeira mensagem é o link da issue. O Claude lê a issue e pergunta:
   "É pequena (resolvo direto) ou grande (conversamos antes)?"
   Quem decide é a dona; o Claude não classifica sozinho.
   - Pequena: o Claude implementa.
   - Grande: o Claude explora o código envolvido na issue e pergunta à dona
     o que ela imagina e um caso de uso. Só implementa depois das respostas.
3. Commits pequenos durante o trabalho.
4. Quando a dona disser que a task está finalizada, o Claude roda as
   verificações (lista no CLAUDE.md) e abre o PR para a develop.
   Antes disso, não roda verificações nem abre PR.
5. A dona junta o PR com "Squash and merge", finaliza a task e apaga a worktree.

## Commits
- Pequenos e diretos: um commit por alteração. Nunca agrupar várias mudanças num commit só.
  (Na develop eles viram um commit por task, por causa do squash.)
- Formato: "Área: o que muda", em português, com corpo em tópicos quando precisar.

## Sem ligação com o Claude
- Nada nos commits nem nos PRs que remeta ao Claude: sem "Co-Authored-By"
  e sem "Generated with Claude Code".

## Custo
- Nunca usar agentes (subagentes, workflows): gastam muitos tokens.
