import store from '../store.js';
import { saveNotifications } from '../services/db.js';

export function initNotificationDrawer() {
  const container = document.getElementById('notification-drawer');
  const bellBtn = document.getElementById('btn-notifications');
  const badge = document.getElementById('notification-badge');
  
  if (!container || !bellBtn || !badge) return;

  // Renderiza a estrutura interna do Drawer
  container.innerHTML = `
    <div class="drawer-overlay" id="drawer-overlay">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 class="drawer-title">Notificações</h3>
          <button class="auth-close-btn" id="btn-drawer-close" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div id="push-permission-card" style="margin-bottom: 16px;"></div>
        <div class="drawer-list" id="drawer-list"></div>
      </div>
    </div>
  `;

  const overlay = container.querySelector('#drawer-overlay');
  const closeBtn = container.querySelector('#btn-drawer-close');
  const list = container.querySelector('#drawer-list');
  const pushCard = container.querySelector('#push-permission-card');

  // Abre e fecha a gaveta
  const toggleDrawer = () => {
    overlay.classList.toggle('active');
  };

  bellBtn.addEventListener('click', toggleDrawer);
  closeBtn.addEventListener('click', toggleDrawer);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      toggleDrawer();
    }
  });

  // Inscreve a gaveta no Store para atualizações dinâmicas
  store.subscribe((state) => {
    // 1. Atualiza Badge no Cabeçalho
    const count = state.unreadNotificationsCount;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }

    // 2. Renderiza os cartões internos
    renderList(state.notifications);
    renderPushCard();
  });

  function renderPushCard() {
    if (!('Notification' in window)) {
      pushCard.innerHTML = '';
      return;
    }

    if (Notification.permission === 'default') {
      pushCard.innerHTML = `
        <div class="info-banner" style="margin-bottom: 0; padding: 12px;">
          <p class="info-banner-text" style="font-size: 0.78rem;">Deseja receber avisos mesmo com o aplicativo fechado?</p>
          <button class="info-banner-action" id="btn-enable-push" style="font-size: 0.78rem;">Ativar Notificações Push</button>
        </div>
      `;
      const pushBtn = pushCard.querySelector('#btn-enable-push');
      pushBtn.addEventListener('click', async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          alert('Notificações push ativadas com sucesso!');
          renderPushCard();
        }
      });
    } else {
      pushCard.innerHTML = '';
    }
  }

  function renderList(notifications) {
    if (!list) return;

    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="padding-top: 40px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h4 class="empty-title" style="font-size: 1rem;">Nenhuma notificação</h4>
          <p class="empty-desc" style="font-size: 0.8rem;">Tudo limpo por aqui no momento.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = '';
    
    // Ordena por data (mais recente primeiro)
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sorted.forEach((notif) => {
      const item = document.createElement('div');
      item.className = `notification-item ${!notif.read ? 'unread' : ''}`;
      
      item.innerHTML = `
        <div class="notification-item-header">
          <h4 class="notification-item-title">${notif.title}</h4>
          ${!notif.read ? '<span class="notification-unread-dot"></span>' : ''}
        </div>
        <p class="notification-item-body">${notif.body}</p>
        <div class="notification-item-footer">
          <span class="notification-item-time">${timeAgo(notif.createdAt)}</span>
          <div class="notification-item-actions">
            ${!notif.read ? '<button class="notification-action-link mark-read-btn">Lida</button>' : ''}
            <button class="notification-action-link delete-btn">Excluir</button>
          </div>
        </div>
      `;

      const markBtn = item.querySelector('.mark-read-btn');
      if (markBtn) {
        markBtn.addEventListener('click', () => markAsRead(notif.id));
      }

      const deleteBtn = item.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteNotification(notif.id));

      list.appendChild(item);
    });
  }

  async function markAsRead(id) {
    const state = store.getState();
    const updated = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    await saveNotifications(updated);
    store.setState({ notifications: updated });
  }

  async function deleteNotification(id) {
    const state = store.getState();
    const updated = state.notifications.filter(n => n.id !== id);
    await saveNotifications(updated);
    store.setState({ notifications: updated });
  }

  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} h`;
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }
}
