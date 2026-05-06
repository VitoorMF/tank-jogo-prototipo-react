# Tank Battle — Documento do Jogo

## Conceito

Tank Battle é um jogo de tabuleiro híbrido para 2 a 4 jogadores. Existe um **tabuleiro físico** (8×8) e um **app companion** (React, mobile-first) que funciona como árbitro digital: controla os turnos, registra os tiros e sincroniza o estado entre os jogadores em tempo real via Supabase.

O jogo mistura informação pública (tabuleiro físico, posição das peças que todos veem) com informação privada (vidas, posição exata do seu tanque no celular, se você foi atingido). Isso cria espaço para blefe e estratégia.

---

## Tabuleiro

- Grade **8×8**, dividida em 4 zonas de 4×4 (uma por cor)
- Cada jogador só pode mover seu tanque dentro da sua própria zona
- Coordenadas globais: colunas A–H, linhas 1–8

| Cor     | Zona         | Spawn inicial       |
|---------|--------------|---------------------|
| Amarelo | A1–D4        | Aleatório na zona   |
| Vermelho| A5–D8        | Aleatório na zona   |
| Azul    | E1–H4        | Aleatório na zona   |
| Verde   | E5–H8        | Aleatório na zona   |

---

## Regras

- Cada jogador começa com **3 vidas**
- Turnos em ordem de cor (amarelo → vermelho → azul → verde → repete)
- Timer de **90 segundos** por turno
- Tiro acerta quando a coordenada digitada coincide com a posição atual do tanque inimigo no tabuleiro físico
- Perder todas as vidas = eliminação
- Último sobrevivente vence
- **Vidas dos jogadores só ficam visíveis no app após o fim de cada rodada** (para evitar que todos atirem no mesmo jogador ferido)

---

## Fluxo de um turno (4 passos)

```
PASSO 1 — COORDENADA
  Jogador digita a coordenada do tiro (ex: C3)

PASSO 2 — CONFIRMAR
  Overlay de confirmação com a coordenada escolhida
  → DISPARAR ou CANCELAR

PASSO 3 — POSICIONAR NO TABULEIRO FÍSICO
  App mostra:
    · Seu tanque: [cor] [coordenada atual]
    · Alvo do tiro: [coordenada do disparo]
  Jogador posiciona as peças físicas e verifica se houve acerto

PASSO 4 — MOVER
  Jogador toca no grid digital para mover seu tanque
  (células adjacentes dentro da zona, marcadas em verde)
  Opção: FICAR AQUI (sem mover)
  → FINALIZAR TURNO
```

---

## Screens

### 1. Home
Tela inicial do app.
- Logo "TANK BATTLE / HYBRID BOARD GAME"
- Input de nome do jogador (máx 16 chars, salvo em localStorage)
- Botões: **CRIAR SALA** / **ENTRAR NA SALA** (desabilitados até ter nome)

---

### 2. Criar Sala
- Seletor de cor: 4 botões coloridos (Amarelo, Vermelho, Azul, Verde)
- Cores já ocupadas aparecem desabilitadas
- Botão **CRIAR SALA**

---

### 3. Entrar na Sala
- Seletor de cor (mesmo da tela de criar)
- Input de código da sala (ex: ABC123)
- Botão **ENTRAR**

---

### 4. Lobby
Sala de espera antes da partida começar.
- Código da sala em destaque (para compartilhar)
- Lista de 4 slots de cor com status: **VOCÊ / CONECTADO / AGUARDANDO**
- Mostra o nome do jogador de cada slot
- Contador de jogadores prontos (ex: 2/4)
- Botão **INICIAR PARTIDA** (visível só pro host, quando ≥2 jogadores)
- Botão **SAIR DA SALA**

---

### 5. Jogo (turno ativo)
Tela que aparece quando é **a vez do jogador**.

**HUD (topo):**
- Nome e cor do jogador (esquerda)
- Timer regressivo 90s com barra de progresso (centro)
  - Fica vermelho e pulsa nos últimos 10s
- Número da rodada (abaixo do nome)

**Barra de passos:** `1 COORD. · 2 ATIRAR · 3 POSIC. · 4 MOVER`
- Passo ativo em laranja, passos concluídos em verde

