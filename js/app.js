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
  
  const updateThemeColor = (isLight) => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isLight ? '#f4f4f7' : '#131217');
    }
  };

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    updateThemeColor(true);
  } else {
    updateThemeColor(false);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      const currentTheme = isLight ? 'light' : 'dark';
      localStorage.setItem('pwa_theme', currentTheme);
      updateThemeColor(isLight);
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

    // Recarrega a página automaticamente quando um novo Service Worker assume o controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}

// Inicialização do fluxo principal da aplicação
async function initApp() {
  // Detecta se é iOS e se está rodando como standalone PWA
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (isIOS && isStandalone) {
    document.documentElement.classList.add('ios-standalone');
  }

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
