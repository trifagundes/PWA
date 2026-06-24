/**
 * Gerenciador de Estado Global (Padrão Pub/Sub).
 * Mantém o estado da aplicação centralizado e notifica inscritos sobre mudanças.
 */

class Store {
  constructor() {
    this.state = {
      itens: [],
      categories: [],
      selectedCategory: 'all',
      searchQuery: '',
      favorites: JSON.parse(localStorage.getItem('pwa_favorites') || '[]'),
      user: JSON.parse(localStorage.getItem('pwa_user') || 'null'),
      notifications: [],
      unreadNotificationsCount: 0,
      loading: false,
      currentItem: null
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    // Atualiza o contador de não lidas se a lista de notificações mudar
    if (newState.hasOwnProperty('notifications')) {
      newState.unreadNotificationsCount = newState.notifications.filter(n => !n.read).length;
    }

    this.state = { ...this.state, ...newState };
    
    // Sincroniza favoritos no localStorage
    if (newState.favorites) {
      localStorage.setItem('pwa_favorites', JSON.stringify(this.state.favorites));
    }
    
    // Sincroniza perfil de usuário no localStorage
    if (newState.hasOwnProperty('user')) {
      if (this.state.user) {
        localStorage.setItem('pwa_user', JSON.stringify(this.state.user));
      } else {
        localStorage.removeItem('pwa_user');
      }
    }
    
    // Notifica todos os ouvintes sobre a mudança de estado
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    // Retorna uma função para cancelar a inscrição
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

const store = new Store();
export default store;
