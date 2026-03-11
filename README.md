# Tanki Demo React

Migração do projeto `tanki_demo/index.html` para React + Vite com estrutura modular.

## Estrutura

- `src/hooks/useTankBattle.js`: regra de negócio, turnos, timer e sincronização Supabase.
- `src/components/`: componentes de UI reutilizáveis (grid, notificação, status).
- `src/constants/game.js`: constantes do jogo e helpers.
- `src/services/supabase.js`: client do Supabase.
- `src/styles/global.css`: estilos globais.

## Executar

```bash
cd /Users/vitormf/projs/tanki_demo_react
cp .env.example .env
npm install
npm run dev
```

## Observações

- O projeto usa as mesmas credenciais do protótipo original como fallback.
- Para produção, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY` no `.env`.
# tank-jogo-prototipo-react
