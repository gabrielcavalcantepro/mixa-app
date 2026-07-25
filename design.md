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
- Abaixo do texto, na parte de baixo da tela: logotipo horizontal da
  Mixa.
- Abaixo do logo: 2 botões lado a lado — "Entrar" (menor destaque,
  ex.: contorno) e "Criar conta" (destaque forte, preenchido).
- Tocar em qualquer um dos dois: abre uma folha (bottom sheet)
  animada subindo de baixo pra cima, cobrindo só parte da tela (não
  tela cheia) — dentro dela mora o formulário de entrar ou criar
  conta.

**Importante**: isso não substitui o passo de criar conta (e-mail/
senha) que já existe no onboarding — só troca a forma visual de
apresentar esse mesmo passo. A sequência funcional continua: conta →
cidade → estilo → rotina.

## Onboarding (conta/cidade/estilo/rotina) — template único

Os 4 passos compartilham o mesmo padrão visual. O passo de estilo é
o mais elaborado dentro desse padrão (mais cartões, mais escolha
visual) — não um template totalmente diferente dos outros 3.

- Sensação de quiz: passos curtos, avançar tem transição animada, não
  corte seco.
- Elementos de cada passo entram com animação própria ao montar a
  tela (escalonado, não tudo de uma vez) — mesma lógica que já existe
  na revelação da colagem de look, aplicada aqui.
- Onde fizer sentido: tela dividida, com imagem ocupando a parte de
  baixo (mesmo princípio do carrossel de abertura, sem precisar ser o
  carrossel em si).
- Passo de estilo: continua usando a colagem de peças reais como
  referência visual de cada estilo — dentro do template novo, com
  mais espaço/hierarquia por ser o momento mais rico do onboarding.

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
