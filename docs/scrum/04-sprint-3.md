# Sprint 3 — Sistema de Habilidades com QR Code

**Período:** Semana 5 – Semana 6  
**Status:** 🔄 Em andamento  
**Sprint Goal:** Jogadores podem ativar habilidades especiais escaneando um QR code de carta física com a câmera do celular, adicionando profundidade estratégica ao jogo.

---

## Sprint Planning

### Quem fez o quê

| Tarefa | Responsável | SP | Status |
|---|---|---|---|
| Pesquisa e escolha da lib de QR code (html5-qrcode) | Pedro Soares | 2 | ✅ |
| Componente `QRScanner` (câmera, detecção, callback) | Pedro Soares | 8 | ✅ |
| Definição das 7 habilidades e seus efeitos no jogo | Pedro Henrique | 2 | ✅ |
| Constante `SKILLS` no `game.js` | Vitor M Freire | 1 | ✅ |
| Lógica `activateSkill` no hook (`switch` por skillId) | Vitor M Freire | 8 | ✅ |
| Habilidade Reparo (+1 vida) | Vitor M Freire | 1 | ✅ |
| Habilidade Escudo (absorve próximo tiro) | Pedro Becker | 2 | ✅ |
| Habilidade Tiro Duplo (2 coordenadas no turno) | Vitor M Freire | 5 | ✅ |
| Habilidade Salto (mover para qualquer célula) | Vitor Luiz | 2 | ✅ |
| Habilidade Tiro Silencioso (oculta tanque no passo 2) | Pedro Becker | 3 | ✅ |
| Habilidade Espionagem (ver vidas de todos) | Vitor Luiz | 2 | ✅ |
| Habilidade Reconstruir (remove último alvo da zona) | Pedro Soares | 2 | ✅ |
| Overlay de habilidade ativada (confirmação visual) | Vitor Luiz | 2 | ✅ |
| Overlay de Espionagem (lista de vidas de todos) | Vitor Luiz | 2 | ✅ |
| Limite de 1 skill por rodada | Vitor M Freire | 1 | ✅ |
| Geração dos QR codes para cada habilidade | João Pedro | 2 | ✅ |
| Integração QR code via URL param `?skill=<id>` | Pedro Soares | 3 | ✅ |
| Ajuste do passo de Tiro Duplo no fluxo de turno | Vitor M Freire | 3 | ✅ |
| Refinamento das user stories da Sprint 4 | Pedro Henrique | 1 | ✅ |

**Total planejado:** 52 SP | **Total entregue:** em apuração (sprint em andamento)

---

## Histórias desta Sprint

| ID | User Story | SP | Status |
|---|---|---|---|
| US15 | Escanear QR code de carta para ativar habilidade | 13 | ✅ |
| US16 | Habilidade Reparo (+1 vida) | 3 | ✅ |
| US17 | Habilidade Escudo | 3 | ✅ |
| US18 | Habilidade Tiro Duplo | 5 | ✅ |
| US19 | Habilidade Salto | 3 | ✅ |
| US20 | Habilidade Tiro Silencioso | 5 | ✅ |
| US21 | Habilidade Espionagem | 3 | ✅ |
| US22 | Habilidade Reconstruir | 3 | ✅ |

---

## Sprint Review

> ⏳ *A ser preenchido ao final da sprint.*

---

## Sprint Retrospective

> ⏳ *A ser preenchido ao final da sprint.*
