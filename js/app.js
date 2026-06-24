import Router from './router.js';
import store from './store.js';
import { getCollection, getNotifications } from './services/db.js';
import HomeView from './views/home.js';
import DetailView from './views/detail.js';
import FavoritesView from './views/favorites.js';
import ProfileView from './views/profile.js';
import { initNotificationDrawer } from './components/notification-drawer.js';
import { APP_VERSION } from './version.js';

// Inicialização do Roteador no container de views
const router = new Router('view-container');
router.register('#/', HomeView);
router.register('#/item/:id', DetailView);
router.register('#/favoritos', FavoritesView);
router.register('#/perfil', ProfileView);

// Inicialização e gerenciamento do tema visual
function initTheme() {
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const savedTheme = localStorage.getItem('pwa_theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('pwa_theme', currentTheme);
    });
  }
}

// Inicialização e cacheamento do Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('PWA: Service Worker registrado em:', registration.scope);
        })
        .catch(error => {
          console.error('PWA: Falha ao registrar Service Worker:', error);
        });
    });
  }
}

// Inicialização do fluxo principal da aplicação
async function initApp() {
  initTheme();
  registerServiceWorker();

  // Exibe a versão atual do app no header
  const versionEl = document.getElementById('app-version');
  if (versionEl) {
    versionEl.textContent = APP_VERSION.replace('agnostic-pwa-', '');
  }
  
  // Ativa estado de carregamento
  store.setState({ loading: true });
  
  // Busca dados através da camada de dados
  const [categories, itens, notifications] = await Promise.all([
    getCollection('categories'),
    getCollection('itens'),
    getNotifications()
  ]);
  
  // Inicializa o Painel de Notificações
  initNotificationDrawer();
  
  // Atualiza estado global
  store.setState({
    categories,
    itens,
    notifications,
    loading: false
  });
  
  // Processa rota atual
  router.handleRouting();
}

document.addEventListener('DOMContentLoaded', initApp);
