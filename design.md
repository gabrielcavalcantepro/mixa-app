# Mixa — Direção Visual (design.md)

## Contexto e objetivo

Refinamento visual do app: sair de "funcional mas amador" pra "premium,
parece que já tem muitos usuários". A maior parte é só camada visual e
de interação — as exceções, com mudança real de modelo de dados, estão
marcadas explicitamente nas seções "Rotina" e "Hoje — guarda-roupa
diário".

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

A imagem de apoio preenche **100% da largura e 100% do espaço restante
da tela** abaixo do formulário — sem nenhuma faixa de fundo sobrando
antes do rodapé. Zero espaço vazio entre o fim da imagem e a borda da
tela.

**Autocomplete é busca de verdade, não eco do que foi digitado.** O
texto da usuária funciona como **filtro** contra uma lista real de
cidades brasileiras — digitar "For" tem que sugerir várias cidades
que começam com isso ("Formosa/MG", "Fortaleza/CE", etc.), não repetir
de volta o que ela já escreveu. Formato da sugestão: `Cidade/UF`.
Ordena com o casamento mais próximo do que foi digitado primeiro
(prefixo bate antes de ocorrência no meio do nome). A usuária **precisa
selecionar** uma sugestão da lista pra avançar — não aceita texto livre
sem seleção, pra nunca chegar cidade errada na API de clima depois.

Fonte de dado: API de localidades do IBGE
(`servicodados.ibge.gov.br/api/v1/localidades/municipios`) — gratuita,
sem chave, retorna todos os ~5.570 municípios do Brasil com nome e UF.
Busca isso uma vez (não em toda tecla digitada) e mantém localmente
pra filtrar rápido.

### Estilo

Cada opção de estilo usa uma imagem própria (retangular, vertical —
ver "Ativos de imagem" acima), não a colagem de peças do catálogo.
Layout em grade de 2 colunas (2 opções por linha), não 1 por linha.
Nenhum texto pode vazar pra fora do cartão — se o nome do estilo for
longo (ex.: "Descontraída/casual-chic"), o cartão acomoda a quebra de
linha sem estourar a borda nem desalinhar o cartão vizinho.

"Estilo dominante" e "Complementares (opcional, até 2)" são títulos de
seção — precisam ser visivelmente maiores/mais fortes que o corpo de
texto ao redor, não do mesmo peso. Isso ainda não foi aplicado na
rodada anterior, corrige de fato desta vez.

Cada um dos dois ganha um subtítulo curto explicando o conceito, já
que a usuária pode ser 100% leiga no assunto:
- Estilo dominante: "É o que mais te representa no dia a dia — a base
  da maioria dos looks sugeridos pra você."
- Complementares: "Toques de outros estilos que também combinam com
  você, usados com menos frequência que o dominante."

### Rotina

O padrão de adicionar item de rotina livremente (rótulo próprio +
categoria + dias da semana) está certo, mantém. O título do modal
"Novo item da rotina" precisa ter o mesmo peso visual dos outros
títulos do onboarding — hoje está pequeno demais, mesmo problema de
hierarquia da etapa de estilo.

**Categoria**: cada item pertence a **exatamente 1** categoria (das 5
que já existem: trabalho/lazer/casa/treino/evento) — não é seleção
múltipla. Várias categorias podem compartilhar itens diferentes (ex.:
"Crossfit" e "Musculação" os dois em Treino), mas um item nunca tem
mais de uma categoria.

**Emoji**: campo opcional na criação do item. Se a usuária pular, usa
um emoji padrão por categoria (💼 trabalho, 🏋️ treino, 🏠 casa, 🎉
evento, ☕ lazer) — nunca fica sem cara. Quem quiser personalizar,
troca livremente.

**Correção de modelo, não só de tela**: um dia pode pertencer a
**vários** itens ao mesmo tempo — trabalho, treino, escola do filho,
compromisso, tudo no mesmo dia, sem exclusão. Isso é como a vida real
funciona pra maioria das pessoas, e o app tratar isso como "escolha
só 1" está errado. Remove por completo a trava atual que impede
selecionar um dia já usado por outro item ("mover pra cá") — não deve
existir conflito nenhum a resolver, os dois convivem.

**Unificação do ajuste pontual**: o "hoje eu vou..." (ajuste manual
de um dia fora do padrão) deixa de ser um mecanismo à parte — vira o
mesmo fluxo de "adicionar item", só que com escolha de recorrência:
"toda [dia da semana]" (entra na rotina fixa) ou "só hoje" (vale uma
vez, some depois, ligado a uma data específica, não a um dia da
semana). Um compromisso avulso (dentista, por exemplo) usa a opção
"só hoje" e nunca vira rotina permanente.

