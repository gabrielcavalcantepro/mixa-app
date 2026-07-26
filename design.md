# Mixa — Direção Visual (design.md)

## Contexto e objetivo

Refinamento visual do app: sair de "funcional mas amador" pra "premium,
parece que já tem muitos usuários". Não muda modelo de dados nem a
lógica do motor de decisão — só a camada visual e de interação.

Cores e tipografia são fixas, não fazem parte desta discussão:
- Preto `#1C1B19` / Osso `#F1ECE1` — únicas cores, papéis invertidos
  entre tema claro/escuro (já implementado via `next-themes`).
- Fraunces itálico pra headlines/logo, General Sans (Inter como
  placeholder até os arquivos reais chegarem) pro resto.

Este documento descreve **padrão a seguir** (espaçamento, hierarquia,
movimento, tratamento de imagem) — não pede pra copiar layout
específico de nenhum app de referência. Onde cita referência, é só
pra ilustrar o princípio por trás.

**Isto é redesign total das telas listadas, não ajuste incremental.**
Tome liberdade criativa pra melhorar coisas que não foram pedidas
explicitamente aqui, se isso deixar a tela mais bonita e com mais cara
de app premium — o único limite é não ignorar o que está pedido de
forma explícita.

## Ativos de imagem (fora do catálogo)

Duas necessidades de imagem nesta rodada não vêm da API do catálogo —
são ativo estático do próprio app, como os arquivos de logo já
entregues:
- 4 imagens do carrossel de abertura.
- 1 imagem por perfil de estilo (retangular, vertical), pro passo de
  estilo do onboarding — **não** reaproveita colagem de look do
  catálogo pra isso.

Enquanto os arquivos reais não chegam, mantém o placeholder cinza com
texto indicando a posição (já existe, funciona bem) — documenta no
CLAUDE.md o caminho e o nome exato de arquivo esperado por posição/
estilo, pra eu só soltar o arquivo no lugar certo quando estiver
pronto.

## Novo fluxo de abertura (antes do login)

Tela nova, primeira coisa que a usuária vê ao abrir o app, antes de
qualquer autenticação:

- Carrossel em loop infinito de até 4 imagens em tela cheia (depois
  da 4ª, volta pra 1ª).
- Cada imagem é um "story": título + subtítulo fixos na tela (terço
  inferior, sobre gradiente escuro sutil nascendo de baixo pra cima,
  só o necessário pra legibilidade). Usa lorem ipsum como texto por
  enquanto — conteúdo real vem depois.
- Barrinhas de progresso no topo, segmentadas (uma por imagem), estilo
  Stories — indicam qual está ativa e quando vai trocar.
- Transição entre imagens: esmaecimento (fade), nunca corte seco.
- Enquanto uma imagem está visível: zoom lento e contínuo o tempo
  todo que ela aparece (não só no momento da troca) — efeito tipo
  Ken Burns/Netflix.
- No topo desse bloco de baixo, antes do título: logotipo horizontal
  da Mixa. Depois vem título + subtítulo, e por último, na base da
  tela, 2 botões lado a lado — "Entrar" (menor destaque, ex.: contorno)
  e "Criar conta" (destaque forte, preenchido).
- Tocar em qualquer um dos dois: abre uma folha (bottom sheet)
  animada subindo de baixo pra cima, cobrindo só parte da tela (não
  tela cheia) — dentro dela mora o formulário de entrar ou criar
  conta.

**Importante**: isso não substitui o passo de criar conta (e-mail/
senha) que já existe no onboarding — só troca a forma visual de
apresentar esse mesmo passo. A sequência funcional continua: conta →
cidade → estilo → rotina.

## Onboarding (cidade/estilo/rotina) — 3 passos, não 4

Conta (e-mail/senha) não conta mais como passo do onboarding — ela
acontece na folha da tela de abertura (ver seção acima) e não aparece
na paginação abaixo. O onboarding em si tem só 3 telas.

**Paginação, substituindo por completo o que existe hoje**: nada de
logo, nada de barrinha estilo Stories, nada de contador em texto
("1/4", "2/4"...) nessas 3 telas — isso já existe na tela de abertura,
repetir aqui é redundante. No lugar: 3 pontinhos centralizados no
topo, sem número, sem rótulo — o ponto ativo estica em formato de
pílula (referência: paginação de carrossel de site, ponto ativo mais
alongado que os inativos), os inativos continuam como círculo simples.

