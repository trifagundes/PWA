# DIRETRIZES DO PROJETO PWA
> Leia este documento **antes** de implementar qualquer coisa nova.
> Ele existe para garantir que a base permaneça sólida e o padrão seja respeitado por todos — incluindo você mesmo daqui a 6 meses.

---

## 1. ARQUITETURA — Visão Geral

Este projeto segue um padrão **MV\*** (Model-View-*) adaptado para PWA com Vanilla JS, sem bundler e sem framework.

```
┌─────────────────────────────────────────────────────┐
│                     USUÁRIO                         │
│            (toca, clica, digita)                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                  ROUTER (router.js)                  │
│  Decide qual View mostrar com base na URL/ação       │
└──────┬───────────────────────────────────┬───────────┘
       │                                   │
       ▼                                   ▼
┌─────────────┐                   ┌────────────────────┐
│  VIEW       │                   │  STORE (store.js)  │
│ views/*.js  │◄──── estado ──────│  Estado global     │
│             │                   │  Pub/Sub simples   │
│ Só renderiza│──── action ──────►│                    │
└─────────────┘                   └─────────┬──────────┘
                                            │
                                            ▼
                                  ┌─────────────────────┐
                                  │  SERVICE (db.js)     │
                                  │  Busca e escreve     │
                                  │  dados               │
                                  │  JSON hoje →         │
                                  │  Firebase amanhã     │
                                  └─────────────────────┘
```

---

## 2. RESPONSABILIDADES DE CADA CAMADA

### 📁 `js/services/db.js` — Camada de Dados
- **É o único arquivo que sabe de onde vêm os dados**
- Hoje lê de `/data/*.json`, amanhã lê do Firebase
- Nenhuma outra parte do código faz `fetch` diretamente
- Expõe apenas funções assíncronas: `getCollection()`, `getDocument()`, `saveDocument()`

### 📁 `js/store.js` — Estado Global
- **É o único lugar onde o estado da aplicação vive**
- Nenhuma view guarda estado próprio que outras views precisem
- Usa padrão Pub/Sub: quem muda estado chama `setState()`, quem quer saber se inscrevere com `subscribe()`
- Não faz fetch, não renderiza nada

### 📁 `js/router.js` — Controlador de Navegação
- **É o único que decide qual view está ativa**
- Responde a eventos de navegação (cliques em botões, URL hash)
- Chama `view.render()` e `view.destroy()` — não renderiza diretamente
- Não acessa dados, não manipula DOM além de montar/desmontar views

### 📁 `js/views/*.js` — Interface Visual
- **Só renderiza e captura eventos do usuário**
- Recebe dados prontos do Store ou do Service — nunca faz fetch diretamente
- Cada view tem: `render(container)` e `destroy()`
- Não conhece outras views — a navegação passa sempre pelo Router

### 📁 `js/components/*.js` — Componentes Reutilizáveis
- Partes de UI usadas em mais de uma view (card, modal, toast, bottom sheet)
- Recebem dados por parâmetro, não acessam Store diretamente
- Retornam HTML string ou elemento DOM — quem insere é a view

### 📁 `css/` — Estilos
- `reset.css` → base universal, nunca editar depois de criado
- `style.css` → design system: tokens, tipografia, componentes base
- **Nenhum estilo inline no JS ou HTML** (exceto valores dinâmicos impossíveis de fazer em CSS)
- **Nenhuma classe utilitária Tailwind misturada com CSS próprio**

### 📁 `data/*.json` — Dados Estáticos
- Um arquivo por coleção (ex: `itens.json`, `categories.json`)
- Estrutura de cada objeto deve ser idêntica ao que será usado no Firestore
- IDs como strings (`"id": "abc123"`), timestamps como ISO 8601 (`"2026-06-23T20:00:00Z"`)

---

## 3. CHECKLIST PRÉ-IMPLEMENTAÇÃO

> Execute esta lista **antes** de escrever código para qualquer feature nova.

### 🗃️ DADOS
- [ ] Essa feature precisa de dados novos?
- [ ] Se sim, eles cabem em uma coleção existente ou preciso criar um novo `.json`?
- [ ] Os campos que vou usar existem no Firestore sem conversão? (tipos: string, number, boolean, array, map, timestamp ISO)
- [ ] A busca/escrita passa pelo `db.js`? Ou estou fazendo fetch direto na view? (**nunca fazer**)
- [ ] Se escreve dados, o `db.js` tem uma função para isso?

### 🧠 ESTADO
- [ ] Essa feature precisa de estado?
- [ ] Esse estado é **local** (só a view atual precisa) ou **global** (outras views dependem)?
- [ ] Se global → está no `store.js`?
- [ ] Se local → está em uma variável dentro da própria função da view, não no Store?
- [ ] Estou usando `setState()` para mudar e `subscribe()` para reagir?