**Conteúdo por passo:**
- **Passo 1:** Dois inputs grandes para coluna (A–H) e linha (1–8) + botão CONFIRMAR COORDENADA
- **Passo 2:** Overlay de confirmação (ver Overlays)
- **Passo 3:** Painel com posição do tanque e coordenada do tiro lado a lado + botão POSICIONEI - MOVER
- **Passo 4:** Grid da zona do jogador em modo de movimento (células movíveis em verde) + botão FICAR AQUI (antes de mover) ou FINALIZAR TURNO (depois de mover)

**Grid da zona:** exibe a zona 4×4 do jogador com:
- Posição atual do tanque (🪖)
- Células já atingidas (◎ escuro)
- Células movíveis (fundo verde, borda verde)

**Badge de turno:** faixa colorida com "⚔️ SUA VEZ"

**Botão SAIR DA PARTIDA** (discreto, no rodapé)

---

### 6. Espera (turno de outro jogador)
Tela que aparece quando **não é a vez do jogador**.

- Ícone ⏳ pulsante
- Nome do jogador da vez em destaque (cor correspondente)
- Número da rodada
- **Painel de status de todos os jogadores:**
  - Nome + emoji de vidas (baseado no snapshot do início da rodada)
  - Destaque visual em quem está jogando agora
  - Jogadores eliminados aparecem com 💀
- Grid da zona do jogador (modo visualização, sem interação)
- Botão **SAIR DA PARTIDA** (discreto, no rodapé)

---

### 7. Fim de Partida
Tela de resultados.

**Banner do vencedor:**
- Emoji + nome do vencedor em destaque colorido
- "VOCÊ VENCEU! 🏆" se for o próprio jogador

**Ranking de eliminação:**
- Lista ordenada: 1º eliminado → ... → 🏆 vencedor
- Cada linha: posição, emoji de cor, nome do jogador
- Legenda: "abatido por [nome]" ou "sobreviveu"

**Estatísticas pessoais:**
- Rodadas jogadas
- Tiros dados
- Acertos / Erros
- Precisão (%)
- Vidas restantes
- Abatido por (se eliminado)

Botão **NOVA PARTIDA** (recarrega o app)

---

## Overlays (modais)

Aparecem sobre qualquer tela, fundo escurecido.

| Overlay | Quem vê | Conteúdo |
|---------|---------|----------|
| **Confirmar Disparo** | Jogador da vez | Coordenada em destaque, botões DISPARAR / CANCELAR |
| **Você foi atingido** | Só o atingido | 💥 + corações restantes + "SÓ VOCÊ VIU ISSO. VOCÊ PODE BLEFAR!" |
| **Tanque destruído** | Só o eliminado | 💀 + "Mostre seu app para todos" + botão CONFIRMAR ELIMINAÇÃO |
| **Inimigo eliminado** | Todos os outros | 💀 + "[COR] ELIMINADO!" na cor do eliminado + botão OK |
| **Confirmação de saída** | Jogador que clicou em sair | Aviso de abandono + SIM, SAIR AGORA / CONTINUAR |

---

## Identidade Visual

**Estética:** militar / arcade retrô. Fundo escuro com efeito de scanlines.

**Paleta:**
| Variável | Hex | Uso |
|----------|-----|-----|
| `--bg` | `#0a0c0f` | Fundo principal |
| `--bg2` | `#111418` | Fundo secundário |
| `--bg3` | `#181d24` | Cards, inputs |
| `--accent` | `#f0a500` | Laranja — destaque principal, timer, logo |
| `--accent2` | `#ff4444` | Vermelho — perigo, dano, eliminação |
| `--green` | `#39ff14` | Verde neon — passos concluídos, células movíveis |
| `--yellow` | `#f5c842` | Cor do jogador Amarelo |
| `--red` | `#ff4455` | Cor do jogador Vermelho |
| `--blue` | `#44aaff` | Cor do jogador Azul |
| `--verde` | `#44ff88` | Cor do jogador Verde |

**Tipografia:**
- **Orbitron** (900) — logo, títulos, coordenadas, timer
- **Barlow Condensed** (700) — botões, labels
- **Share Tech Mono** — textos auxiliares, status, stats

**Botões:**
- `.btn` — borda laranja, fill com slide animation no hover
- `.btn-danger` — borda vermelha
- `.btn-ghost` — borda cinza discreta

---

## Tech Stack

- React 18 + Vite
- Supabase (Postgres + Realtime via WebSocket)
- CSS puro (sem framework)
- Mobile-first, sem router (telas controladas por estado)
