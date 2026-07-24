# Mixa — App (usuária final)

App final que a usuária (mãe, assinante) usa: onboarding, autenticação,
motor de decisão do look do dia, e as 4 abas Hoje/Looks/Promos/Perfil.
Ver `SPEC-mixa-app.md` para o domínio completo — este arquivo é sobre
como o código está organizado e como rodar o projeto.

Projeto **separado** de `mixa-catalogo` (a plataforma interna de
curadoria, pasta irmã) — sem código nem banco compartilhado, só consumo
de uma API HTTP de leitura que o catálogo expõe.

## Convenção: investigar antes de alterar

Ao corrigir um bug ou comportamento que já existe (não ao criar algo
novo), declare a hipótese da causa antes de mexer em qualquer código,
investigue essa hipótese primeiro, e só implemente a correção se ela for
confirmada. Se a investigação não confirmar, não altere nada — relate o
que encontrou e espere confirmação. Vale só pra alteração/correção;
criação de funcionalidade nova passa por plan mode, sem essa etapa.

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
  (auth)/login/                      # flat: page + form + action (tela única, pequena)
  (onboarding)/onboarding/
    layout.tsx, progresso.tsx         # indicador de progresso (client, usePathname)
    conta/ cidade/ estilo/ rotina/    # 1 pasta por passo
  (app)/
    layout.tsx                        # gate auth+onboarding, bottom nav
    hoje/    _lib/ _queries/ _actions/ _components/
    looks/   _actions/ _components/ _queries/
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
  catalogo/            # cliente do catálogo (ver seção própria)
  clima/                # cliente de clima (ver seção própria)
  push/web-push.ts       # envio de notificação

db/                 # schema próprio (ver "Dado do app")
components/
  ui/                 # shadcn primitives
  shell/bottom-nav.tsx # só usado por (app)/layout.tsx
  mixa/                # UI genuinamente cross-fatia: ColagemLook (Hoje+Looks+onboarding/estilo), AtivarNotificacoes (Hoje+Perfil)
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
  Sem campo `nome` — a spec só pede e-mail/senha.
- **`usuario_perfil_complementar`**: até 2 por usuária.
- **`rotina_dia`**: `(usuarioId, diaSemana 0-6, ocasiao)` — `diaSemana`
  segue `Date.getDay()` (0 = domingo). 7 linhas por usuária.
- **`ajuste_diario`**: `(usuarioId, data, ocasiao)` — "hoje eu vou...",
  só vale pro dia marcado.
- **`favorito`**, **`look_exibido`** (histórico pro motor não repetir),
  **`clima_cache`** (cidade+dia), **`push_subscription`**,
  **`notificacao_enviada`** (evita reenviar 2x no mesmo dia).

**Onboarding completo é derivado, não uma flag**:
`lib/onboarding.ts#proximoPassoOnboarding` — sem `cidade` → passo
cidade; sem `perfilDominanteId` → passo estilo; sem linha em
`rotina_dia` → passo rotina; senão completo. Usado por `/` (redirect
raiz), `(app)/layout.tsx` (gate) e cada `page.tsx` de onboarding (pra
empurrar de volta quem já terminou e volta numa URL antiga).

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

## Motor de decisão (`app/(app)/hoje/_lib/`, `_queries/`, `_actions/`)

Só a fatia de Hoje usa — mora lá, não em `lib/`.

1. `escolher-ocasiao-do-dia.ts`: ajuste de hoje > rotina do dia > "casa".
2. `motor-decisao.ts#buscarCandidatos`: filtra o catálogo por
   ocasião+clima+estilo (dominante OU complementar — dominante só
   desempata a ordenação depois, não restringe o filtro).
3. `motor-decisao.ts#escolherLook` (pura, testada): recebe
   "camadas de exclusão" em ordem (mais restritiva primeiro) — a
   primeira camada que não esvaziar tudo vence; se todas esvaziarem,
   cai pro pool completo (repetir é melhor que não mostrar nada).
   Desempate: perfil dominante > cápsula mais recente > id.
4. `_queries/look-do-dia.ts#obterLookDoDia` (usado pela renderização
   normal): estável entre reloads — reaproveita o look já registrado
   hoje se ele ainda bate no critério atual; só escolhe de novo se não
   há nada hoje ainda, **ou** se o critério mudou (ex.: "hoje eu
   vou..." muda a ocasião e o look antigo deixa de aparecer nos
   candidatos frescos — reseleciona sozinho, sem lógica especial no
   `_actions/ajustar-hoje.ts`).
5. `_actions/trocar-look.ts`: mesmo filtro, exclui só o que já foi
   mostrado **hoje** (a "sessão" do produto = dia corrente, não cookie
   de navegador).

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
  lado a lado — usado em `(auth)/login/page.tsx` e
  `(onboarding)/onboarding/layout.tsx` via `<img>` direto.
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
fundo escuro se não trocar. `components/mixa/logo-marca.tsx` resolve
isso com CSS puro (`block dark:hidden` / `hidden dark:block`, as duas
`<img>` sempre no DOM), sem precisar de client component — usado em
login e no cabeçalho do onboarding. Achado revisando visualmente (não
óbvio até ver o screenshot em dark): qualquer novo lugar que use um SVG
de logo direto (não os ícones gerados) precisa do mesmo tratamento.

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
`looks/_components/botao-favoritar.tsx` (favoritar) e
`perfil/_components/rotina-editor.tsx` (tira semanal, upsert por dia
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

## Movimento (3 momentos, só esses — ver SPEC/pedido de refinamento)

`tw-animate-css` (utilities) + CSS puro, sem lib de animação nova:
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

1. Abra `http://localhost:3000` → cai em `/login` → "Comece por aqui".
2. Crie a conta (e-mail/senha), passe pelas 4 etapas do onboarding
   (cidade, estilo — repare que o card de referência visual de cada
   estilo usa a colagem de um look mock; rotina — marque dias de
   trabalho/treino e veja o preview da semana mudar).
3. Cai em **Hoje** com um look real do modo mock, batendo
   clima+ocasião+estilo. Teste "Trocar look" e os botões "hoje eu
   vou..." (o look muda de acordo).
4. Navegue **Looks** (filtre por ocasião/clima, favorite um look),
   **Promos** (shell) e **Perfil** (edite rotina/estilo, veja a
   contagem do trial).
5. Em Perfil ou no card de instalação de Hoje, clique "Ativar
   notificações" (aceite a permissão do navegador) e depois "enviar
   teste" (ou `POST /api/push/teste` com a sessão logada) — a
   notificação abre `/hoje`. Instalar como PWA de verdade (ícone
   "Adicionar à Tela de Início") é o único jeito de testar no iOS.

Pra testar contra o catálogo de verdade em vez do mock: rode
`mixa-catalogo` (`npm run dev`, porta diferente da do app), configure
`CATALOGO_API_MODE=http`, `CATALOGO_API_URL=http://localhost:<porta>`,
`CATALOGO_API_TOKEN=<API_TOKEN de lá>` — só não espere ver looks até
que a plataforma interna tenha algum aprovado.
