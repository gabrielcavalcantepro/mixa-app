# Mixa — App (usuária final)

App final que a usuária (mãe, assinante) usa: onboarding, autenticação,
motor de decisão do look do dia, e as 5 abas Looks/Favoritos/Hoje/
Promos/Perfil (Hoje sempre no meio da barra e sempre a 1ª tela depois
do onboarding, mesmo não sendo a 1ª da lista — ver "Navegação, cabeçalho
e central de notificações" abaixo). Ver `SPEC-mixa-app.md` para o
domínio completo — este arquivo é sobre como o código está organizado e
como rodar o projeto.

Projeto **separado** de `mixa-catalogo` (a plataforma interna de
curadoria, pasta irmã) — sem código nem banco compartilhado, só consumo
de uma API HTTP de leitura que o catálogo expõe.

## Convenção: investigar antes de alterar

Ao corrigir um bug ou comportamento que já existe (não ao criar algo
novo), declare a hipótese da causa antes de mexer em qualquer código,
investigue essa hipótese primeiro, e só implemente a correção se ela for
confirmada. Se a investigação não confirmar, não altere nada — relate o
que encontrou e espere confirmação. Vale só pra alteração/correção.

Criação de funcionalidade nova: implementa direto, sem plano prévio pra
aprovação e sem pausar no meio pra confirmar decisão técnica — decide e
segue. Só pausa de verdade se a trava for uma decisão de produto que só
o usuário pode tomar (não uma escolha de implementação) — nesse caso,
registra a dúvida no relatório final em vez de interromper no meio do
trabalho. Isso vale também pra depois de terminar: criação de
funcionalidade nova não gera nenhum documento de proposta/plano à parte
pra aprovação posterior — o relatório final (no formato de relatório de
conclusão já em uso) é a única entrega de texto.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
  — mesma base do mixa-catalogo, por consistência (mesmo dev nos dois
  projetos, mesmos gotchas do Next 16/Base UI já mapeados).
- **PostgreSQL via Docker Compose** (porta **5433**, não 5432 — roda ao
  lado do Postgres do catálogo sem colisão) + **Drizzle ORM**. Banco
  **próprio**: guarda só dado do app (conta, onboarding, favoritos,
  rotina, histórico de exibição) — nunca dado de catálogo.
- **Auth.js v5** (Credentials + JWT), com cadastro real (ao contrário do
  catálogo, que só cria conta via seed).
- **Tailwind CSS v4 + shadcn/ui** (Base UI, não Radix) — mesmos tokens
  de cor do catálogo (`#1C1B19` preto / `#F1ECE1` osso), agora com tema
  claro/escuro de verdade via **`next-themes`** (entrou inicialmente só
  como dependência transitiva do `Toaster`, virou feature real depois —
  ver seção própria "Tema claro/escuro" abaixo).
- **Zod**, **Vitest** (só lógica pura, sem e2e) — mesma filosofia do
  catálogo.
- **`motion`** (ex-Framer Motion) — única lib de animação do projeto,
  trazida na passada 2 (design.md) só pro carrossel de abertura + folha
  de autenticação (física de mola, Ken Burns contínuo). Ver seção
  "Movimento" — todo o resto continua CSS puro de propósito.
- **`web-push`** (VAPID) pra notificação push real. Service worker é um
  **arquivo estático** (`public/sw.js`, sem Serwist/next-pwa) — a spec
  não pede cache de assets/offline, só push + instalação, e evita
  depender de um plugin cuja compatibilidade com Turbopack não dava pra
  confirmar com confiança.
- **Ícones do PWA gerados via `app/icon.tsx`/`apple-icon.tsx`**
  (`next/og` `ImageResponse`, convenção nativa do App Router) — wordmark
  "M" placeholder, ver "Pendências" abaixo.

## Arquitetura: fatia vertical por tela (não-negociável)

Cada aba principal e o onboarding vivem em pastas pequenas e
autocontidas — mesma regra do catálogo, inclusive "não importe
`_actions`/`_queries` de uma tela a partir de outra" (ex.: o editor de
estilo do Perfil duplica uma versão simplificada da lógica do quiz do
onboarding, de propósito, em vez de importar de lá).

```
app/
  (auth)/login/                      # tela de abertura (carrossel) + folha de entrar/criar conta
    _actions/ _components/
  (onboarding)/onboarding/
    layout.tsx, pontos-passo.tsx, transicao-de-passo.tsx
    cidade/ estilo/ rotina/           # 1 pasta por passo (conta não conta mais — ver "Onboarding — passada 2")
  (app)/
    layout.tsx                        # gate auth+onboarding, cabeçalho por aba, bottom nav
    hoje/       _lib/ _queries/ _actions/ _components/
    looks/      _actions/ _components/ _queries/ _lib/   # _lib/filtrar-multiplo.ts — ver "Telas de conteúdo"
    looks/[id]/ _components/
    favoritos/                         # sem sub-pastas: só um LookGrid filtrado, sem action/query própria
    promos/                           # shell, sem sub-pastas (não tem lógica ainda)
    perfil/  _actions/ _components/ _queries/ _lib/
  api/
    auth/[...nextauth]/
    push/{subscribe,teste}/
    cron/notificacoes-diarias/

lib/                # genuinely compartilhado
  auth.ts            # Auth.js + usuarioAutenticado() (helper usado em quase toda tela)
  onboarding.ts       # proximoPassoOnboarding() — usado por 3 pontos de entrada diferentes
  data.ts             # dataDeHojeISO()
  catalogo/            # cliente do catálogo (ver seção própria) + slug-perfil.ts (nome→arquivo de imagem)
  clima/                # cliente de clima (ver seção própria)
  favoritos/             # queries.ts + alternar-favorito.ts — usado por Looks, Favoritos e o detalhe de look
  push/web-push.ts       # envio de notificação

db/                 # schema próprio (ver "Dado do app")
components/
  ui/                 # shadcn primitives
  shell/               # bottom-nav.tsx, cabecalho-aba.tsx, central-notificacoes.tsx, _actions/ — só usados por (app)/layout.tsx
  mixa/                # UI genuinamente cross-fatia: ColagemLook (Hoje+Looks), LookCard/LookGrid/BotaoFavoritar (Looks+Favoritos+Hoje+detalhe), CartaoPerfilEstilo (onboarding/estilo+Perfil), AtivarNotificacoes (central de notificações+Perfil), TiraSemanal (Perfil+onboarding/rotina)
```

**Regra ao adicionar/alterar algo**: lógica de uma tela específica mora
na pasta dela. Só entra em `db/`, `lib/` ou `components/` o que é
genuinamente compartilhado.

## Dado do app (`db/schema/`, um arquivo por entidade)

Banco `mixa_app`, sem nenhuma FK pro catálogo — `lookId`/
`perfilEstiloId` guardados como texto solto (id de outro serviço).

- **`usuario`**: conta + todo estado de onboarding que não é linha
  própria (`cidade`, `cidadeLat/Lon`, `perfilDominanteId`,
  `notificacaoHorario`, `trialIniciadoEm`, `tutorialInstalacaoVistoEm`).
  **`nome`** (`NOT NULL`, design.md 2026-07-27) — capturado na criação
  de conta (`(auth)/login/_actions/criar-conta.ts`), mostrado como
  título principal do Perfil (e-mail vira secundário). Migration fez
  backfill via `split_part(email, '@', 1)` pra quem já tinha conta antes
  do campo existir (mesmo padrão de coluna `NOT NULL` retroativa já
  usado antes pra `look_exibido.ocasiao`). **`rotinaConcluidaEm`**
  (nullable, mesma leva) — grava a hora em que `/onboarding/rotina` foi
  concluído pela 1ª vez; existe porque checar "onboarding de rotina
  completo" contando linhas em `rotina_item` quebra silenciosamente pra
  quem termina o passo com 0 itens (ver próximo parágrafo).
- **`usuario_perfil_complementar`**: até 2 por usuária.
- **`rotina_item`**: `(id, usuarioId, rotulo, emoji nullable, ocasiao,
  diasSemana int[])` — item permanente da rotina. **Não é mais 1 linha
  por dia**: `diasSemana` é array, e nada impede 2 itens (de categorias
  iguais ou diferentes) compartilharem o mesmo dia — ver "Rotina + Hoje
  — modelo de múltiplos itens" abaixo pro histórico de por que isso
  mudou.
- **`rotina_item_avulso`**: `(id, usuarioId, data, rotulo, emoji
  nullable, ocasiao)` — "só hoje", ligado a uma data específica (não
  dia da semana), nunca vira `rotina_item`.
- **`rotina_item_oculto`**: `(rotinaItemId, data)`, PK composta — puro
  marcador "esse item fixo está escondido nessa data", sem apagar a
  recorrência dele.
- **`favorito`**, **`look_exibido`** (histórico pro motor não repetir —
  ganhou coluna `ocasiao`, ver seção do motor abaixo), **`clima_cache`**
  (cidade+dia), **`push_subscription`**, **`notificacao_enviada`**
  (evita reenviar 2x no mesmo dia).

**Onboarding completo é derivado, não uma flag**:
`lib/onboarding.ts#proximoPassoOnboarding` — sem `cidade` → passo
cidade; sem `perfilDominanteId` → passo estilo; sem `rotinaConcluidaEm`
→ passo rotina; senão completo. Usado por `/` (redirect raiz),
`(app)/layout.tsx` (gate) e cada `page.tsx` de onboarding (pra empurrar
de volta quem já terminou e volta numa URL antiga). **Já foi checagem
de linha em `rotina_item` em vez de `rotinaConcluidaEm`** — regressão
encontrada nesta rodada (não reportada pela usuária, achada investigando
outra coisa): quem termina o passo Rotina sem adicionar nenhum item
(rotina legitimamente vazia) nunca tinha uma linha em `rotina_item`,
então `proximoPassoOnboarding` devolvia "rotina" pra sempre e a conta
ficava presa num loop de redirect pra `/onboarding/rotina`. Corrigido
gravando `rotinaConcluidaEm` incondicionalmente no fim de `salvarRotina`
(`onboarding/rotina/actions.ts`), não mais condicionado a inserir algum
`rotina_item`.

