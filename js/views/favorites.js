import store from '../store.js';
import { createItemCard } from '../components/card.js';
import { showAuthModal } from '../components/auth-modal.js';

class FavoritesView {
  constructor() {
    this.unsubscribe = null;
    this.container = null;
  }

  async render(container) {
    this.container = container;
    
    // Inscreve no store para reagir a alterações
    this.unsubscribe = store.subscribe(() => this.updateUI());
    
    this.container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.5rem; font-weight: 700;">Meus Favoritos</h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">Itens salvos para acesso rápido</p>
      </div>
      <div id="favorites-banner-container"></div>
      <div class="items-grid" id="favorites-grid"></div>
    `;
    
    this.updateUI();
  }

  updateUI() {
    if (!this.container) return;
    
    const state = store.getState();
    const grid = this.container.querySelector('#favorites-grid');
    const bannerContainer = this.container.querySelector('#favorites-banner-container');
    if (!grid || !bannerContainer) return;
    
    // Filtra itens favoritados
    const favItems = state.itens.filter(item => state.favorites.includes(item.id));
    
    // Exibe banner caso possua itens nos favoritos e não esteja logado
    if (!state.user && favItems.length > 0) {
      bannerContainer.innerHTML = `
        <div class="info-banner fade-in">
          <p class="info-banner-text">Seus favoritos estão salvos localmente. <strong>Identifique-se gratuitamente</strong> para sincronizar e não perder seus dados.</p>
          <button class="info-banner-action" id="btn-banner-auth">Criar Conta Gratuita →</button>
        </div>
      `;
      const bannerBtn = bannerContainer.querySelector('#btn-banner-auth');
      if (bannerBtn) {
        bannerBtn.addEventListener('click', () => showAuthModal());
      }
    } else {
      bannerContainer.innerHTML = '';
    }
    
    grid.innerHTML = '';
    
    if (favItems.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h4 class="empty-title">Nenhum favorito</h4>
          <p class="empty-desc">Você ainda não favoritou nenhum item. Navegue pelo catálogo inicial para favoritar.</p>
          <a href="#/" class="back-btn" style="margin-top: 12px; display: inline-flex;">Explorar Catálogo</a>
        </div>
      `;
      return;
    }
    
    favItems.forEach(item => {
      const card = createItemCard(item, true, (id) => this.toggleFavorite(id));
      grid.appendChild(card);
    });
  }

  toggleFavorite(id) {
    const state = store.getState();
    let favorites = [...state.favorites];
    
    if (favorites.includes(id)) {
      favorites = favorites.filter(favId => favId !== id);
    } else {
      favorites.push(id);
    }
    
    store.setState({ favorites });
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.container = null;
  }
}

const favoritesView = new FavoritesView();
export default favoritesView;
