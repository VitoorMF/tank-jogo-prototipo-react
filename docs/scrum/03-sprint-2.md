# Sprint 2 — Estabilização e Jogo Jogável

**Período:** Semana 3 – Semana 4  
**Sprint Goal:** Resolver todos os bugs críticos da Sprint 1 e entregar um jogo completamente jogável do início ao fim, sem interrupções.

---

## Sprint Planning

### Quem fez o quê

| Tarefa | Responsável | SP | Status |
|---|---|---|---|
| Corrigir sistema de coordenadas (local → global 8×8) | Vitor M Freire | 5 | ✅ |
| Corrigir sincronização Realtime (reconexão automática) | Pedro Soares | 5 | ✅ |
| Corrigir timer (não avançava turno corretamente) | Pedro Becker | 3 | ✅ |
| Corrigir movimento fora da zona | Vitor Luiz | 3 | ✅ |
| Overlay "Você foi atingido" (privado, só o atingido vê) | Vitor M Freire | 3 | ✅ |
| Overlay "Tanque destruído" + confirmação de eliminação | Pedro Soares | 3 | ✅ |
| Overlay "Inimigo eliminado" (anúncio para todos) | Pedro Becker | 2 | ✅ |
| Tela de Fim de Partida (ranking + stats) | Vitor Luiz | 5 | ✅ |
| Passo 2 — overlay de confirmação de disparo | Vitor M Freire | 2 | ✅ |
| Passo 3 — painel de posicionamento físico | Pedro Soares | 3 | ✅ |
| Lógica de eliminação e ordem de turno | Vitor M Freire | 3 | ✅ |
| Botão "Iniciar partida" apenas pro host com ≥2 jogadores | Pedro Becker | 2 | ✅ |
| Barra de progresso dos 4 passos do turno | Vitor Luiz | 2 | ✅ |
| Refinamento das user stories da Sprint 3 | Pedro Henrique | 1 | ✅ |
| Ajustes visuais (badges de turno, cores, animações) | João Pedro | 3 | ✅ |

**Total planejado:** 45 SP | **Total entregue:** 45 SP

---

## Histórias desta Sprint

| ID | User Story | SP | Status |
|---|---|---|---|
| US09 | Notificação privada de ser atingido | 5 | ✅ |
| US10 | Sincronização em tempo real estável | 8 | ✅ |
| US11 | Tela de espera (quando não é a vez) | 5 | ✅ |
| US12 | Tela de fim de partida com ranking e stats | 5 | ✅ |
| US13 | Confirmação de disparo antes de executar | 2 | ✅ |
| US14 | Host inicia partida com ≥2 jogadores | 3 | ✅ |
| — | Correção de bugs da Sprint 1 | — | ✅ |

---

## Sprint Review

### O que foi entregue
- Jogo completamente jogável do início ao fim, sem bugs críticos
- Sistema de coordenadas corrigido para global (A–H, 1–8) em todo o app
- Reconexão automática ao Realtime quando o celular fica em background
- Fluxo completo dos 4 passos do turno funcionando
- Overlays de hit/eliminação funcionando corretamente (privacidade mantida)
- Tela de fim de partida com ranking de eliminação e estatísticas por jogador
- Sessão de teste com os 7 membros do grupo realizada com sucesso

### O que ficou de fora
- Nenhuma história ficou de fora; todas as US planejadas foram entregues

---

## Sprint Retrospective

### ✅ O que foi bem
- Sprint bem mais organizada que a primeira — tarefas mais bem definidas antes de começar
- Corrigir os bugs primeiro antes de adicionar features foi a decisão certa
- Sessão de teste com o grupo inteiro revelou bugs que não seriam encontrados individualmente

### ❌ O que foi mal
- Alguns bugs exigiram refatoração maior do que o esperado (coordenadas)
- Comunicação ainda assíncrona demais — às vezes dois membros trabalhavam no mesmo arquivo

### 🔄 O que melhorar
- Dividir melhor as responsabilidades por arquivo/componente para evitar conflitos
- Criar um canal de comunicação mais ativo durante a sprint (WhatsApp/Discord)
- Começar a documentar as decisões técnicas para não perder o raciocínio depois