## Cliente do catálogo (`lib/catalogo/`) — contrato real, confirmado

`CatalogoClient` (`cliente.ts`) tem 2 métodos —
`listarLooksAprovados(filtro)` e `listarPerfisEstilo()`. Duas
implementações, escolhidas por `CATALOGO_API_MODE` (`mock` padrão |
`http`): `mock.ts` (fixtures locais, `fixtures/`) e `http.ts` (fetch
real).

**Importante — isso já foi verificado contra o `mixa-catalogo` local
(2026-07-24), não é mais suposição**: a API real (`app/api/v1/*` de
lá) devolve um formato mais aninhado que o nosso `LookAprovado` interno
(peça sob `.peca`, perfis como `{id,nome}`, clima como
`{climas,misto}`), **e não aceita filtro por query param** — `GET
/api/v1/looks` devolve a tabela `look` inteira (que já É só aprovados;
candidato pendente/reprovado vive em outra tabela, nunca é exposto) e o
filtro é aplicado do lado do app. `http.ts#mapearLook` é a única
fronteira que conhece o formato bruto; `lib/catalogo/filtrar.ts`
(`filtrarLooks`) é a mesma função de filtro usada por `mock.ts` e
`http.ts`, testada.

Endpoints reais: `GET /api/v1/looks`, `GET /api/v1/perfis-de-estilo`
(note o "de" — não é `/perfis-estilo`), `Authorization: Bearer
<CATALOGO_API_TOKEN>` (== `API_TOKEN` do `.env` do catálogo). Peça
embutida em `/looks` **não** traz `linkAfiliado` nem `ordem` de imagem
(só `/pecas`, endpoint que o app não consome ainda) — por isso
`linkAfiliado` é sempre `null` em modo http também; não é regressão, é
consistente com afiliados serem fora de escopo nesta fase.

**Estado real dos dados agora**: o catálogo local tem 4 perfis de
estilo e 10 peças cadastradas, mas **0 looks montados** — `/api/v1/looks`
responde `[]`. Rodar em `CATALOGO_API_MODE=http` hoje mostra os estados
vazios (corretos, testados), não looks de verdade — falta curadoria do
lado de lá antes de virar uma demonstração completa. Pra ver o app com
looks de verdade, use `CATALOGO_API_MODE=mock` (padrão).

## Clima (`lib/clima/`)

`OpenWeatherClient` (`open-weather.ts`, sem interface separada — só 1
implementação real, escolhida via `getWeatherClient()`) faz
geocodificação (onboarding/cidade) e clima do dia, cacheado em
`clima_cache` por cidade/dia. Sem `OPENWEATHER_API_KEY`, cai num clima
fixo (`meia_estacao`, 22°C) — loga aviso 1x, não bloqueia rodar local.
Regra de conversão temperatura → peso: `<15°C` pesada, `15-25°C`
meia-estação, `>25°C` leve (simplificação assumida, sem validação real
de estilista).

## Rotina compartilhada (`lib/rotina/`)

Único pedaço de lógica de rotina que é genuinamente compartilhado entre
3 fatias (Hoje, Perfil, onboarding) — por isso mora em `lib/`, não
numa fatia específica (mesma régua de `lib/clima/`/`lib/catalogo/`). O
que cada fatia faz com esses dados continua duplicado por tela
(formulário, Server Action, validação) — só os **tipos** e a
**lógica pura de junção/agrupamento** vivem aqui:

- `tipos.ts`: `ItemRotina` (permanente), `ItemAvulso` ("só hoje"),
  `ItemResolvido` (um item já resolvido pro dia, com `origem: "fixo" |
  "avulso"`), `CategoriaDoDia`.
- `emoji-padrao.ts`: `EMOJI_PADRAO_POR_OCASIAO` (💼 trabalho, 🏋️
  treino, 🏠 casa, 🎉 evento, ☕ lazer) + `emojiResolvido()` — emoji
  nunca fica em branco (design.md).
