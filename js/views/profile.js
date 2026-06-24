import store from '../store.js';
import { saveUserProfile, clearUserProfile } from '../services/db.js';

class ProfileView {
  constructor() {
    this.unsubscribe = null;
    this.container = null;
  }

  async render(container) {
    this.container = container;
    
    // Inscreve no store para reagir a alterações (ex: após login/logout)
    this.unsubscribe = store.subscribe(() => this.updateUI());
    
    this.updateUI();
  }

  updateUI() {
    if (!this.container) return;
    
    const state = store.getState();
    this.container.innerHTML = '';
    
    const viewWrapper = document.createElement('div');
    viewWrapper.className = 'profile-container';
    
    if (!state.user) {
      // Estado Deslogado: Formulário de identificação rápida
      viewWrapper.innerHTML = `
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 1.5rem; font-weight: 700;">Identifique-se</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Identifique-se gratuitamente para sincronizar seus favoritos e solicitar itens.</p>
        </div>

        <div class="profile-card" style="flex-direction: column; align-items: stretch; gap: 20px;">
          <form class="auth-form" id="profile-login-form">
            <div class="form-group">
              <label for="profile-name">Nome Completo</label>
              <input type="text" id="profile-name" class="form-input" placeholder="Ex: Lucas Mendes" required autocomplete="name">
            </div>
            <div class="form-group">
              <label for="profile-email">E-mail</label>
              <input type="email" id="profile-email" class="form-input" placeholder="Ex: lucas@exemplo.com" required autocomplete="email">
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 10px;">Salvar e Criar Conta</button>
          </form>
        </div>
      `;
      
      this.container.appendChild(viewWrapper);
      
      const form = this.container.querySelector('#profile-login-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = this.container.querySelector('#profile-name').value.trim();
        const email = this.container.querySelector('#profile-email').value.trim();
        
        if (name && email) {
          const userProfile = { name, email, createdAt: new Date().toISOString() };
          await saveUserProfile(userProfile);
          store.setState({ user: userProfile });
        }
      });
      
    } else {
      // Estado Logado: Detalhes, estatísticas e logout
      const initials = state.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      const favCount = state.favorites.length;
      
      viewWrapper.innerHTML = `
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 1.5rem; font-weight: 700;">Minha Conta</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Gerencie suas preferências e dados</p>
        </div>

        <div class="profile-card">
          <div class="profile-avatar">${initials}</div>
          <div class="profile-info">
            <span class="profile-name">${state.user.name}</span>
            <span class="profile-email">${state.user.email}</span>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-box">
            <span class="stat-number">${favCount}</span>
            <span class="stat-label">Favoritos</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" style="font-size: 1.1rem; line-height: 2.3; font-weight: 700;">Gratuita</span>
            <span class="stat-label">Conta</span>
          </div>
        </div>

        <div class="profile-menu">
          <div class="menu-item" id="menu-logout">
            <div class="menu-item-left danger">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sair da Conta</span>
            </div>
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      `;
      
      this.container.appendChild(viewWrapper);
      
      const logoutBtn = this.container.querySelector('#menu-logout');
      logoutBtn.addEventListener('click', async () => {
        if (confirm('Tem certeza de que deseja sair da sua conta?')) {
          await clearUserProfile();
          store.setState({ user: null });
        }
      });
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.container = null;
  }
}

const profileView = new ProfileView();
export default profileView;
