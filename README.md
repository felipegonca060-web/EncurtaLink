# Encurtador de Links — V1

Primeira versão funcional com:

- Criação de links curtos
- Redirecionamento automático
- Contador de cliques
- Lista dos links criados
- Interface responsiva

## Como executar

É necessário ter Node.js instalado.

```bash
npm install
npm start
```

Depois abra:

http://localhost:3000

## Estrutura

- `server.js` — servidor/API e redirecionamento
- `public/index.html` — página principal
- `public/404.html` — página de link inexistente
- `public/style.css` — visual
- `public/app.js` — interação do site
- `data.json` — armazenamento simples dos links

## Observação

Esta V1 usa um arquivo JSON como banco de dados. Para colocar em produção com vários usuários, o ideal é trocar por PostgreSQL/MySQL ou outro banco persistente.
