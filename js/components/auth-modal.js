import store from '../store.js';
import { saveUserProfile } from '../services/db.js';

export function showAuthModal(onSuccess) {
  // Evita abrir múltiplos modais idênticos
  if (document.querySelector('.auth-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  
  overlay.innerHTML = `
    <div class="auth-modal-content">
      <div class="auth-header">
        <div>
          <h3 class="auth-title">Identificação Gratuita</h3>
          <p class="auth-subtitle">Cadastre-se rapidamente para acessar este recurso</p>
        </div>
        <button class="auth-close-btn" id="btn-auth-close" aria-label="Fechar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form class="auth-form" id="auth-form">
        <div class="form-group">
          <label for="auth-name">Nome Completo</label>
          <input type="text" id="auth-name" class="form-input" placeholder="Ex: Maria Souza" required autocomplete="name">
        </div>
        <div class="form-group">
          <label for="auth-email">E-mail de Contato</label>
          <input type="email" id="auth-email" class="form-input" placeholder="Ex: maria@exemplo.com" required autocomplete="email">
        </div>
        <button type="submit" class="btn-primary" style="margin-top: 8px;">Concluir e Continuar</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  // Força refluxo para animação de slide-up funcionar
  setTimeout(() => {
    overlay.classList.add('active');
  }, 10);

  const closeBtn = overlay.querySelector('#btn-auth-close');
  const form = overlay.querySelector('#auth-form');

  const closeModal = () => {
    overlay.classList.remove('active');
    // Remove do DOM após a animação de transição (300ms)
    setTimeout(() => {
      overlay.remove();
    }, 300);
  };

  // Fecha clicando no X ou clicando no overlay externo
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Trata submissão do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = overlay.querySelector('#auth-name').value.trim();
    const email = overlay.querySelector('#auth-email').value.trim();
    
    if (name && email) {
      try {
        const userProfile = { name, email, createdAt: new Date().toISOString() };
        // Salva na camada de dados
        await saveUserProfile(userProfile);
        // Atualiza estado global
        store.setState({ user: userProfile });
        
        closeModal();
        
        // Dispara o callback de sucesso
        if (typeof onSuccess === 'function') {
          onSuccess(userProfile);
        }
      } catch (error) {
        alert('Erro ao realizar o cadastro. Tente novamente.');
      }
    }
  });
}