Os 3 passos compartilham o mesmo padrão visual de base (transição
animada ao avançar, elementos entrando de forma escalonada ao montar
a tela — mesma lógica que já existe na revelação da colagem de look).
O passo de estilo é o mais elaborado dentro desse padrão, não um
template diferente dos outros 2.

**Hierarquia de texto — vale pras 3 telas**: pergunta/título de cada
passo precisa ter contraste e peso visual claros, se destacando de
verdade do resto do conteúdo — isso está fraco hoje em mais de um
passo, corrige de forma geral, não só onde foi citado abaixo.

### Cidade

A imagem de apoio preenche a largura inteira da tela e cerca de
metade da altura, encostada nas bordas — não um cartão menor com
respiro ao redor. Ela ocupa o espaço que hoje fica em branco embaixo
do formulário.

O campo de cidade precisa de sugestão conforme a usuária digita (ex.:
digitar "Fort" já sugere "Fortaleza/CE"), e ela **precisa selecionar**
uma das sugestões pra avançar — não aceita texto livre sem seleção.
Evita erro de digitação chegando na API de clima depois.

### Estilo

Cada opção de estilo usa uma imagem própria (retangular, vertical —
ver "Ativos de imagem" acima), não a colagem de peças do catálogo.
Layout em grade de 2 colunas (2 opções por linha), não 1 por linha.

### Rotina

Troca os 2 toggles fixos ("Trabalha fora de casa?" / "Treina?") por
um padrão de adicionar item de rotina livremente: a usuária cria
quantos itens quiser (rótulo dela — trabalho, treino, igreja,
encontro com amigas, o que for — e os dias da semana daquele item).
O resumo da semana se monta a partir do que ela adicionou, não de 2
categorias fixas.

Por trás, cada item continua mapeando pra uma das 5 ocasiões que já
existem no sistema (trabalho/lazer/casa/treino/evento) — não muda o
schema de `rotina_dia`, só a forma de entrada. Se dois itens
disputarem o mesmo dia, isso precisa ficar visível e resolvido na
tela pra usuária — nunca um sobrescrevendo o outro em silêncio, do
jeito que acontece hoje.

## Barra de navegação inferior

- Pílula flutuante, cantos arredondados, sombra suave — separada do
  conteúdo, não colada na borda da tela.
- Ícone da aba **Hoje** fica num círculo elevado, sólido, no centro da
  barra, se destacando das outras 3 (Looks, Promos, Perfil), que ficam
  no nível da pílula, só ícone + rótulo.
- Cores seguem o tema ativo: pílula e círculo central trocam de papel
  entre claro/escuro, mesma lógica que já existe pros 2 tokens de
  marca.

## Telas de conteúdo (Hoje, Looks, detalhe de look)

Princípios a extrair — não cor, não fonte, isso já está fixo:

- **A imagem é o conteúdo, não decoração.** As fotos nos cartões e
  telas de detalhe são as peças/looks de verdade (a colagem já
  existente) — o objetivo é dar mais espaço e presença a essa imagem,
  não adicionar fotografia de estoque nova.
- **Tipografia grande e confiante pra título de seção** — Fraunces
  itálico assume esse papel (nome do look do dia, cabeçalho de cada
  aba).
- **Filtros e ações em formato pílula** (chips de ocasião, botão
  principal).
- **Cartão de look/peça**: imagem em destaque, ícone de favoritar
  sobreposto no canto da imagem, não numa barra separada.
- **Tela de detalhe de look**: ação principal (favoritar, comprar
  peça) fixa na parte de baixo da tela, sempre visível.
- **Tira de miniaturas**: aplica esse padrão de carrossel/tira
  horizontal de imagens pequenas às peças que compõem um look,
  reforçando visualmente a colagem que já existe, com apresentação
  mais refinada.

## Movimento — o que já existe continua, o que é novo se soma

**Já implementado, não mexer**: troca de aba (fade + leve
deslocamento), colagem revelando em sequência por peça, microinteração
de favoritar, UI otimista no "hoje eu vou..."/trocar look/favoritar/
editar rotina.

**Novo, específico das telas descritas acima**:
- Crossfade + zoom contínuo no carrossel de abertura.
- Transição animada entre passos do onboarding + entrada escalonada
  de elemento dentro de cada passo.
- Folha de login/criar conta: entrada deslizando de baixo com alguma
  sensação de mola/física leve (não linear seco), saída no mesmo
  estilo invertido.

## Fora de escopo nesta passada

Sem mudança de modelo de dados, sem mudança na lógica do motor de
decisão, sem mudança de stack. Conteúdo real dos textos do carrossel
de abertura fica pendente — lorem ipsum por enquanto.
