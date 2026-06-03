# Tank Battle — Habilidades (Cartas)

Cada jogador pode ativar **1 habilidade por rodada**. As habilidades vêm em cartas físicas. Há dois tipos:

- **Digitais** — têm QR code. O jogador escaneia a carta pelo scanner dentro do app, no **passo 1** do seu turno, e o efeito é aplicado pela lógica do jogo.
- **Físicas** — não passam pelo app nem têm QR code. São resolvidas na mesa, entre os jogadores.

---

## Habilidades Digitais (com QR code)

| Carta | Skill (id) | Efeito | Observação |
|---|---|---|---|
| 🔧 Reparo | `repair` | +1 vida (máx 3) | Só funciona se a vida não estiver cheia |
| 👁️ Espionagem | `viewLives` | Mostra as vidas de todos os jogadores agora | Só você vê |
| 🔩 Reconstruir | `rebuild` | Remove o último alvo marcado na sua zona | Precisa haver um alvo na sua zona |
| 🛡️ Escudo | `shield` | Absorve o próximo tiro ou míssil recebido | Consumido ao ser atingido |
| ⚡ Salto | `jump` | Move para qualquer célula da sua zona (não só adjacente) | Usado no passo de mover |
| 🤫 Tiro Silencioso | `silenceShot` | Oculta a posição do seu tanque no passo de posicionamento | Blefe |
| 🎯 Tiro Duplo | `doubleShot` | Dispara duas coordenadas no mesmo turno | — |
| ⏱️ Sabotagem | `sabotage` | O próximo jogador tem só 45s de turno (em vez de 90s) | Afeta o próximo na ordem |
| 🚀 Míssil | `missile` | Tira 1 vida de um jogador à sua escolha, sem marcar o campo | Quebra o Escudo do alvo se houver (não tira vida nesse caso) |

### URLs dos QR codes
Base: `https://tank-jogo-prototipo-react.vercel.app/?skill=<id>`

```
https://tank-jogo-prototipo-react.vercel.app/?skill=repair
https://tank-jogo-prototipo-react.vercel.app/?skill=viewLives
https://tank-jogo-prototipo-react.vercel.app/?skill=rebuild
https://tank-jogo-prototipo-react.vercel.app/?skill=shield
https://tank-jogo-prototipo-react.vercel.app/?skill=jump
https://tank-jogo-prototipo-react.vercel.app/?skill=silenceShot
https://tank-jogo-prototipo-react.vercel.app/?skill=doubleShot
https://tank-jogo-prototipo-react.vercel.app/?skill=sabotage
https://tank-jogo-prototipo-react.vercel.app/?skill=missile
```

> ⚠️ Atenção ao gerar os QR codes: `viewLives`, `silenceShot`, `doubleShot` têm letra maiúscula no meio (camelCase). Precisam estar exatamente assim, senão o app não reconhece.

---

## Habilidades Físicas (sem app, sem QR code)

Estas são resolvidas na mesa. Funcionam por causa da **informação assimétrica** do jogo: a peça no tabuleiro físico mostra a posição *pública* (possivelmente ultrapassada) do tanque, enquanto a posição *real e secreta* fica no app de cada jogador.

| Carta | Efeito |
|---|---|
| 🃏 Roubo de Carta | Pega uma carta de habilidade de outro jogador. A carta roubada é usada normalmente (no scanner, se for digital) no turno de quem roubou. |
| 🎭 Isca | Move a sua peça física no tabuleiro para outra célula. Engana os outros sobre onde seu tanque está, **sem alterar a posição real no app**. Puro blefe. |

> **Nome da carta "Isca" é provisório** — alternativas: Chamariz, Engodo, Manobra, Fantasma.

### Por que a Isca não mexe no app
O acerto de um tiro é calculado pelo app comparando a coordenada com a posição **real** (secreta) do tanque, não com a peça física. A peça física é só a informação pública. Mover a peça física, portanto, não muda onde o tanque realmente está — só confunde os adversários. Por isso a Isca é uma mecânica 100% de mesa.

---

## Resumo

- **9 habilidades digitais** (via app + QR code)
- **2 habilidades físicas** (de mesa)
- **Total: 11 cartas de habilidade**
- Limite: **1 habilidade por rodada** por jogador
