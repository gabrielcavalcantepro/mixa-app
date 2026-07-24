# Mixa — App (Spec)

## Contexto

Mixa entrega, todo dia, um look pronto pra usuária (mãe, público-alvo),
montado a partir de um guarda-roupa cápsula controlado pela marca — ela
nunca escolhe roupa sozinha, o app sempre entrega o look pronto. Essa
spec é do **app final**, projeto separado da plataforma de catálogo
(`mixa-catalogo`, já construída). Não compartilha código nem pasta com
o catálogo — só dados, via API.

## Escopo desta fase

Web app (não vai pra App Store / Play Store por enquanto), instalável
como PWA. Cobre: onboarding, as 4 abas (Hoje, Looks, Promos, Perfil),
autenticação da usuária, motor de decisão do look do dia, e a estrutura
de período de teste — com dois pontos propositalmente deixados
incompletos nesta fase (ver "Fora de escopo").

## Como o app se conecta ao catálogo

O catálogo expõe uma API só de leitura pro app consumir — nunca banco
compartilhado. Autenticação simples de serviço (token), não é
voltada pro navegador da usuária. Só endpoints necessários:

- Looks **aprovados** (nunca candidatos pendentes/reprovados da fila de
  sugestão) — com peças por slot, imagens, ocasião(ões), perfil(is) de
  estilo, clima derivado, cápsula, e se é variante de outro look.
- Peças — pra montar a colagem e o link de compra de cada peça no
  look.
- Perfis de estilo — lista + descrição, usados no onboarding.

O app nunca escreve no catálogo. A curadoria continua sendo
responsabilidade exclusiva da plataforma interna.

## Onboarding

4 passos, cada um alimenta diretamente o motor de decisão — nenhum
passo decorativo:

1. **Conta** — e-mail e senha. Login social (Google) fica pra depois,
   não entra nesta fase.
2. **Cidade** — usada pra buscar o clima do dia.
3. **Perfil de estilo** — quiz visual dos 7 estilos universais (mostra
   referência visual de cada um). Escolhe 1 estilo **dominante**
   (obrigatório) + até 2 **complementares** (opcional).
4. **Rotina semanal** — perguntas simples pra montar um mapa
   dia-da-semana → ocasião padrão: trabalha fora de casa? quantos dias?
   treina? em quais dias? Esse mapa é editável depois no Perfil.

Propositalmente fora do onboarding: tamanho/caimento (não alimenta
nada do motor — ela escolhe tamanho na loja, na hora de comprar) e
"tem filhos" (redundante — toda a base de usuárias já é mãe, é a
premissa do produto). Horário da notificação tem um padrão (ex.: 7h),
editável no Perfil, não é perguntado no onboarding.

## As 4 abas

### Hoje
- Look do dia, pronto ao abrir o app — escolhido pelo motor de decisão
  (ver seção própria).
- Botão "trocar look" — outra opção dentro do mesmo filtro (clima +
  ocasião + estilo).
- Ajuste manual rápido pra dias fora da rotina padrão: "hoje eu
  vou..." com opções trabalho / treino / passeio / evento — sobrescreve
  a ocasião só daquele dia, sem alterar o mapa de rotina salvo.
- Notificação push matinal com o look do dia, no horário escolhido
  pela usuária. A notificação em si é simples (não carrega o look) —
  só precisa abrir o app direto na aba Hoje ao ser tocada.

### Looks
- Guarda-roupa navegável, organizado por cápsula (mais recente em
  destaque) e filtrável por ocasião.
