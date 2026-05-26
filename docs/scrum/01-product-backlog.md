# Product Backlog — Tank Battle

> **Legenda de Prioridade:** 🔴 Alta | 🟡 Média | 🟢 Baixa  
> **Story Points (SP):** estimados em Fibonacci (1, 2, 3, 5, 8, 13)

---

## Épicos

| ID | Épico |
|---|---|
| E1 | Autenticação e criação de sala |
| E2 | Mecânica de jogo (turnos, tiros, movimento) |
| E3 | Sincronização em tempo real |
| E4 | Sistema de habilidades |
| E5 | Componentes físicos do jogo |
| E6 | Qualidade, polish e documentação |

---

## User Stories

| ID | Épico | Como... | Quero... | Para... | Prioridade | SP | Sprint |
|---|---|---|---|---|---|---|---|
| US01 | E1 | jogador | criar uma sala e receber um código único | compartilhar com meus amigos e começar a partida | 🔴 Alta | 5 | 1 |
| US02 | E1 | jogador | entrar em uma sala existente pelo código | me juntar a uma partida criada por outro jogador | 🔴 Alta | 3 | 1 |
| US03 | E1 | jogador | escolher minha cor antes de entrar/criar sala | ter minha identidade no jogo | 🔴 Alta | 2 | 1 |
| US04 | E1 | jogador | ver uma sala de espera (lobby) com os jogadores conectados | saber quem está na partida antes de começar | 🟡 Média | 3 | 1 |
| US05 | E2 | jogador | ver o tabuleiro digital da minha zona (4×4) | saber a posição do meu tanque e células já atingidas | 🔴 Alta | 5 | 1 |
| US06 | E2 | jogador | disparar em uma coordenada (ex: C3) no meu turno | tentar acertar o tanque de um inimigo | 🔴 Alta | 8 | 1 |
| US07 | E2 | jogador | ver um timer regressivo de 90 segundos no meu turno | saber quanto tempo me resta para agir | 🟡 Média | 3 | 1 |
| US08 | E2 | jogador | mover meu tanque dentro da minha zona após atirar | reposicionar minha peça para a próxima rodada | 🔴 Alta | 5 | 1 |
| US09 | E3 | jogador | ser notificado quando sou atingido (apenas no meu celular) | saber que perdi vida sem que os outros vejam | 🔴 Alta | 5 | 2 |
| US10 | E3 | jogador | ver o estado do jogo sincronizado em tempo real | acompanhar a partida sem precisar recarregar o app | 🔴 Alta | 8 | 2 |
| US11 | E2 | jogador | ver uma tela de espera quando não é minha vez | acompanhar quem está jogando e ver minha zona | 🟡 Média | 5 | 2 |
| US12 | E2 | jogador | ver a tela de fim de partida com ranking e estatísticas | saber quem ganhou e como me saí na partida | 🟡 Média | 5 | 2 |
| US13 | E2 | jogador | confirmar meu disparo antes de executar | evitar erros de digitação na coordenada | 🟡 Média | 2 | 2 |
| US14 | E2 | host | iniciar a partida quando houver pelo menos 2 jogadores | começar o jogo no momento certo | 🔴 Alta | 3 | 2 |
| US15 | E4 | jogador | escanear um QR code de uma carta física para ativar uma habilidade | usar poderes especiais durante a partida | 🔴 Alta | 13 | 3 |
| US16 | E4 | jogador | usar a habilidade **Reparo** para recuperar 1 vida | sobreviver mais tempo na partida | 🔴 Alta | 3 | 3 |
| US17 | E4 | jogador | usar a habilidade **Escudo** para absorver o próximo tiro | me proteger de um inimigo | 🔴 Alta | 3 | 3 |
| US18 | E4 | jogador | usar a habilidade **Tiro Duplo** para disparar duas coordenadas no mesmo turno | aumentar minhas chances de acerto | 🟡 Média | 5 | 3 |
| US19 | E4 | jogador | usar a habilidade **Salto** para mover para qualquer célula da zona | fugir de uma posição previsível | 🟡 Média | 3 | 3 |
| US20 | E4 | jogador | usar a habilidade **Tiro Silencioso** para ocultar meu tanque no passo de posicionamento | blefar minha posição real | 🟡 Média | 5 | 3 |
| US21 | E4 | jogador | usar a habilidade **Espionagem** para ver as vidas de todos os jogadores agora | tomar decisões estratégicas com informação extra | 🟡 Média | 3 | 3 |
| US22 | E4 | jogador | usar a habilidade **Reconstruir** para remover o último alvo da minha zona | limpar uma célula atingida da minha área | 🟢 Baixa | 3 | 3 |
| US23 | E5 | jogador | ter um tabuleiro físico impresso com as 4 zonas coloridas | jogar com componentes físicos reais sobre a mesa | 🔴 Alta | 8 | 4 |
| US24 | E5 | jogador | ter cartas físicas com QR codes para cada habilidade | ativar habilidades de forma física e tangível | 🔴 Alta | 5 | 4 |
| US25 | E5 | jogador | ter peças/tokens para representar os tanques no tabuleiro | mover fisicamente minha peça durante o jogo | 🟡 Média | 3 | 4 |
| US26 | E6 | jogador | usar o app no celular com interface mobile-first | ter uma boa experiência de uso na tela pequena | 🟡 Média | 5 | 5 |
| US27 | E6 | grupo | validar o jogo com uma sessão de playtesting externa | identificar problemas de usabilidade e regras | 🟡 Média | 3 | 5 |
| US28 | E6 | grupo | ter documentação completa do projeto (Scrum + README) | apresentar o trabalho de forma organizada | 🟡 Média | 5 | 5 |
| US29 | E6 | jogador | reconectar automaticamente à partida ao reabrir o app | não perder meu progresso se o celular fechar | 🟢 Baixa | 5 | 5 |

---

## Velocidade do Time

| Sprint | SP Planejados | SP Entregues |
|---|---|---|
| Sprint 1 | 34 | 29 |
| Sprint 2 | 23 | 23 |
| Sprint 3 | 35 | 🔄 em andamento |
| Sprint 4 | 16 | ⏳ não iniciada |
| Sprint 5 | 18 | ⏳ não iniciada |
| **Total** | **126** | **52 até agora** |