### 🗺️ ROTEAMENTO
- [ ] Precisa de uma view nova?
- [ ] Essa view está registrada no `router.js`?
- [ ] A navegação até ela usa o Router, não manipulação direta de DOM?
- [ ] Existe uma rota de volta (botão voltar, hash anterior)?

### 🎨 UI / LAYOUT
- [ ] Estou usando componentes existentes (`components/`) ou preciso criar um novo?
- [ ] Se criei um componente novo, ele está em `components/` e não dentro da view?
- [ ] O layout respeita as safe areas? (`env(safe-area-inset-*)` nos elementos fixos)
- [ ] Funciona bem em tela pequena (320px) e tela normal (390px+)?
- [ ] Os estilos estão no `style.css`, não inline no JS?
- [ ] Estou reutilizando tokens de cor/tipografia do design system?

### 📱 PWA / PERFORMANCE
- [ ] Adicionei arquivos novos que precisam ser cacheados pelo Service Worker?
- [ ] Se sim, atualizei a lista `URLS_TO_CACHE` no `sw.js`?
- [ ] Se sim, bumpeei a versão do cache (timestamp)?
- [ ] Essa feature funciona offline ou degrada graciosamente sem conexão?
- [ ] Estou fazendo requests externos? Se sim, o SW está tratando falha de rede?

---

## 4. REGRAS INVIOLÁVEIS

> Se você estiver prestes a quebrar uma dessas regras, pare e releia a arquitetura.

1. **Views não fazem fetch.** Todo acesso a dados passa pelo `db.js`.
2. **Views não guardam estado global.** Todo estado compartilhado está no `store.js`.
3. **Nenhum arquivo conhece detalhes de implementação do outro.** A view não sabe se o dado veio de JSON ou Firebase.
4. **Navegação sempre passa pelo router.** Nunca `element.style.display = 'none'` para trocar de view.
5. **Um componente não chama outro componente diretamente.** A composição é responsabilidade da view.
6. **CSS fora do `style.css` é exceção, não regra.** E deve ser comentado explicando o motivo.
7. **Nunca cachear a lógica do app sem bumpar a versão do SW.** Usuários ficariam presos na versão antiga.

---

## 5. ANTI-PADRÕES — O QUE NÃO FAZER

| ❌ Anti-padrão | ✅ Correto |
|---|---|
| `fetch('./data/itens.json')` dentro de uma view | `db.getCollection('itens')` no store ou na view via service |
| `localStorage.setItem('favorites', ...)` espalhado no código | `store.setState({ favorites: [...] })` |
| `document.getElementById('view-home').style.display = 'block'` | `router.navigate('home')` |
| Estilo inline: `element.style.color = '#red'` | Classe CSS: `element.classList.add('text-error')` |
| Variável global: `window.currentItem = {...}` | `store.setState({ currentItem: {...} })` |
| Lógica de negócio no HTML (onclick inline) | Event listener registrado na view em `render()` |
| Um arquivo JS com 500+ linhas | Dividir em view + componente + service |

---

## 6. ESTRUTURA DE ARQUIVOS — REFERÊNCIA

```
new/
├── index.html              ← Ponto de entrada. HTML mínimo.
├── manifest.json           ← Configuração do PWA
├── sw.js                   ← Service Worker
├── DIRETRIZES.md           ← Este arquivo
│
├── css/
│   ├── reset.css           ← Base universal (não editar)
│   └── style.css           ← Design system e componentes
│
├── data/
│   ├── itens.json          ← Coleção de itens
│   └── categories.json     ← Coleção de categorias
│
└── js/
    ├── app.js              ← Inicialização: store, router, SW
    ├── router.js           ← Gerencia qual view está ativa
    ├── store.js            ← Estado global (pub/sub)
    │
    ├── services/
    │   └── db.js           ← Abstração de dados (JSON → Firebase)
    │
    ├── views/
    │   └── home.js         ← Exemplo de view
    │
    └── components/
        └── card.js         ← Exemplo de componente reutilizável
```

---

## 7. MIGRAÇÃO PARA FIREBASE — QUANDO CHEGAR A HORA

Quando o Firebase estiver pronto, **somente `db.js` muda**. Nenhum outro arquivo deve precisar de alteração.

Passos:
1. Criar projeto no Firebase Console
2. Adicionar `js/services/firebase.js` com as credenciais
3. Em `db.js`, mudar `USE_FIREBASE = true`
4. Implementar as funções Firebase (`getDocs`, `setDoc`, etc.) mantendo a mesma interface pública
5. Bumpar versão do SW
6. Testar

---

*Última atualização: 2026-06-23*