- `itens-do-dia.ts` (puro, testado): `itensDoDia` (junta fixos ativos
  + avulsos de hoje, já removendo os ocultados) → `agruparPorCategoria`
  (ordem fixa) → `categoriasDoDia` (as duas + fallback "casa" se o dia
  não tiver item nenhum) — usado pelo motor de decisão de Hoje.
  `itensPorDiaDaSemana` é a versão pra preview: dado só os itens
  permanentes (sem avulso/oculto, que são conceitos do dia corrente,
  não da rotina fixa), devolve `Record<diaSemana, ItemRotina[]>` pra
  `TiraSemanal` — item completo, não só a categoria (ver "Onboarding —
  passada 4" abaixo pro porquê).

## Motor de decisão (`app/(app)/hoje/_lib/`, `_queries/`, `_actions/`)

Só a fatia de Hoje usa — mora lá, não em `lib/` (exceto a parte
genuinamente compartilhada com Perfil/onboarding, que foi pra
`lib/rotina/` — ver seção própria abaixo). **1 cartão por categoria
distinta do dia, não 1 por dia** (design.md, passada 3) — ver "Rotina +
Hoje" abaixo pro histórico completo dessa mudança de modelo.

1. `lib/rotina/itens-do-dia.ts#categoriasDoDia`: junta itens fixos
   ativos hoje (menos os ocultados só hoje) + avulsos de hoje, agrupa
   por categoria distinta (ordem fixa: trabalho/lazer/casa/treino/
   evento), cai em `[{ocasiao: "casa", itens: []}]` se o dia não tiver
   item nenhum. Pura, testada.
2. `_queries/contexto.ts#montarCriteriosDoDia` devolve **um array** de
   `CriteriosDoDia` (1 por categoria) — clima e perfil são iguais em
   todos, só `ocasiao`/`itens` mudam por entrada.
3. `motor-decisao.ts#buscarCandidatos`: igual antes, filtra o catálogo
   por ocasião+clima+estilo (dominante OU complementar) — chamado 1x
   por categoria do dia agora, não 1x pro dia inteiro.
4. `motor-decisao.ts#escolherLook` (pura, testada): não mudou —
   "camadas de exclusão" em ordem, cai pro pool completo se todas
   esvaziarem. Desempate: perfil dominante > cápsula mais recente > id.
5. `motor-decisao.ts#buscarFamiliaDoLook` (pura, testada, nova): dado o
   look atual, devolve a "família" de variantes — a base dele (ele
   mesmo, se não for variante de nada; ou o que ele referencia, via
   `LookAprovado.varianteDeId`, se for) mais todo look que compartilha
   essa base, sempre excluindo o próprio look atual. Usado só por
   "trocar look", nunca pela escolha inicial do dia.
6. `_queries/look-do-dia.ts#obterLooksDoDia` (usado pela renderização
   normal): 1 cartão por categoria, cada um estável entre reloads
   (reaproveita o look já registrado hoje **pra aquela categoria
   especificamente** — por isso `look_exibido` ganhou uma coluna
   `ocasiao`, sem ela não dava pra distinguir "já mostrado hoje" por
   cartão) — só escolhe de novo se não há nada ainda pra aquele cartão,
   ou se o critério mudou.
7. `_actions/trocar-look.ts` recebe `ocasiao` (qual cartão trocar — não
   existe mais "o" cartão) e busca família primeiro
   (`buscarFamiliaDoLook`); sem família, cai pro pool normal da
   categoria, excluindo só o que já foi mostrado **hoje pra essa
   categoria**; se esgotar, repete (limite de curadoria do catálogo,
   não bug).
8. `_actions/gerenciar-rotina-hoje.ts` + `_components/
   ajustar-hoje-dialog.tsx`: substituem o antigo `ajustar-hoje.ts`/
   `opcoes-ajuste.ts`/`ajuste-hoje-botoes.tsx` (4 botões fixos,
   apagados). Unifica "hoje eu vou..." com o padrão de adicionar item —
   `adicionarItemHoje` grava em `rotina_item` (recorrência "semanal",
   só o dia de hoje) ou `rotina_item_avulso` (recorrência "hoje", só
   essa data), e `alternarItemOcultoHoje` liga/desliga uma linha em
   `rotina_item_oculto` sem tocar na recorrência do item.

## PWA e push

`public/sw.js` (estático): `push` mostra notificação simples (spec: não
carrega o look), `notificationclick` foca/abre `/hoje`.
`components/mixa/ativar-notificacoes.tsx` registra o SW + inscreve via
`pushManager.subscribe` (chave VAPID pública passada como **string**
direto, navegadores atuais aceitam sem converter pra `Uint8Array`) e
salva em `/api/push/subscribe`. Usado tanto no tutorial 1x de Hoje
quanto no card permanente do Perfil.

Envio real: `POST /api/cron/notificacoes-diarias` (header
`x-cron-secret`, não amarrado a nenhum provedor de hospedagem — deploy
ainda não definido) varre usuárias cujo horário caiu na janela dos
últimos 15min (`janela.ts`, testado; horário interpretado em
**America/Sao_Paulo** fixo — sem fuso por cidade nesta fase, público é
100% Brasil) e sem envio hoje ainda. Local: `npm run cron:notificacoes`.
Verificação rápida sem esperar o horário: `POST /api/push/teste` com a
sessão logada (endpoint existe e funciona, mas **não há botão na UI**
pra ele — só chamável direto, ver relatório de status de 2026-07-24).

## Marca (`public/logo/`, `lib/marca.ts`)

Os 6 arquivos reais (ícone e logotipo, preto/branco, vertical/
horizontal) foram entregues em 2026-07-24 e usados diretamente, como a
SPEC pede — nenhum placeholder de marca resta no código.

- `public/logo/icone-{preto,branco}.svg`: só o símbolo (sem "mixa"
  escrito). `viewBox` não é quadrado (653×383) — os geradores de ícone
  centralizam ele num canvas quadrado com fundo sólido, não esticam.
- `public/logo/logotipo-horizontal-{preto,branco}.svg`: símbolo + "mixa"
  lado a lado — usado em `(auth)/login/_components/carrossel-abertura.tsx`
  via `<img>` direto (sempre a versão branca, ver abaixo). O onboarding
  (`cidade`/`estilo`/`rotina`) não mostra mais logo nenhum desde a
  passada 2 do design.md — a paginação por pontos substituiu esse
  bloco inteiro (ver "Onboarding — passada 2").
- `public/logo/logotipo-vertical-{preto,branco}.svg`: entregue, ainda
  sem consumidor em nenhuma tela.
- **Os arquivos entregues no upload original vieram com os 2 horizontais
  trocados de nome** (`logotipo-horizontal-branco.svg` continha o SVG
  preto, e vice-versa) — confirmado lendo o atributo `fill` de cada
  arquivo (`#1C1B19` = preto, `#F1ECE1` = branco/osso, as mesmas cores
  de marca de sempre), não presumido pelo nome do arquivo. Corrigido
  nesta sessão. Se algum arquivo novo for adicionado depois, vale
  conferir o `fill` antes de confiar só no nome.
- `lib/marca.ts` lê `viewBox`/`path` de `icone-preto.svg`/
  `icone-branco.svg` em tempo de execução (`fs.readFileSync`, roda só
  server-side) e exporta prontos pra uso — usado por `app/icon.tsx`,
  `app/apple-icon.tsx` e `app/manifest-icon/route.tsx`, todos via
  `next/og` `ImageResponse` embutindo o `<path>` como SVG/JSX nativo
  (mais confiável do que `<img src="data:image/svg+xml...">` dentro de
  `ImageResponse` — evita depender do suporte do rasterizador a
  `<image>` SVG-dentro-de-SVG). Todos os 3 usam fundo `#1c1b19` sólido +
  ícone branco centralizado, pra garantir contraste em qualquer tema de
  navegador/OS.

**Logo em UI (não os ícones acima) precisa da variante certa por
tema**: os SVGs de logo são preto/branco sólido — o preto some sobre
fundo escuro se não trocar. Isso resolvia com
`components/mixa/logo-marca.tsx` (CSS puro, `block dark:hidden` /
`hidden dark:block`) em 2 lugares — login e cabeçalho do onboarding.
**O componente foi removido na passada 2 do design.md**: o onboarding
deixou de mostrar logo (ver "Onboarding — passada 2" abaixo), e o
carrossel de abertura nunca precisou dele de verdade — ali o fundo é
sempre uma foto escura, não `bg-background` reagindo a tema, então
`carrossel-abertura.tsx` sempre usa a versão branca fixa via `<img>`
direto (comentário no próprio arquivo explica o porquê). Com os 2 usos
reduzidos a 0 (onboarding) e 1 caso fixo sem variação de tema
(carrossel), o componente virou código morto e foi apagado. Se um novo
lugar precisar mostrar o logo sobre `bg-background` (reagindo a tema)
de novo no futuro, esse é o padrão CSS a recriar — não existe mais
componente pronto pra isso.

## Tema claro/escuro (`next-themes`) e UI otimista

Tema: `<ThemeProvider attribute="class" defaultTheme="system"
enableSystem disableTransitionOnChange>` em `app/layout.tsx` (com
`suppressHydrationWarning` no `<html>`, exigido pela própria lib —
o script injetado muda a classe antes da hidratação, discrepância
esperada). `.dark {}` em `app/globals.css` inverte só os 2 tokens de
marca (preto/osso trocados de papel), mesma paleta. Preferência manual
é 100% client (`localStorage`, chave `theme`) — não tem coluna no
banco de propósito (cosmético, por instalação, sincronizar entre
aparelhos não foi pedido). Seletor em
`app/(app)/perfil/_components/seletor-tema.tsx`: 3 opções (Sistema/
Claro/Escuro, não um toggle binário), com `useSyncExternalStore` pra
detectar "montou no client" **em vez de** `useEffect`+`setState` — o
lint do projeto (`react-hooks/set-state-in-effect`) barra isso mesmo
pra um mount-flag simples, não só pro caso de sincronizar com prop que
já estava documentado abaixo.

**UI otimista é o mesmo padrão em 3 lugares** — `useOptimistic` (marca
a escolha na hora) + `useTransition` (roda a Server Action sem
bloquear): `hoje/_components/hoje-interativo.tsx` (ajuste de ocasião +
trocar look — motivo de existir: os dois eram `<form>` 100%
server-driven, sem nenhum estado client, e travavam ~800ms-1.1s até o
motor de decisão inteiro rodar de novo antes de qualquer pixel mudar),
`components/mixa/botao-favoritar.tsx` (favoritar — movido de
`looks/_components/` na rodada de 2026-07-27, ver "Telas de conteúdo")
e `perfil/_components/rotina-editor.tsx` (tira semanal, upsert por dia
via `perfil/_actions/atualizar-dia-rotina.ts` — substituiu o antigo
`atualizar-rotina.ts`/`EstadoRotinaPerfil`, que mandava os 7 dias juntos
atrás de um botão "Salvar"). Ao adicionar uma nova ação instantânea,
reusa esse padrão em vez de inventar um 4º jeito.

Medido (não só assumido): o toque marca otimista em ~190-300ms em dev
não-minificado (bem mais rápido que os ~800-1100ms do round-trip
completo de antes, mas não os <16ms teóricos de um `useOptimistic`
puro — parte do delta é overhead de dev mode/Turbopack, não confirmei
quanto exatamente). De qualquer forma, a tela nunca mais bloqueia
enquanto isso: o conteúdo antigo fica visível e interativo (com opacity
reduzida via `isPending`) até o novo chegar.

## Movimento

**Momentos pontuais (passada 1) — `tw-animate-css` + CSS puro, sem lib**:
- Troca de aba: `components/shell/transicao-de-aba.tsx`, `key=
  {usePathname()}` força remontagem, `animate-in fade-in
  slide-in-from-bottom-2`. Só entrada é animada (sem `AnimatePresence`
  nem coreografia de saída) — as abas são rotas de verdade, o React já
  desmonta a anterior na hora de qualquer forma.
- Colagem: `components/mixa/colagem-look.tsx`, cada peça com `animate-in
  fade-in zoom-in-95` + `animationDelay` inline por índice (Tailwind não
  tem utility estática pra delay calculado dinamicamente) — continua
  Server Component, zero JS extra, a ordem já vem de `ordenarPorSlot()`.
- Favoritar: `zoom-in-50` só ao favoritar (não ao desfavoritar, que é a
  ação neutra), disparado trocando a `key` do ícone pra forçar replay.
- `components/mixa/entrada-escalonada.tsx`: generaliza a mesma técnica
  da colagem (fade-in + delay por índice) pra qualquer lista de blocos
  — usado nos passos do onboarding. Continua Server Component.

**`motion` (passada 2 — design.md, 2026-07-25), única lib de animação do
projeto**: trazida especificamente pro carrossel de abertura + folha de
autenticação — física de mola (`type: "spring"`) e o zoom contínuo do
Ken Burns sincronizado com a barra de progresso não davam pra fazer só
com CSS sem reimplementar manualmente o que a lib já resolve testada
(diferente da passada 1, que resolveu 3 momentos pontuais só com
CSS+hooks nativos — ali bastava, aqui não). Onde usada:
- `app/(auth)/login/_components/carrossel-abertura.tsx`: `AnimatePresence`
  pro crossfade entre slides, `motion.img` com `animate={{scale:1.08}}`
  rodando pela duração inteira do slide (não só na troca) pro Ken Burns,
  barra de progresso ativa também via `motion.div` (`width: 0% → 100%`).
- `app/(auth)/login/_components/folha-autenticacao.tsx`: `AnimatePresence`
  + `motion.div` com `initial={{y:"100%"}}`/`transition:{type:"spring"}`
  — entra deslizando com mola, `AnimatePresence` cuida da saída
  invertida sozinha.
- `app/(onboarding)/onboarding/transicao-de-passo.tsx`: transição entre
  passos do onboarding — slide horizontal + fade, `mode="wait"` (espera
  o passo antigo sair antes de entrar o novo, sensação de "avançar" num
  quiz linear). **Diferente de propósito** da troca de aba acima
  (`transicao-de-aba.tsx`), que só anima entrada e nunca espera — ali é
  navegação livre entre 4 abas (esperar pareceria lento), aqui é uma
  sequência linear (a pausa curta reforça "passo a passo").

## Fluxo de abertura + onboarding unificado (design.md, 2026-07-25)

`/login` deixou de ser só um formulário — agora é a `TelaAbertura`
(`app/(auth)/login/_components/tela-abertura.tsx`): carrossel Stories
em loop (`CarrosselAbertura`, 4 imagens placeholder em
`public/abertura/hero-{1..4}.svg`, texto lorem ipsum — conteúdo real
ainda não existe) + folha (`FolhaAutenticacao`) que sobe por cima com o
formulário de entrar OU criar conta, alternável sem fechar a folha.

**"Criar conta" continua sendo o passo 1 do onboarding** (conta → cidade
→ estilo → rotina, sequência funcional inalterada) — só mudou de
apresentação. `criarConta`/`ContaForm` moraram em
`(onboarding)/onboarding/conta/` e foram **realocados** pra
`app/(auth)/login/_actions/criar-conta.ts` e `_components/conta-form.tsx`
— a rota `/onboarding/conta` foi removida (não existe mais como
página; `proximoPassoOnboarding` nunca a usa como destino, já que só é
alcançável sem sessão nenhuma). A barra `Progresso` (que mostrava "1/4
Conta"..."4/4 Rotina") existiu só até a passada 2 do design.md — foi
removida por completo, substituída pela paginação por pontos. Ver
"Onboarding — passada 2" abaixo pro estado atual de Cidade/Estilo/
Rotina.

## Onboarding — passada 2 (design.md, 2026-07-26)

Redesign total (não incremental) de Cidade/Estilo/Rotina — as 3 telas
continuam compartilhando o mesmo template (`onboarding/layout.tsx` +
`transicao-de-passo.tsx` + `EntradaEscalonada` em cada página), mas
quase tudo dentro desse template mudou:

- **Paginação por pontos** (`onboarding/pontos-passo.tsx`, substitui
  `Progresso` por completo — arquivo apagado): 3 pontos centralizados
  no topo, sem número/rótulo visível (só um `sr-only` "Passo X de 3"
  pra leitor de tela). O ponto ativo estica em pílula (`w-6`), os
  inativos ficam círculo (`w-1.5`), cor via `bg-foreground`/
  `bg-foreground/25`. Deriva de `usePathname()`, mesmo padrão do
  `Progresso` antigo.
- **`onboarding/layout.tsx` não tem mais `max-w-sm`/`px-4`** — antes
  isso envolvia as 3 telas por igual; agora cada `page.tsx` controla a
  própria largura, porque Cidade precisa de uma imagem de borda a
  borda (largura de viewport cheia) enquanto Estilo/Rotina continuam
  numa coluna `max-w-sm` centralizada. `LogoMarca` também saiu daqui
  (não sobra nenhum uso do componente — ver seção "Marca" acima).
- **Cidade** (`onboarding/cidade/`): campo de cidade agora é
  autocomplete com seleção obrigatória — digitar sem escolher uma
  sugestão da lista não habilita "Continuar". Abaixo do formulário,
  imagem de apoio ocupa a largura inteira da tela (antes era um cartão
  menor com `rounded-2xl` e respiro ao redor). **A fonte de dado do
  autocomplete e a altura exata da imagem mudaram de novo na passada
  3 — ver seção própria abaixo, não fica descrito aqui.**
- **Estilo** (`onboarding/estilo/`): cada perfil usa imagem própria
  (retangular vertical) em vez da colagem de peça do catálogo — ver
  "Ativos de imagem" abaixo pro caminho exato. Dominante e
  complementares agora são a mesma grade de 2 colunas (`grid
  grid-cols-2`) com o mesmo cartão (`CartaoPerfilEstilo`, promovido pra
  `components/mixa/cartao-perfil-estilo.tsx` na rodada de 2026-07-27
  quando o modal de estilo do Perfil virou o 2º consumidor — ver seção
  "Perfil" abaixo); antes dominante era 1 cartão grande por linha e só
  complementares eram grade. O controle (rádio/checkbox) fica sobreposto
  no canto da imagem, não numa linha separada — mesmo princípio do ícone
  de favoritar nos cartões de look (ver "Telas de conteúdo" abaixo).
- **Rotina** (`onboarding/rotina/`): os 2 toggles fixos ("Trabalha
  fora de casa?"/"Treina?") viraram itens de rotina livres —
  `rotina-form.tsx` mantém uma lista de itens (`{id, rotulo, ocasiao,
  dias}`) editável via um `Dialog` (nome livre + categoria escolhida
  entre as 5 ocasiões existentes + dias da semana). **Conflito de dia
  é explícito, nunca silencioso** (bug antigo que o design.md pediu
  pra corrigir): tocar num dia que já pertence a outro item só marca
  esse dia como pendente (borda destrutiva + aviso de texto com o nome
  do item dono); um segundo toque no mesmo dia confirma a troca. Essa
  troca só é de fato aplicada aos outros itens no momento de "Salvar
  item" (não no toque de confirmação em si) — cancelar o painel nunca
  tem efeito colateral em outro item. O rótulo livre é só UX de
  entrada, não é persistido: `derivar-mapa-semana.ts` (que fazia
  treino sobrepor trabalho em silêncio — exatamente o bug citado) foi
  apagado; a tela monta o mapa de 7 dias localmente e manda só isso
  (`{diaSemana, ocasiao}[]`, JSON num hidden input) pro
  `salvarRotina`, que valida e grava — o schema de `rotina_dia`
  continua sem nenhuma mudança.

### Ativos de imagem (`public/abertura/`, `public/estilos/`)

Dois conjuntos de imagem que não vêm da API do catálogo — solte o
arquivo real no caminho exato abaixo pra substituir o placeholder
cinza, sem precisar editar código:

- **Carrossel de abertura** (4, já existiam desde a passada 1):
  `public/abertura/hero-1.svg`, `hero-2.svg`, `hero-3.svg`,
  `hero-4.svg` — retrato, proporção atual dos placeholders é 1080×1920
  (9:16). `hero-2.svg` também é reaproveitado como imagem de apoio da
  tela de Cidade (`onboarding/cidade/page.tsx`) — não é um 5º asset
  separado.
- **Perfil de estilo** (1 por perfil do catálogo, dinâmico):
  `public/estilos/{slug}.svg`, retangular vertical — proporção atual
  dos placeholders é 600×800 (3:4). `slug` vem de
  `lib/catalogo/slug-perfil.ts#slugPerfil(nome)` (testado em
  `slug-perfil.test.ts`): normaliza NFD, remove diacríticos, minúsculo,
  troca qualquer sequência não-alfanumérica por `-`, corta `-` das
  pontas. **Promovido de `onboarding/estilo/_lib/` pra `lib/catalogo/`
  na rodada de 2026-07-27**, quando o modal de estilo do Perfil passou a
  precisar do mesmo mapeamento nome→arquivo (2º consumidor genuíno, não
  duplicado — mesma régua de sempre pra promover algo de fatia-local
  pra compartilhado). Perfis do mock atual (`lib/catalogo/mock.ts`) e
  seus arquivos:
  - "Clássica" → `public/estilos/classica.svg`
  - "Descontraída/casual-chic" → `public/estilos/descontraida-casual-chic.svg`
  - "Moderna/minimalista" → `public/estilos/moderna-minimalista.svg`
  - "Romântica" → `public/estilos/romantica.svg`

  `estilo/page.tsx` resolve o caminho com `fs.existsSync` (server-side,
  mesmo padrão de `lib/marca.ts`) — sem o arquivo, cai no placeholder
  "Em breve" que já existe. **Um perfil novo do catálogo já mapeia
  sozinho** pra `public/estilos/{slugPerfil(nome)}.svg`: não precisa
  tocar em código nenhum, só soltar o arquivo com o nome certo.

## Onboarding — passada 3 (design.md, 2026-07-26)

Ajustes pontuais em Cidade/Estilo (a passada 2 tinha deixado 2 coisas
erradas/incompletas) + o título do modal de rotina. A mudança de
modelo maior (item de rotina com múltiplas categorias por dia + Hoje
com 1 cartão por categoria) — que aqui só teve o título do modal
ajustado — foi implementada na mesma passada, só que **depois** de um
relatório de mapeamento aprovado explicitamente antes de tocar em
schema/motor de decisão (convenção "investigar antes de alterar", já
que reformulava algo construído e funcionando). Ver "Rotina + Hoje —
modelo de múltiplos itens" logo abaixo pro resultado completo.

- **Cidade — imagem 100% do espaço restante**: a versão da passada 2
  usava uma altura fixa (`h-[48vh]`), que sobrava uma faixa de fundo
  antes do rodapé em telas mais altas. Corrigido via cadeia flex do
  topo até a página: `onboarding/layout.tsx`'s `<main>` virou `flex
  flex-col`, `transicao-de-passo.tsx`'s `motion.div` ganhou `flex-1
  min-h-0` (só assim uma altura definida chega até a página), e
  `cidade/page.tsx` deixou de usar `EntradaEscalonada` como container
  raiz — agora é um `div flex flex-col` próprio, com o bloco de
  texto/formulário em tamanho natural e a imagem em `flex-1 min-h-0`,
  preenchendo exatamente o que sobra, nunca menos nem mais. Como isso
  tocou 2 arquivos compartilhados pelos 3 passos (`layout.tsx`,
  `transicao-de-passo.tsx`), vale saber: é neutro pra Estilo/Rotina —
  `flex-1` num container cujo conteúdo já é mais alto que a tela
  simplesmente não faz nada (o conteúdo dita a altura do mesmo jeito),
  só passa a "esticar" quando o conteúdo é mais curto que a viewport,
  que é exatamente o caso da Cidade.
- **Cidade — autocomplete de verdade, não eco**: `OpenWeatherClient#
  buscarCidades` (que só devolvia o texto digitado de volta) foi
  removido. No lugar: `onboarding/cidade/_lib/municipios-ibge.ts`
  busca a lista completa de municípios do Brasil na API do IBGE
  (`servicodados.ibge.gov.br/api/v1/localidades/municipios`, gratuita,
  sem chave, ~5.571 municípios) **uma vez por processo** (cache em
  variável de módulo, não em toda tecla digitada) e
  `onboarding/cidade/_lib/filtrar-municipios.ts` (puro, testado em
  `filtrar-municipios.test.ts`) filtra localmente por prefixo — bate
  no início do nome antes de bater no meio, sem diferenciar
  acento/caixa. `_actions/buscar-cidades.ts` orquestra os dois e
  devolve no máximo 8, no formato `{nome, uf, label: "Cidade/UF"}`.
  Como o IBGE não devolve coordenada, a sugestão selecionada só carrega
  nome+UF (hidden inputs `cidade`/`uf`, não mais `lat`/`lon`) —
  `salvarCidade` volta a geocodificar 1x no submit, agora via
  `OpenWeatherClient#geocodificarMunicipio(cidade, uf)` (novo método,
  substitui o antigo `geocodificar()` removido na passada 2; o tipo
  `Coordenada` em `lib/clima/tipos.ts` voltou junto). `usuarios.cidade`
  passa a gravar `"Cidade/UF"` (era só o texto livre antes).
- **Estilo — texto vazando do cartão**: nomes sem espaço (ex.:
  "Descontraída/casual-chic") são 1 token só pro navegador quebrar de
  linha — sem `break-words`/`min-w-0` na cadeia do cartão até o `<p>`
  do nome, o texto ultrapassava a borda em vez de quebrar. Corrigido em
  `estilo-quiz.tsx#CartaoPerfil` (label, div de texto e os 2 parágrafos
  ganharam `min-w-0`/`break-words`).
- **Estilo — hierarquia dos títulos de seção, de fato agora**: "Estilo
  dominante" e "Complementares" foram pedidos na passada 2
  (`design.md` já dizia "títulos de seção... maiores/mais fortes que o
  corpo") mas saíram do mesmo tamanho do resto (`text-sm font-medium`)
  — não foi aplicado de verdade. Agora são `text-xl font-semibold`
  (mesmo `font-heading`, sem itálico — itálico continua reservado pro
  título da pergunta, `<h1>`), cada um com o subtítulo explicativo
  exato do design.md logo abaixo (`text-sm text-muted-foreground`).
- **Rotina — título do modal**: `DialogTitle` de "Novo item da
  rotina"/"Editar item" ganhou a mesma classe (`text-xl font-semibold`)
  usada nos títulos de seção do Estilo acima, via `className` na
  instância (o padrão do componente `DialogTitle` em
  `components/ui/dialog.tsx` continua menor — `text-base font-medium`
  — pra não afetar outro modal que apareça no futuro sem pedir esse
  peso).

## Rotina + Hoje — modelo de múltiplos itens (design.md, 2026-07-26)

Mudança de modelo de dados de verdade, não só visual — a única desta
passada (design.md limitou explicitamente a isso, catálogo/look/peça/
cápsula continuam intocados). Antes: **1 dia = 1 ocasião** (schema
`rotina_dia`/`ajuste_diario`, PK composta forçando exatamente 1 linha
por dia). Agora: **1 dia = vários itens, cada um com sua categoria** —
trabalho, treino, escola do filho, compromisso, tudo convivendo no
mesmo dia, sem exclusão. Ver seções "Dado do app", "Rotina
compartilhada" e "Motor de decisão" acima pro shape final; aqui vai o
que mudou tela por tela.

**Onboarding/rotina**: a trava de conflito da passada 2 ("já está em
X, toque pra mover pra cá") foi removida por completo — tocar num dia
já usado por outro item não faz mais nada de especial, os dois
convivem. Ganhou campo de emoji opcional por item (cai no padrão da
categoria se pular — `lib/rotina/emoji-padrao.ts`). `salvarRotina`
deixou de achatar os itens num mapa de 7 dias antes de submeter (não
dá mais, 2 itens podem cair no mesmo dia) — manda a lista de itens
direto (`{rotulo, emoji, ocasiao, diasSemana}[]`, JSON num hidden
input), 1 `INSERT` por item em `rotina_item`.

**Perfil** (`_components/rotina-editor.tsx`): mesmo padrão de itens
livres do onboarding, **duplicado** de propósito (convenção do
projeto — ver `_actions/gerenciar-item-rotina.ts`), com uma diferença:
aqui cada ação já persiste na hora (`useOptimistic` + Server Action
por toque, sem botão "Salvar"), porque é edição de uma rotina que já
existe, não a montagem inicial num fluxo de várias telas. Substitui o
antigo `atualizarDiaRotina` (upsert por dia, preso a uma PK que não
existe mais).

**Hoje**: `page.tsx` chama `obterLooksDoDia` (não mais `obterLookDoDia`)
e renderiza 1 `LookDoDiaCard` por entrada do array — cada cartão mostra
a categoria + os nomes/emoji de todos os itens daquele dia que caem
nela (`"🏋️ Crossfit · Musculação"`), e tem seu próprio botão "Trocar
look" (`trocarLook(ocasiao)` agora leva parâmetro — não existe mais "o"
cartão). `hoje-interativo.tsx` não usa `useOptimistic` pro conteúdo dos
cartões — trocar de categoria pode fazer uma categoria **nova**
aparecer (item recém-adicionado), que precisa de um look escolhido no
servidor, e isso não dá pra fabricar otimisticamente no client; só
`useTransition` marca "carregando" e `revalidatePath` traz o estado
real.

**"Hoje eu vou..." unificado** (`_actions/gerenciar-rotina-hoje.ts` +
`_components/ajustar-hoje-dialog.tsx`, substituem por completo os 4
botões fixos que existiam): o painel "Ajustar hoje" oferece adicionar
item com escolha de recorrência — "Toda [dia da semana atual]" grava
`rotina_item` (permanente, só com o dia de hoje marcado) ou "Só hoje"
grava `rotina_item_avulso` (nunca vira rotina fixa). O mesmo painel
lista os itens ativos hoje com botão pra **esconder só hoje** (itens
fixos, ícone de olho — grava em `rotina_item_oculto`, não mexe na
recorrência) ou **remover** (avulsos, ícone de lixeira — já eram só de
hoje mesmo). Itens escondidos aparecem numa 2ª lista ("Escondidos só
hoje") com botão de desfazer.

**Trocar look prefere variante — família, não só pai/filho direto**:
`motor-decisao.ts#buscarFamiliaDoLook` trata "base do look atual +
todo look que compartilha essa base" como família (não só o
pai/filho imediato — um look B variante de A e um look C também
variante de A são família entre si, mesmo que B e C nunca se
referenciem diretamente). `trocarLook` tenta a família primeiro
(excluindo o que já foi mostrado hoje **pra aquela categoria**); sem
família, cai pro pool normal da categoria; se esgotar, repete — limite
de curadoria do catálogo (poucas variantes cadastradas ainda), não
bug. Os fixtures mock atuais (`lib/catalogo/fixtures/looks.ts`) têm
todo `varianteDeId: null` — testar isso localmente em modo mock mostra
sempre o fallback (pool normal), não a preferência por família; pra ver
a família de verdade em ação precisa de `CATALOGO_API_MODE=http`
contra um catálogo com variantes cadastradas.

**`TiraSemanal`** (`components/mixa/tira-semanal.tsx`, usado por Perfil
e pelo preview do onboarding): passou por 2 formatos na mesma rodada —
ver "Onboarding — passada 4" abaixo pro formato atual (nomes dos itens,
não só emoji). Em ambos, Perfil e onboarding só conhecem a rotina
permanente aqui (sem avulso/oculto — `itensPorDiaDaSemana` em
`lib/rotina/itens-do-dia.ts` só olha `rotina_item`), já que
avulso/oculto são conceitos do dia corrente, específicos de Hoje.

**Migration em 2 passos, não 1**: `drizzle-kit generate` pede
confirmação interativa (terminal) quando uma passada tem tabela
dropada E criada ao mesmo tempo (tentando adivinhar se é rename) — sem
TTY disponível, isso travava. Solução: gerar em 2 passadas separadas
(`0001_drop_rotina_dia_ajuste_diario.sql` só com os drops de
`rotina_dia`/`ajuste_diario` + a coluna nova em `look_exibido`, depois
`0002_add_rotina_item_tables.sql` só com os creates das 3 tabelas
novas) — cada passada sozinha não tem ambiguidade nenhuma pra
perguntar. `look_exibido` tinha linhas de teste de sessões anteriores
sem `ocasiao` (coluna nova é `NOT NULL`) — truncada antes de migrar,
histórico de exibição é descartável, não dado de conta.

**Pendência de conteúdo, não bloqueante** (já assim no design.md): o
texto do push ("Seu look do dia chegou", singular) pode não fazer mais
sentido com vários cartões por dia — não ajustado ainda, aguardando
prioridade.

## Onboarding — passada 4 (2026-07-26)

Dois ajustes pontuais depois de ver a passada 3 rodando de verdade —
nenhum dos dois veio do design.md (o documento não foi atualizado pra
isso), vieram direto de feedback ao vivo.

**`TiraSemanal` — nomes dos itens, não só emoji.** O formato "emoji da
categoria, lado a lado" (documentado na seção "Rotina + Hoje" acima)
foi pro ar, testado ao vivo, e voltou atrás: sem o nome do item
("Palestra", "Academia", "Empresa"...) a tira não comunicava nada
específico, só a categoria. Layout mudou de grade de 7 colunas
(`grid-cols-7`, 1 bloco fino por dia) pra **lista vertical de 7
linhas** — cada dia agora ocupa a largura inteira do cartão, com o
rótulo do dia à esquerda e os itens daquele dia (emoji + nome, cada um
uma pílula) quebrando em várias linhas à direita quando não cabem numa
só. Dia sem item nenhum mostra "🏠 Casa" por extenso, não só o emoji.
`lib/rotina/itens-do-dia.ts#mapaSemanalPorCategoria` (que só devolvia
`Ocasiao[]`, categoria sem detalhe nenhum) foi substituída por
`itensPorDiaDaSemana`, que devolve os itens completos
(`Record<diaSemana, ItemRotina[]>`) — a `TiraSemanal` precisa do
`rotulo` de cada item, não só sabia quais categorias existiam. Como
consequência, `diaSelecionado`/`aoTocarDia` (suporte a tira clicável)
saíram do componente — nenhum dos 2 consumidores (Perfil, onboarding)
usava mais isso desde que os dois viraram editores por item em vez de
por dia-clicável, então era código morto.

**Incidente de produção — schema nunca migrado lá.** Depois dessa
sessão inteira mudando o modelo de rotina (ver "Rotina + Hoje" acima),
o deploy no Vercel foi ao ar com o código novo, mas ninguém tinha
rodado as migrations 0001/0002 no banco de **produção** (só no local)
— toda tela autenticada quebrava (`relation "rotina_item" does not
exist"`). Diagnosticado direto pelos logs de runtime da Vercel
(`vercel logs <url>`, não dá pra confiar no erro genérico que o
Next.js mostra no navegador em produção). Duas complicações no caminho
até resolver, que valem registro caso se repita:

- **`drizzle-kit migrate` falhava em silêncio** no terminal
  PowerShell da usuária contra o Supabase — sem spinner, sem erro,
  sem sucesso, só voltava pro prompt. Nem trocar o modo de conexão
  (pooler → direta) nem ajustar `sslmode` resolveu — o problema era o
  próprio `drizzle-kit` CLI, não a conexão (confirmado rodando um
  script `pg` puro contra a mesma URL, que sempre conectou e
  respondeu normal). Correção: `scripts/aplicar-migrations-direto.mjs`
  — aplica os `.sql` de `db/migrations/` direto via `pg`, respeitando
  `db/migrations/meta/_journal.json` e gravando o hash de cada
  migration em `drizzle.__drizzle_migrations` do mesmo jeito que o
  `drizzle-kit` faria, então uma rodada futura de `drizzle-kit migrate`
  (se voltar a funcionar) reconhece o que já foi aplicado e não tenta
  duplicar. Testado antes contra um banco Postgres local descartável
  pra confirmar que o comportamento bate 100% com o `drizzle-kit` real.
  `scripts/diagnostico-conexao.mjs` é o complemento — conecta, lista
  tabelas de `public` e o histórico de `__drizzle_migrations`, sem
  spinner nem ambiguidade, útil sempre que precisar confirmar de fato o
  que existe num banco (local ou remoto) sem depender da UI do
  `drizzle-kit`. Os dois recebem `DATABASE_URL` do ambiente, iguais aos
  scripts `db:*` do `package.json`.
- **`ALTER TABLE look_exibido ADD COLUMN ocasiao ... NOT NULL` falhou**
  pela mesma razão que era esperada desde que a coluna foi desenhada
  (ver "Rotina + Hoje" acima): produção tinha 9 linhas reais de
  histórico de exibição (contas de teste de sessões anteriores, sem
  dado de conta real) sem valor pra essa coluna nova. `TRUNCATE
  look_exibido` antes de aplicar resolveu — mesma decisão já tomada
  pro ambiente local, documentada como aceitável porque é histórico
  descartável, não dado de conta.

Pra migration de produção **daqui pra frente**: se `npm run db:migrate`
funcionar normal, usa ele. Se travar/falhar em silêncio de novo,
`node scripts/aplicar-migrations-direto.mjs` com `DATABASE_URL` da
conexão **direta** do Supabase (não o pooler — pooler é bom pro app em
runtime, mas migrations merecem a conexão direta) é o caminho validado.

## Barra de navegação + detalhe de look (design.md, 2026-07-25)

**Superseded pela rodada de 2026-07-27** — 4 abas viraram 5 e o círculo
deixou de ser fixo em Hoje. Ver "Navegação, cabeçalho e central de
notificações" abaixo pro estado atual da pílula; o resto desta seção
(detalhe de look) continua valendo sem mudança.

Nova rota `app/(app)/looks/[id]/page.tsx` (detalhe de look, não existia
antes) — `LookCard` (promovido pra `components/mixa/look-card.tsx` na
rodada de 2026-07-27, ver "Telas de conteúdo" abaixo) é `<Link>` pra
lá; o botão de favoritar continua **fora** do `<Link>` (irmão
posicionado por cima via `absolute`, não dentro), pra tocar no coração
não disparar navegação. Busca o look por id fazendo
`listarLooksAprovados({})` e filtrando localmente
(`buscarLookPorId` em `looks/_queries/listar-looks.ts`) — o cliente do
catálogo não tem filtro por id; aceitável no volume atual, revisitar se
o catálogo crescer muito. Ação principal (favoritar) fixa embaixo,
posicionada **acima** da pílula de navegação (não colada nela, `bottom:
5.5rem` — as duas ficam visíveis ao mesmo tempo sem se sobrepor). O
cabeçalho por aba (ver abaixo) **não aparece** nesta tela — só nas 5
raízes de aba, pra não duplicar com o link "← Looks" que essa tela já
tem.

## Navegação, cabeçalho e central de notificações (design.md, 2026-07-27)

**5 abas, não 4**: `components/shell/bottom-nav.tsx` agora é Looks/
Favoritos/Hoje/Promos/Perfil, nessa ordem — Hoje sempre no meio
(3ª posição de 5, agora um slot matematicamente central de verdade,
diferente da acomodação "2ª de 4" da rodada anterior). O app **sempre
abre em Hoje** mesmo não sendo a 1ª aba da lista — isso é uma decisão
de destino inicial (`/` redireciona pra `/hoje` quando o onboarding já
terminou), não tem relação com a ordem das abas na pílula.

**O círculo elevado passa a representar a aba ativa, não fixo em
Hoje**: desliza animado entre posições via `layoutId` compartilhado do
`motion` (FLIP — a lib recalcula a transição a partir da posição real
no grid CSS, não de um percentual estimado, o que garante precisão
mesmo nas colunas das pontas onde o padding do `<ul>` distorceria uma
conta em `%`). Implementação: cada `<li>` (real e o círculo) recebe
`style={{gridColumnStart: indice + 1}}` num `grid-cols-5`; o ícone
dentro do círculo troca com `AnimatePresence mode="wait"` (crossfade
curto, 150ms) sincronizado com a troca de posição. **Alinhamento
vertical, 2 correções na mesma área**: primeiro o círculo tinha `-mt-6`
fixo (herdado de quando só existia em Hoje) que o deixava alto demais
calçado nas outras 4 posições — virou `marginTop: "-1.25rem"` uniforme
pras 5. Essa elevação em si foi removida de vez depois (2026-07-28,
feedback direto): o círculo é maior que os outros itens e todos dividem
a mesma linha do grid (`row-start-1`), então sem nenhum margin ele
mesmo dita a altura da linha e fica **sempre contido dentro da pílula**
— nunca mais projeta pra cima da borda, mesmo selecionado. O `<Link>`
de texto por baixo do círculo continua com `invisible` (não
`text-muted-foreground`) pra manter o espaço do grid reservado sem
duplicar layout nem cortar o alinhamento entre ícone ativo e inativo.

**Cabeçalho por aba** (`components/shell/cabecalho-aba.tsx`, novo):
container sem fundo/borda no topo de `(app)/layout.tsx`, fora da
`TransicaoDeAba` de propósito (são animações de natureza diferente, não
devem ficar acopladas) — título pequeno + descrição grande em
`font-heading italic` (mesma hierarquia dos títulos de seção usados em
Looks/Hoje) à esquerda, sino da central de notificações à direita.
Texto exato por rota (design.md): Hoje "Hoje / Seu guarda-roupa do
dia", Looks "Looks / Guarda-roupa", Favoritos "Favoritos / Seus looks
guardados", Promos "Promos / Ofertas das parceiras", Perfil "Perfil /
Sua conta" — troca com fade via `AnimatePresence mode="wait"`
(`key={pathname}`), nunca corte seco. **Só aparece nas 5 raízes de
aba** (match exato de pathname, não `startsWith`) — sem isso, a rota de
detalhe `/looks/[id]` (que já tem seu próprio link "← Looks") ganharia
um 2º cabeçalho duplicado por cima; esse é o motivo do match ser exato
e não por prefixo, ao contrário do `BottomNav` (que usa `startsWith` de
propósito, pra continuar destacando "Looks" como aba ativa mesmo dentro
do detalhe).

**Central de notificações** (`components/shell/central-notificacoes.tsx`,
novo): acessada pelo sino do cabeçalho, **uma só pra todo o app** — não
uma por aba, `Dialog` controlado (`open`/`onOpenChange`) montado 1x em
`(app)/layout.tsx`. O card fixo "instale o app / ative notificações"
que antes ficava preso no topo de Hoje (`hoje/_components/
tutorial-instalacao.tsx`, apagado) **saiu de lá e virou a 1ª entrada**
dessa central — mesmo conteúdo (`AtivarNotificacoes` + "Agora não" que
marca `tutorialInstalacaoVistoEm`), só de endereço novo.
`marcar-tutorial-visto.ts` foi promovido de `hoje/_actions/` pra
`components/shell/_actions/` (só a central usa agora). Sem esse card
(usuária já ativou ou já dispensou), a central mostra um estado vazio
("Nenhuma notificação por enquanto") — nenhum outro tipo de notificação
foi inventado nesta rodada, de propósito (fora de escopo, design.md).
O sino ganha um indicador (bolinha) quando há algo novo pra ver — hoje
só reflete `!tutorialInstalacaoVistoEm`.

## Telas de conteúdo — primeira redesign real (design.md, 2026-07-27)

Rodadas anteriores cobriram só a tela de abertura e o onboarding, de
propósito — esta é a **primeira vez** que Looks, Favoritos, Promos,
Perfil e o detalhe de look recebem um redesign de verdade, ancorado nos
prints de referência do design.md, não um ajuste cosmético em cima do
que já existia.

**Cartão edge-to-edge compartilhado** — a peça central do redesign,
promovida pra `components/mixa/` porque agora tem 4 consumidores
genuínos (Looks, Favoritos, Hoje, detalhe de look), não só Looks como
antes:
- `colagem-look.tsx`: perdeu o próprio `rounded-lg` (quem envolve por
  fora decide o arredondamento agora, edge-to-edge de verdade — a foto
  preenche o cartão de canto a canto, sem moldura). Ganhou tratamento
  pra número ímpar de peças: a última peça vira `col-span-2` com
  `aspect-8/5` (proporção calculada pra preservar a mesma altura de
  linha que um par normal em `aspect-4/5`, evitando um salto brusco de
  altura só na última linha) em vez de deixar um bloco cinza vazio
  sobrando.
- `look-card.tsx` (movido de `looks/_components/`): `<div
  className="relative overflow-hidden rounded-2xl bg-secondary">`
  envolvendo o `<Link>` (colagem + legenda) + `BotaoFavoritar`
  posicionado `absolute top-3 right-3` — círculo flutuante com
  `bg-background/90 backdrop-blur-sm`, contraste garantido sobre
  qualquer foto, nunca numa barra separada embaixo.
- `look-grid.tsx` (movido): masonry via CSS puro (`columns-2 gap-4` +
  `break-inside-avoid` por item) — decisão consciente por `columns`
  em vez do `grid-template-rows: masonry` experimental (suporte
  inconsistente entre navegadores, principalmente Safari) e em vez de
  um masonry calculado em JS (que tiraria o zero-JS Server Component
  que `LookGrid` é hoje). Elimina os blocos cinza vazios que a grade
  fixa antiga deixava quando os cartões tinham alturas diferentes.
- `alternar-favorito.ts` + `queries.ts` (movidos de `looks/_actions/`
  e `looks/_queries/` pra `lib/favoritos/`) — mesma régua de sempre pra
  promover algo de fatia-local pra compartilhado: com Favoritos
  precisando do mesmíssimo favoritar sem duplicar componente
  (design.md explícito: "sem componente novo"), continuar como
  código Looks-local ia forçar ou duplicação ou import entre fatias,
  os 2 proibidos pela convenção do projeto.

**Looks** (`app/(app)/looks/page.tsx`): filtros de ocasião e clima
viram múltipla escolha **dentro da mesma linha** (antes só entre linhas
funcionava — dava pra combinar 1 ocasião com 1 clima, nunca 2 ocasiões
juntas). `_lib/filtrar-multiplo.ts#filtrarLooksMultiplo` (pura, 4
testes) é uma função **nova e local** à fatia de Looks, deliberadamente
**não** uma mudança em `lib/catalogo/filtrar.ts#filtrarLooks` — esse
filtro compartilhado também alimenta o motor de decisão de Hoje, que
sempre quer valor único exato por critério; mudar a semântica dele pra
OR-múltiplo quebraria Hoje sem necessidade. A URL carrega os filtros
via chave repetida (`?ocasiao=trabalho&ocasiao=evento`), lida com
`searchParams: Promise<{ocasiao?: string | string[]}>` + um `paraArray()`
local. Organização por cápsula (mais recente em destaque) não mudou —
só ganhou o cartão novo.

**Favoritos** (`app/(app)/favoritos/`, rota nova): o mesmo `LookGrid`
masonry, filtrado só pro que a usuária favoritou
(`lib/favoritos/queries.ts#listarLooksFavoritados`) — sem agrupar por
cápsula (é uma coleção pessoal, não uma vitrine por lançamento) e sem
nenhum componente novo, exatamente como pedido.

**Detalhe de look** (`looks/[id]/page.tsx`): já tinha a estrutura que o
design.md pede (imagem/colagem em destaque, tira de miniaturas embaixo,
ação principal fixa acima da pílula) desde a rodada de 2026-07-25 —
essa rodada só atualizou os imports pros novos endereços compartilhados
(`lib/favoritos/queries`, `components/mixa/botao-favoritar`), sem
mudança estrutural.

**Hoje** (`hoje/_components/look-do-dia-card.tsx`): os cartões de
categoria (1 por categoria distinta do dia, já definido antes) ganham o
mesmo tratamento visual dos cartões de Looks — cabeçalho de categoria +
itens do dia fica **fora** do cartão (mesmo papel que o nome da cápsula
em Looks: um título de seção, não conteúdo do cartão), e o cartão em si
(colagem edge-to-edge + nome do look + lista de peças + "Trocar look")
vira um único `overflow-hidden rounded-2xl bg-secondary`.

**Promos**: sem dado de afiliado real ainda (fora de escopo, sem
mudança de funcionalidade) — só o estado vazio e o card do Grupo VIP
ganharam `rounded-2xl`/pílula/título Fraunces italic, mesmo tratamento
visual do resto do app.

## Perfil — hierarquia de seção, nome e modal de estilo (design.md, 2026-07-27)

**Hierarquia real de seção**: cada bloco (Conta, Assinatura, Aparência,
Notificação, Rotina semanal, Estilo) ganha um título `font-heading
italic` — antes todo `<h2>` usava o mesmo `text-xl` sem distinção
nenhuma entre eles. Os cartões internos (assinatura, item de rotina,
etc.) também passaram a usar `rounded-2xl bg-secondary`, consistente
com o cartão compartilhado do resto do app.

**Campo nome, novo**: `usuarios.nome` (`NOT NULL` — ver "Dado do app"
acima) capturado na folha "Criar conta"
(`(auth)/login/_components/conta-form.tsx`, 1º campo, antes de
e-mail) via `criarConta`/`contaSchema`. No Perfil, nome vira o título
principal (`text-2xl font-medium`) e e-mail desce pra informação
secundária (`text-sm text-muted-foreground`) logo abaixo — inversão
deliberada de peso visual, e-mail nunca foi pensado como identidade
pra usuária, é só a credencial de login.

**Modal de estilo, no lugar da lista de rádio em texto**: `EstiloEditor`
(`perfil/_components/estilo-editor.tsx`) virou um botão que mostra o
nome do estilo dominante atual e abre um `Dialog` reaproveitando
`CartaoPerfilEstilo` (mesmo componente de imagem do quiz de estilo do
onboarding, promovido pra `components/mixa/` — ver "Telas de conteúdo"
acima) — a usuária reconhece o estilo pela imagem, não precisa lembrar
o nome (design.md). O formulário interno é o mesmo de sempre
(`atualizarEstilo`, inalterado) só que fecha o modal sozinho ao salvar
com sucesso (`useEffect` observando `estado?.sucesso`).

**Botão "Salvar" do horário de notificação — bug confirmado e
corrigido** (convenção "investigar antes de alterar", por ser correção
de algo que já existia): a usuária relatou comportamento "estranho".
Hipótese: sem feedback de sucesso visível, possivelmente combinado com
o campo não refletindo o valor salvo. Investigado ao vivo — o dado
persistia certo (confirmado sobrevivendo a reload completo), mas 2
coisas mascaravam isso: (1) `<Input defaultValue={horarioAtual}>` é
**uncontrolled** (Base UI) — depois de `revalidatePath` trazer um
`horarioAtual` novo do servidor, o campo não resincroniza sozinho
(console emite "Base UI: A component is changing the default value
state of an uncontrolled FieldControl after being initialized",
capturado como evidência direta do mecanismo); (2) nenhum toast/mensagem
de sucesso era mostrado, então um clique que funcionou parecia não ter
feito nada. **Fix** (`notificacao-form.tsx` + `atualizar-notificacao.ts`):
`key={horarioAtual}` no `<Input>` força remontagem quando o valor do
servidor muda, e a action passou a devolver `{sucesso: true}`, disparando
`toast.success("Horário atualizado.")` — mesmo padrão `sonner` já usado
em `AtivarNotificacoes`.

## Convenções de formulário (portadas do catálogo)

`<form action={serverAction}>` nativo + `useActionState`, sem
react-hook-form. Padrão: action retorna `{ erro? } | { erro?, sucesso? }`,
nunca lança pro usuário ver. Onde dava pra evitar `useState` client
inteiramente (checkboxes/toggles que são só navegação ou
`formAction` nativo por botão — ver `hoje/_components/ajuste-hoje-botoes.tsx`
e `looks/_components/filtros.tsx`), preferi isso a um Client Component.

Mesmos gotchas do Next 16 / Base UI documentados no `CLAUDE.md` do
catálogo (`params`/`searchParams` são Promise; Base UI não tem
`asChild`, usa `render={<Componente/>}`; ajustar estado a partir de
prop/valor derivado nunca com `useEffect`+`setState`). Aqui, evitei o
`<SelectValue>`/shadcn `Select` quase inteiramente — usei `<select>`
nativo (`perfil/_components/rotina-editor.tsx`) ou botões com
`formAction` nativo em vez disso, então esse gotcha específico não chega
a aparecer no código atual.

### 2 gotchas novos, encontrados verificando o app rodando (não estavam no catálogo)

- **Arquivo `"use server"` só pode exportar funções async.** Next trata
  **todo** export do arquivo como Server Action — uma constante ou
  função pura exportada junto quebra o build com "Server Actions must
  be async functions". Aconteceu em `hoje/_actions/ajustar-hoje.ts`
  (tinha `opcaoAjusteHojeParaOcasiao`, uma função pura, exportada ali
  junto). Fix: toda constante/tipo/função pura que uma Server Action
  usa mora num arquivo **sem** `"use server"` ao lado (ver
  `hoje/_lib/opcoes-ajuste.ts`) — só o que é literalmente a action fica
  no arquivo com a diretiva.
- **Botão com `formAction={acaoServidor}` não pode ter `name`/`value`
  próprios** quando `acaoServidor` é uma referência de Server Action
  (não uma função inline) — React usa esses atributos pra codificar
  qual ação/argumento disparar, e ignora (com aviso no console) o que
  você tentar sobrescrever. Isso quebrava `ajuste-hoje-botoes.tsx`: 4
  botões, mesma action, `name="opcao" value={opcao}` pra distinguir —
  o valor lido no servidor não era confiável. Fix: pré-prender o
  argumento com `.bind(null, valor)` (`formAction={acao.bind(null,
  opcao)}`), o jeito documentado de mandar 1 argumento fixo por botão;
  a action passa a receber o valor direto como parâmetro, não via
  `FormData`.

## Comandos

```bash
docker compose up -d       # Postgres próprio, porta 5433
npm run db:generate        # gera migration a partir de db/schema
npm run db:migrate         # aplica migrations
npm run db:seed            # cria 1 conta já com onboarding completo (dev)
npm run dev                # http://localhost:3000
npm run lint
npm test                   # vitest run
npm run db:studio          # Drizzle Studio
npm run push:vapid         # gera novo par de chaves VAPID
npm run cron:notificacoes  # dispara o cron de push manualmente (local)
```

`.env` (copiar de `.env.example`): `DATABASE_URL`, `AUTH_SECRET`,
`CATALOGO_API_MODE`/`CATALOGO_API_URL`/`CATALOGO_API_TOKEN`,
`OPENWEATHER_API_KEY`, `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/
`VAPID_SUBJECT`/`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `CRON_SECRET`,
`SEED_USER_EMAIL`/`SEED_USER_PASSWORD`.

## Pendências propositalmente incompletas (fase 1)

- ~~Logo real~~ **resolvido (2026-07-24)**: os 6 arquivos da marca
  (`public/logo/{icone,logotipo-horizontal,logotipo-vertical}-{preto,branco}.svg`)
  foram entregues e já estão em uso — ver seção "Marca (`public/logo/`,
  `lib/marca.ts`)" abaixo. `logotipo-vertical-*.svg` ainda não é
  consumido em nenhuma tela (só horizontal, no login e no cabeçalho do
  onboarding) — fica disponível pra quando fizer sentido (ex.: splash
  screen).
- **General Sans**: Inter como placeholder na variável `--font-body`,
  igual ao catálogo — trocar via `next/font/local` quando os arquivos
  chegarem.
- **Endpoint do catálogo tem 0 looks**: ver seção "Cliente do
  catálogo" acima — funcional, só falta curadoria do lado de lá.
- **`/api/v1/pecas` não é consumido**: só necessário se/quando a aba
  Promos precisar de peça isolada com link de afiliado.
- **Afiliados reais**: `linkAfiliado` sempre `null` (nenhuma peça do
  catálogo tem ainda, e a aba Promos é só shell).
- **Pagamento real**: `AssinaturaCard` mostra contagem do trial e um
  botão "Assinar" desabilitado — sem processador escolhido, sem
  checkout.
- **Login social (Google)** e **fallback de notificação por e-mail**:
  não entram nesta fase (spec).
- **Fuso horário do cron**: fixo em America/Sao_Paulo (ver seção PWA).

## Como verificar rodando local

```bash
docker compose up -d
npm run db:generate && npm run db:migrate
npm run dev
```

1. Abra `http://localhost:3000` → cai em `/login`, a tela de abertura
   (carrossel em loop, 4 imagens placeholder trocando com crossfade +
   Ken Burns, logo horizontal branco acima do título/subtítulo, barra
   de progresso estilo Stories no topo). Toque "Criar conta" — a folha
   sobe animada por cima, sem cobrir a tela inteira.
2. Crie a conta (e-mail/senha) — isso não conta mais como um passo do
   onboarding, é só a folha de autenticação. Você cai direto em
   **Cidade** (1º de 3 pontos no topo, sem número/logo/barra): digite
   parte do nome da cidade (ex.: "For") e veja **várias cidades reais**
   sugeridas (Fortaleza/CE, Formosa/GO...) — selecionar é obrigatório
   pra habilitar "Continuar" — repare na imagem de apoio preenchendo
   exatamente o espaço restante da tela, sem sobra nem corte. Em
   **Estilo** (2º ponto), veja a grade de 2 colunas com imagem própria
   por perfil, os títulos "Estilo dominante"/"Complementares" bem mais
   fortes que o corpo de texto, com subtítulo explicativo embaixo de
   cada um, e nenhum nome de estilo vazando do cartão. Em **Rotina**
   (3º ponto), toque "Adicionar item", dê um nome livre (ex.:
   "Crossfit"), um emoji opcional, uma categoria e os dias — crie um 2º
   item (ex.: "Musculação") escolhendo **o mesmo dia** do 1º: os dois
   convivem sem aviso nenhum de conflito — e veja a tira semanal
   mostrar os emojis das 2 categorias lado a lado naquele dia.
3. Cai em **Hoje** com 1 cartão por categoria distinta do dia (se você
   criou Crossfit+Musculação em Treino no mesmo dia, é só 1 cartão de
   Treino mostrando os 2 nomes juntos). Teste "Trocar look" de um
   cartão. Toque "Ajustar hoje": adicione um item avulso escolhendo
   "Só hoje" (ex.: "Dentista") e veja um cartão novo aparecer pra
   categoria dele; depois esconda um item fixo (ícone de olho) e
   confirme que o cartão daquela categoria muda (ou some, se não
   sobrar mais nenhum item nela) — volte no painel e toque "mostrar de
   novo" pra desfazer, sem ter perdido a recorrência do item.
4. **Navegação e cabeçalho**: toque as 5 abas na pílula (Looks/
   Favoritos/Hoje/Promos/Perfil) e veja o círculo deslizar até a coluna
   certa, com o ícone trocando por dentro — repare que ele fica
   alinhado verticalmente igual nas 5 posições, não só em Hoje. O
   cabeçalho no topo troca de texto com fade (nunca corte seco) —
   confira a cópia exata: "Looks / Guarda-roupa", "Favoritos / Seus
   looks guardados", "Hoje / Seu guarda-roupa do dia", "Promos /
   Ofertas das parceiras", "Perfil / Sua conta".
5. **Central de notificações**: toque o sino no cabeçalho — o card
   "Instale o Mixa" (que antes ficava fixo no topo de Hoje) aparece ali
   dentro, com "Ativar notificações"/"Agora não". Depois de dispensar
   ou ativar, abra o sino de novo e veja o estado vazio ("Nenhuma
   notificação por enquanto"). Abra o sino a partir de **qualquer** aba
   — é a mesma central em todo lugar, não uma por aba.
6. **Looks**: veja o feed em masonry (colunas de altura desigual, sem
   blocos cinza vazios) — toque 2 chips de ocasião ao mesmo tempo (ex.:
   "Trabalho" + "Evento") e confirme que ambos ficam ativos e o feed
   mostra looks das duas categorias juntas (múltipla escolha **dentro**
   da mesma linha de filtro, antes só entre linhas funcionava);
   repita com clima. Favorite um look (coração sobreposto no canto da
   foto).
7. **Favoritos**: abra a aba — só o(s) look(s) que você favoritou em
   Looks aparecem, mesmo cartão/masonry, sem agrupar por cápsula.
8. Abra o detalhe de um look (toque o cartão, não o coração) — sem
   cabeçalho de aba duplicado no topo (só o link "← Looks"), colagem
   grande, tira de miniaturas, ação de favoritar fixa embaixo.
9. **Hoje**: confira que cada cartão de categoria tem a mesma cara dos
   cartões de Looks (colagem edge-to-edge + nome do look + peças dentro
   de um cartão só), com o cabeçalho da categoria (nome + itens do dia)
   fora do cartão. Teste "Trocar look" e "Ajustar hoje" normalmente.
10. **Perfil**: confira o nome (não o e-mail) como título grande no
    topo, com e-mail menor logo abaixo; veja a hierarquia de seção
    (Conta/Assinatura/Aparência/Notificação/Rotina semanal/Estilo, cada
    título em itálico). Toque o botão de Estilo — abre um modal com a
    mesma grade de cartões com imagem do onboarding (não mais lista de
    rádio em texto), escolha um dominante diferente e confirme que o
    modal fecha sozinho e o nome atualiza no botão. Mude o horário de
    notificação e toque "Salvar" — confirme o toast de sucesso e que o
    campo mostra o horário salvo (não o antigo) depois do reload.
11. Em Perfil ou na central de notificações, clique "Ativar
    notificações" (aceite a permissão do navegador) e depois "enviar
    teste" (ou `POST /api/push/teste` com a sessão logada) — a
    notificação abre `/hoje`. Instalar como PWA de verdade (ícone
    "Adicionar à Tela de Início") é o único jeito de testar no iOS.

Repita o passo 4 em diante trocando o tema (seletor Sistema/Claro/
Escuro em Perfil → Aparência) — todo o redesign desta rodada usa os
mesmos 2 tokens de marca de sempre, então claro/escuro devem se
comportar de forma consistente sem cor "vazando" do tema errado.

Pra testar contra o catálogo de verdade em vez do mock: rode
`mixa-catalogo` (`npm run dev`, porta diferente da do app), configure
`CATALOGO_API_MODE=http`, `CATALOGO_API_URL=http://localhost:<porta>`,
`CATALOGO_API_TOKEN=<API_TOKEN de lá>` — só não espere ver looks até
que a plataforma interna tenha algum aprovado.