"Só hoje" também cobre o caso inverso: esconder um item fixo só
naquele dia específico, sem apagar a recorrência dele (ex.: "hoje não
vou treinar" não cancela o treino de toda semana, só o de hoje).

Essa mudança de modelo vale igualmente pro editor de rotina que já
existe em Perfil (a "tira semanal tocável") — é a mesma fonte de dado
que o onboarding, não dá pra deixar um no modelo antigo enquanto o
outro usa o novo.

Isso toca o modelo de dados que a aba Hoje já usa (hoje é "dia → uma
ocasião"; passa a ser "dia → um ou mais itens, cada um com sua
categoria"), então antes de mudar o schema, mapeia tudo que lê esse
dado partindo do pressuposto antigo — principalmente o motor de
decisão do look do dia — e confirma o que precisa se adaptar antes de
implementar. Ver seção "Hoje — guarda-roupa diário" abaixo pra saber
exatamente o que o motor precisa passar a fazer.

## Hoje — guarda-roupa diário

A aba Hoje mostra **1 cartão de look por categoria distinta presente
no dia**, não 1 por item de rotina. Exemplo: numa segunda-feira com
os itens Crossfit (Treino), Musculação (Treino), Empresa (Trabalho),
Palestra (Trabalho) e Casa (Casa) — só existem 3 categorias diferentes
naquele dia, então aparecem **3 cartões**: um pra Treino, um pra
Trabalho, um pra Casa. Nunca 5.

Cada cartão mostra, junto do look, os nomes (+ emoji) de todos os
itens daquela categoria naquele dia — no exemplo, o cartão de Treino
mostra "Crossfit" e "Musculação" juntos, o de Trabalho mostra "Empresa"
e "Palestra" juntos.

**"Trocar look" prefere variante, não look aleatório.** Isso resolve
o problema de "não quero ir pra Musculação com a mesma roupa que usei
no Crossfit hoje de manhã": ao trocar, o motor busca primeiro uma
variante cadastrada do look atual (peça-chave trocada, mesmo look
"pai"); se não existir variante, cai pra outro look independente da
mesma categoria; se não existir nem isso, repete o mesmo look — isso
é limite de curadoria do catálogo (poucas variantes cadastradas pra
aquela ocasião ainda), não bug do app. Quanto mais variante existir no
catálogo por ocasião, mais rico isso fica sozinho, sem mexer em
código.

Dia sem nenhum item cai em "Casa" por padrão, como já é hoje.

**Tira semanal compacta** (usada no preview do onboarding e no editor
de Perfil): cada bloco de dia mostra os emojis das categorias
distintas daquele dia, lado a lado, pequenos — não texto, não
contagem sozinha. Se não couber tudo, corta com um "+N" discreto.

Pendência de conteúdo, não bloqueante: o texto da notificação push
("seu look do dia chegou", no singular) pode não fazer mais sentido
com vários cartões por dia — ajusta quando chegar nessa parte, não
precisa agora.



## Barra de navegação inferior

5 abas, nesta ordem: **Looks, Favoritos, Hoje, Promos, Perfil**. Hoje
fica no meio. O app sempre abre direto em Hoje, mesmo não sendo a
primeira aba da lista.

- Pílula flutuante, cantos arredondados, sombra suave — separada do
  conteúdo, não colada na borda da tela.
- O círculo elevado **não pertence a uma aba fixa** — ele representa
  a **aba ativa**, qualquer que seja, e desliza horizontalmente de
  forma animada toda vez que a usuária troca de aba (ex.: Hoje→Perfil
  desliza até a última posição). Ícone dentro do círculo troca junto
  pro ícone da aba correspondente.
- Corrige o alinhamento vertical: hoje o círculo sai um pouco pra cima
  da pílula, precisa se assentar dentro dela.
- Cores seguem o tema ativo: pílula e círculo trocam de papel entre
  claro/escuro, mesma lógica que já existe pros 2 tokens de marca.

## Cabeçalho por aba

Container invisível — sem fundo, sem borda, só espaçamento — no topo
de cada aba, acima do conteúdo. Contém 2 elementos: título/subtítulo
da aba (esquerda) e ícone de sino de notificação (direita, igual em
todas as abas, ver "Central de notificações" abaixo).

Texto de cada aba, formato "[Nome], [descrição curta]" em 2 linhas
(nome menor/discreto em cima, descrição em Fraunces itálico grande
embaixo — mesma hierarquia que título de seção já usa):

- Hoje: "Hoje / Seu guarda-roupa do dia"
- Looks: "Looks / Guarda-roupa"
- Favoritos: "Favoritos / Seus looks guardados"
- Promos: "Promos / Ofertas das parceiras"
- Perfil: "Perfil / Sua conta"

Troca de texto ao mudar de aba é animada (mesmo princípio de fade
usado em outras transições do app), nunca corte seco.

## Central de notificações

Acessada pelo sino do cabeçalho, igual em toda aba — é **uma só**
central, reunindo notificação de qualquer origem, não uma por aba.

Nesta rodada, só existe **1 tipo de notificação**: o convite pra
instalar o app e ativar notificações push, que hoje aparece fixo no
topo da aba Hoje. Ele sai de lá e vira a primeira entrada, já
existente, dessa central (aparece sozinha a partir do primeiro
acesso). Não inventa outro tipo de notificação agora — isso é
funcionalidade futura, fora de escopo desta rodada.

## Telas de conteúdo — redesign total, primeira vez de verdade

Diferente das seções anteriores, essa nunca foi de fato implementada
ainda — as rodadas passadas cobriram só tela de abertura e onboarding,
de propósito. Isso significa que Looks, Favoritos, Promos, Perfil e
detalhe de look ainda estão no visual original, sem nenhum tratamento
— não é regressão nem trabalho malfeito, é primeira passada mesmo.
Vale o mesmo nível de ousadia dado ao onboarding: **redesign de
verdade, ancorado nos prints 3 e 4 de referência, não ajuste
cosmético**.

O que extrair dos prints — princípio, não fotografia decorativa (as
imagens do app são as peças/looks reais):

- **Cartão de imagem edge-to-edge**: a foto preenche o cartão de
  ponta a ponta, cantos arredondados no cartão como um todo, sem
  borda/moldura em volta da imagem.
- **Favoritar sobreposto**: ícone de coração/favorito num círculo
  pequeno flutuando no canto superior da própria imagem (com contraste
  suficiente pra ler sobre qualquer foto), nunca numa barra separada
  abaixo.
- **Título de seção com "ver tudo"**: cabeçalho de bloco (ex.: nome da
  cápsula) em Fraunces itálico, com um link discreto "ver tudo" à
  direita quando a lista for maior que o preview.
- **Filtro em pílula**, preenchido quando ativo, contorno quando
  inativo.

### Looks

- **Feed em masonry (estilo Pinterest)**, não grade fixa — cada
  cartão tem altura conforme a quantidade de peça daquele look,
  eliminando os blocos cinza vazios que sobram na grade atual.
- **Filtros de ocasião e de clima**: os dois viram múltipla escolha
  dentro da própria linha (hoje só a combinação entre linhas
  funciona, dentro da mesma linha só permite 1) — uma usuária pode
  querer "Trabalho ou Evento" ao mesmo tempo.
- Organização por cápsula (mais recente em destaque) continua como já
  está definido desde o início do projeto — só ganha o tratamento de
  cartão novo.

### Detalhe de look

- Imagem/colagem em destaque no topo, tira de miniaturas das peças
  logo abaixo (já definido antes, mantém).
- Ação principal (favoritar, ver peça pra comprar) fixa na parte de
  baixo da tela, sempre visível, sem precisar rolar até o fim.

### Hoje e Favoritos

Usam o mesmo cartão que Looks — mesma imagem edge-to-edge, mesmo
favoritar sobreposto. Favoritos é essencialmente o feed de Looks
filtrado só pro que foi favoritado — mesma grade masonry, sem
componente novo. Os cartões de categoria de Hoje (1 por categoria
distinta do dia, já definido antes) recebem esse mesmo tratamento
visual, não ficam num padrão à parte.

### Promos

Sem dado de afiliado real ainda (continua fora de escopo) — aplica o
mesmo tratamento de cartão no que já existe hoje como estrutura,
sem inventar funcionalidade nova de promoção nesta rodada.

### Perfil

Reestrutura com hierarquia real de seção (título Fraunces itálico por
bloco: Conta, Assinatura, Aparência, Notificação, Rotina semanal,
Estilo) — hoje tudo tem o mesmo peso visual, sem distinção clara entre
bloco e bloco.

- **Nome**: campo novo, não existe hoje. Adiciona à criação de conta
  (a folha de "Criar conta") e ao perfil da usuária no banco. Perfil
  passa a mostrar o nome como título principal, e-mail vira informação
  secundária abaixo (menor, sem ser o destaque).
- **Estilo**: a lista de rádio com texto puro sai. Vira um botão que
  abre um modal reaproveitando o mesmo componente visual do passo de
  estilo no onboarding (cartão com imagem por estilo) — a usuária
  reconhece pela imagem, não precisa lembrar o nome do estilo escolhido.
- **Botão "Salvar" do horário de notificação**: está com comportamento
  estranho (usuária relatou como "bugado", sem mais detalhe ainda) —
  CONVENÇÃO "INVESTIGAR ANTES DE ALTERAR" se aplica aqui, é correção
  de algo que já existe, não criação.

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

Sem mudança de stack. A mudança de modelo de dados e do motor de
decisão está limitada ao que está descrito nas seções "Rotina" e
"Hoje — guarda-roupa diário" acima — nada além disso (catálogo, look,
peça, cápsula continuam intocados). Conteúdo real dos textos do
carrossel de abertura fica pendente — lorem ipsum por enquanto.