- Cada look mostra as peças em colagem, na mesma ordem corporal
  definida no catálogo, com link de compra em cada peça (ver "Fora de
  escopo" sobre afiliados).
- Favoritar look, pra usar de novo depois.
- Filtro por clima.

### Promos
- Feed de promoções de peças de lojas parceiras, com link de afiliado.
- Chamada pro Grupo VIP de Promoções no WhatsApp (bônus da assinatura,
  recorrente — vale enquanto a assinatura estiver ativa).
- Esta aba depende inteiramente de infraestrutura de afiliados que
  ainda não existe (ver "Fora de escopo") — construir o shell da tela
  agora, sem fonte de dado real ainda.

### Perfil
- Rotina cadastrada no onboarding, editável a qualquer momento (muda
  os looks sugeridos).
- Estilo dominante/complementares, editável.
- Gerenciamento de assinatura: plano atual, status do período de
  teste. Cancelamento e mudança de plano dependem do pagamento (ver
  "Fora de escopo").
- Preferência de horário da notificação do look do dia.
- **Não existe** tela de "peças que já tenho" — a usuária nunca
  cadastra peça própria nesta versão do produto, nem aqui nem em
  nenhuma outra aba.

## Motor de decisão do look do dia

Motor de regras — cruza três sinais contra as tags dos looks aprovados
vindos do catálogo:

- Clima do dia (API de clima, a partir da cidade cadastrada).
- Ocasião do dia (rotina padrão daquele dia da semana, ou o ajuste
  manual "hoje eu vou...", quando presente).
- Estilo da usuária (dominante + complementares).

Sem IA/LLM generativa envolvida. Evita repetir um look mostrado
recentemente pra mesma usuária — precisa de algum registro de
histórico de exibição pra isso funcionar. "Trocar look" pede outra
opção dentro do mesmo filtro, excluindo o que já foi mostrado na
mesma sessão.

## Clima

API: **OpenWeatherMap**, camada gratuita — permite uso comercial (ao
contrário do Open-Meteo, que é só pra uso não-comercial), já inclui
geocodificação (transforma o nome da cidade em coordenada), e a cota
gratuita (60 chamadas/min, 1M/mês) tem folga de sobra pro volume atual.
Cachear o resultado por cidade/dia — não precisa bater na API a cada
abertura do app.

## Assinatura e período de teste

Modelo é **trial**, não freemium: acesso completo por 7 dias, depois
bloqueia até assinar — não existe camada gratuita permanente com
funcionalidade limitada.

Nesta fase: constrói a experiência completa e a contagem regressiva do
período de teste, mas **sem o bloqueio de fato** — isso depende de um
processador de pagamento que ainda não foi escolhido (Pix/boleto
importa pro público, decisão adiada). Deixa a tela de "assine pra
continuar" como placeholder, sem checkout funcional.

## Identidade visual

- Cores: preto `#1C1B19` e osso `#F1ECE1`.
- Tipografia: Fraunces itálico (headlines/logo), General Sans (corpo).
  General Sans ainda não foi entregue — mesma solução do catálogo:
  Inter como placeholder na mesma variável de fonte, até os arquivos
  chegarem.
- Logo: os 6 arquivos (ícone e logotipo, preto/branco, variações
  vertical/horizontal) já existem e devem ser usados diretamente —
  ficam disponíveis pra reaproveitar no manifest do PWA (ícone de
  instalação) e na interface.
- Posicionamento: elegante, minimalista, editorial — nunca "fofinho"
  ou infantil, mesmo sendo produto pra mães.

## Notificação e instalação (PWA)

App precisa ser instalável (manifest + service worker) pra push
funcionar de verdade, principalmente no iOS, que só permite push em
PWA instalada na tela de início (Safari sozinho não permite). Depois
da assinatura confirmada, mostra um tutorial guiando a instalação.
Quem não instalar simplesmente não recebe a notificação — não é
bloqueante, é uma perda de alcance aceita nesta fase. Fallback (ex.:
aviso por e-mail pra quem não instalou) fica anotado, não é desta
fase.

## Princípios de arquitetura (iguais aos do catálogo)

- Fatia vertical por tela: cada aba principal (Hoje, Looks, Promos,
  Perfil, onboarding, auth) vive na própria pasta pequena e
  autocontida. Só entra em pasta compartilhada o que é genuinamente
  compartilhado (schema/cliente da API do catálogo, UI genérica,
  auth da usuária).
- Delegar, não ditar: prompts explicam o quê e o porquê, nunca a
  implementação linha a linha. Stack e estrutura de pastas são do
  Claude Code, com justificativa — inclusive se vale a pena manter
  consistência de stack com o projeto do catálogo ou não.
- Criação de funcionalidade nova sempre passa por plan mode.
- Alteração/correção de algo existente segue a convenção "investigar
  antes de alterar": declara hipótese, investiga, só corrige se
  confirmado.
- CLAUDE.md é a memória entre sessões deste projeto.
- Toda entrega vem com forma de verificar, rodando local.

## Fora de escopo nesta fase — propositalmente incompleto

- **Pagamento real**: sem processador escolhido. Trial UI existe,
  cobrança e bloqueio de fato não.
- **Afiliados reais**: links de compra nas peças e feed da aba Promos
  ficam sem fonte de dado real — construir o shell, não a integração.
- **App nativo** / lojas de app.
- **Login social** (Google) — vem depois do e-mail/senha.
- **Fallback de notificação por e-mail** pra quem não instala o PWA.
- **Cadastro de peça própria pela usuária** — nunca, em nenhuma fase.

## Definição de pronto (fase 1)

Uma usuária consegue, pelo app web:

1. Criar conta e completar o onboarding (cidade, estilo, rotina).
2. Ver o look do dia na aba Hoje, batendo com clima + ocasião + estilo
   dela, e trocar por outra opção.
3. Fazer o ajuste "hoje eu vou..." e ver o look do dia mudar de acordo.
4. Navegar a aba Looks, filtrar por ocasião e cápsula, favoritar um
   look.
5. Ver a aba Promos e Perfil como telas completas na interface, mesmo
   sem dado real de afiliado/pagamento ainda.
6. Ver a contagem regressiva do período de teste no Perfil.
7. Instalar o app como PWA e receber uma notificação de teste que abre
   direto na aba Hoje.
