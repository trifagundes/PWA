import store from '../store.js';
import { showAuthModal } from '../components/auth-modal.js';

class DetailView {
  constructor() {
    this.unsubscribe = null;
    this.container = null;
    this.itemId = null;
  }

  async render(container, params) {
    this.container = container;
    this.itemId = params.id;
    
    // Inscreve no store para reagir a alterações
    this.unsubscribe = store.subscribe(() => this.updateUI());
    
    this.updateUI();
  }

  updateUI() {
    if (!this.container) return;

    const state = store.getState();
    const item = state.itens.find(i => i.id === this.itemId);

    if (!item) {
      this.container.innerHTML = `
        <div class="detail-container">
          <div class="detail-nav">
            <button class="back-btn" id="btn-back">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar</span>
            </button>
          </div>
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 class="empty-title">Item não encontrado</h4>
            <p class="empty-desc">O item que você está procurando não existe.</p>
          </div>
        </div>
      `;
      
      const backBtn = this.container.querySelector('#btn-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => window.history.back());
      }
      return;
    }

    const isFavorited = state.favorites.includes(item.id);
    const statusClass = item.available ? 'available' : 'unavailable';
    const statusText = item.available ? 'Disponível' : 'Indisponível';

    // Cria as linhas de especificações
    let specsHTML = '';
    if (item.specs) {
      specsHTML = `
        <h4 class="detail-section-title">Especificações</h4>
        <div class="detail-specs">
          ${Object.entries(item.specs).map(([key, val]) => `
            <div class="spec-row">
              <span class="spec-label">${key}</span>
              <span class="spec-val">${val}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="detail-container">
        <div class="detail-nav">
          <button class="back-btn" id="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Voltar</span>
          </button>
        </div>

        <div class="detail-image-hero">
          <button class="detail-hero-fav ${isFavorited ? 'favorited' : ''}" id="btn-fav" aria-label="Favoritar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <img src="${item.image}" alt="${item.title}" class="detail-hero-img">
        </div>

        <div class="detail-body">
          <span class="detail-category">${item.categoryId}</span>
          <h2 class="detail-title">${item.title}</h2>
          
          <div class="detail-price-row">
            <span class="detail-price">${item.price}</span>
            <span class="detail-status ${statusClass}">${statusText}</span>
          </div>

          <h4 class="detail-section-title">Descrição</h4>
          <p class="detail-desc">${item.description}</p>

          ${specsHTML}

          <div class="detail-actions">
            <button class="btn-primary" id="btn-action" ${!item.available ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              ${item.available ? 'Solicitar Item' : 'Indisponível'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Eventos
    const backBtn = this.container.querySelector('#btn-back');
    backBtn.addEventListener('click', () => window.history.back());

    const favBtn = this.container.querySelector('#btn-fav');
    favBtn.addEventListener('click', () => this.toggleFavorite(item.id));

    const actionBtn = this.container.querySelector('#btn-action');
    if (actionBtn && item.available) {
      actionBtn.addEventListener('click', () => {
        const executeRequest = () => {
          alert(`Solicitação para o item "${item.title}" enviada com sucesso!`);
        };

        const currentUser = store.getState().user;
        if (currentUser) {
          executeRequest();
        } else {
          showAuthModal(() => {
            executeRequest();
          });
        }
      });
    }
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

const detailView = new DetailView();
export default detailView;
