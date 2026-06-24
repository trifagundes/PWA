import store from '../store.js';
import { createItemCard } from '../components/card.js';

class HomeView {
  constructor() {
    this.unsubscribe = null;
    this.container = null;
  }

  async render(container) {
    this.container = container;
    
    // Inscreve a view no store para reagir a alterações
    this.unsubscribe = store.subscribe(() => this.updateUI());
    
    this.container.innerHTML = `
      <!-- Barra de Pesquisa -->
      <div class="search-container">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" id="search-input" class="search-input" placeholder="Pesquisar itens..." value="${store.getState().searchQuery}">
      </div>

      <!-- Abas de Categorias -->
      <div class="categories-tabs" id="categories-container"></div>

      <!-- Lista de Itens -->
      <div class="items-grid" id="items-container"></div>
    `;

    // Escuta entradas no campo de busca e atualiza o estado
    const searchInput = this.container.querySelector('#search-input');
    searchInput.addEventListener('input', (e) => {
      store.setState({ searchQuery: e.target.value });
    });

    // Renderização inicial
    this.updateUI();
  }

  updateUI() {
    if (!this.container) return;
    const state = store.getState();
    
    if (state.loading) {
      const itemsContainer = this.container.querySelector('#items-container');
      if (itemsContainer) {
        itemsContainer.innerHTML = `
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
        `;
      }
      return;
    }

    this.renderCategories(state);
    this.renderItems(state);
  }

  renderCategories(state) {
    const categoriesContainer = this.container.querySelector('#categories-container');
    if (!categoriesContainer) return;

    const categories = [{ id: 'all', name: 'Todos' }, ...state.categories];
    categoriesContainer.innerHTML = categories.map(cat => `
      <button class="category-tab ${state.selectedCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
        ${cat.name}
      </button>
    `).join('');

    // Escuta cliques nas abas
    categoriesContainer.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        store.setState({ selectedCategory: tab.dataset.id });
      });
    });
  }

  renderItems(state) {
    const itemsContainer = this.container.querySelector('#items-container');
    if (!itemsContainer) return;

    // Filtra itens baseando-se na busca e categoria ativa
    const filteredItens = state.itens.filter(item => {
      const matchesCategory = state.selectedCategory === 'all' || item.categoryId === state.selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(state.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    itemsContainer.innerHTML = '';

    if (filteredItens.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 class="empty-title">Nenhum item localizado</h4>
          <p class="empty-desc">Tente alterar o filtro de busca ou a categoria selecionada.</p>
        </div>
      `;
      return;
    }

    filteredItens.forEach(item => {
      const isFavorited = state.favorites.includes(item.id);
      const card = createItemCard(item, isFavorited, (id) => this.toggleFavorite(id));
      itemsContainer.appendChild(card);
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

const homeView = new HomeView();
export default homeView;
