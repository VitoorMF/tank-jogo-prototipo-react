# Tank Battle — Documentação Scrum

## Visão do Produto

**Tank Battle** é um jogo de tabuleiro híbrido para 2 a 4 jogadores que combina componentes físicos com um app companion digital desenvolvido em React. O app funciona como árbitro digital: controla turnos, registra tiros e sincroniza o estado dos jogadores em tempo real via Supabase, enquanto o tabuleiro e as peças físicas ficam sobre a mesa.

O jogo mistura informação pública (tabuleiro físico, posição das peças visível a todos) com informação privada (vidas, posição exata do tanque no celular), criando espaço para blefe e estratégia.

---

## Equipe

| Papel | Nome |
|---|---|
| Product Owner | Pedro Henrique |
| Scrum Master | Gabriel Almeida |
| Designer | João Pedro |
| Desenvolvedor | Pedro Soares |
| Desenvolvedor | Pedro Becker |
| Desenvolvedor | Vitor M Freire |
| Desenvolvedor | Vitor Luiz |

---

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend/Realtime:** Supabase (PostgreSQL + WebSocket)
- **Estilo:** CSS puro, mobile-first
- **Hospedagem:** Vercel

---

## Definition of Done (DoD)

Uma história de usuário é considerada **concluída** quando:

- [ ] Funcionalidade implementada e funcionando no app
- [ ] Testada manualmente em dispositivo móvel
- [ ] Sem erros críticos no console
- [ ] Revisada por ao menos um outro membro do time
- [ ] Integrada e sincronizando corretamente via Supabase

---

## Resumo das Sprints

| Sprint | Objetivo | Status |
|---|---|---|
| Sprint 1 | MVP funcional | ✅ Concluída |
| Sprint 2 | Estabilização e jogo jogável | ✅ Concluída |
| Sprint 3 | Sistema de habilidades com QR Code | 🔄 Em andamento |
| Sprint 4 | Componentes físicos (tabuleiro + cartas) | ⏳ Não iniciada |
| Sprint 5 | Testes com usuários e entrega final | ⏳ Não iniciada |
