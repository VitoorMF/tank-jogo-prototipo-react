# Sprint 1 — MVP Funcional

**Período:** Semana 1 – Semana 2  
**Sprint Goal:** Ter o jogo rodando com criação de sala, entrada, turnos e tiros funcionando — ainda que com bugs.

---

## Sprint Planning

### Quem fez o quê

| Tarefa | Responsável | SP | Status |
|---|---|---|---|
| Configurar projeto Vite + React | Pedro Soares | 1 | ✅ |
| Configurar Supabase (tabela `rooms`, Realtime) | Vitor M Freire | 3 | ✅ |
| Tela Home (input de nome, botões criar/entrar) | Vitor Luiz | 2 | ✅ |
| Tela Criar Sala (seletor de cor, botão criar) | Pedro Becker | 2 | ✅ |
| Tela Entrar na Sala (código de sala) | Pedro Soares | 2 | ✅ |
| Tela Lobby (lista de jogadores, botão iniciar) | Vitor M Freire | 3 | ✅ |
| Hook `useTankBattle` — estrutura base e estado | Vitor M Freire | 5 | ✅ |
| Lógica de criação e entrada em sala (Supabase) | Pedro Soares | 3 | ✅ |
| Tela de Jogo — passo 1 (inputs coordenada) | Pedro Becker | 3 | ✅ |
| Tela de Jogo — passo 4 (grid de movimento) | Vitor Luiz | 5 | ✅ |
| Lógica de tiro e verificação de acerto | Vitor M Freire | 5 | ✅ |
| Timer regressivo de 90s | Pedro Soares | 3 | ✅ |
| Identidade visual base (CSS, paleta, fontes) | João Pedro | 5 | ✅ |
| Levantamento de requisitos e user stories | Pedro Henrique | 2 | ✅ |

**Total planejado:** 44 SP | **Total entregue:** 29 SP *(US07 e parte do grid entregues com bugs)*

---

## Histórias desta Sprint

| ID | User Story | SP | Status |
|---|---|---|---|
| US01 | Criar sala e receber código | 5 | ✅ |
| US02 | Entrar em sala pelo código | 3 | ✅ |
| US03 | Escolher cor | 2 | ✅ |
| US04 | Lobby de espera | 3 | ✅ |
| US05 | Ver tabuleiro digital da zona | 5 | ✅ |
| US06 | Disparar em coordenada | 8 | ⚠️ Com bugs |
| US07 | Timer de 90s | 3 | ⚠️ Com bugs |
| US08 | Mover tanque na zona | 5 | ⚠️ Com bugs |

---

## Sprint Review

### O que foi entregue
- App com fluxo completo: Home → Criar/Entrar → Lobby → Jogo
- Sala criada e salva no Supabase com código único
- Múltiplos jogadores conseguem entrar na mesma sala
- Tiro funciona: jogador digita coordenada, app calcula se acertou
- Tabuleiro digital da zona renderizando corretamente
- Design base (paleta militar/arcade retrô) aplicado em todas as telas

### O que ficou de fora / com bugs
- Sincronização via Realtime apresentava desconexões esporádicas
- Timer não pausava corretamente ao avançar o turno
- Movimento do tanque permitia células fora da zona em alguns casos
- Coordenadas ainda usavam sistema local por zona em vez de global (8×8)

---

## Sprint Retrospective

### ✅ O que foi bem
- Conseguimos integrar o Supabase Realtime do zero, sem experiência prévia
- Comunicação do time foi boa nas primeiras semanas
- João Pedro entregou a identidade visual completa rapidamente, o que motivou o time

### ❌ O que foi mal
- Subestimamos a complexidade da lógica de turno com múltiplos jogadores
- Bugs de sincronização só apareceram durante o teste com todos conectados ao mesmo tempo
- Falta de testes antes de marcar tarefas como concluídas

### 🔄 O que melhorar
- Fazer testes manuais com todos os membros antes de fechar a sprint
- Definir critérios claros de "pronto" para cada tarefa antes de começar
- Comunicar bloqueios mais cedo para não acumular dívida técnica
