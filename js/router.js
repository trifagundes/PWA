/**
 * Controlador de Navegação (Roteador Baseado em Hash).
 * Gerencia a ativação, destruição e renderização de views no container principal.
 */

class Router {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.routes = {};
    this.currentView = null;
    
    // Escuta alterações de rota (hash)
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  register(path, view) {
    this.routes[path] = view;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRouting() {
    const hash = window.location.hash || '#/';
    let routeHandler = null;
    let params = {};

    for (const routePath in this.routes) {
      // Converte rotas com parâmetros, ex: '#/item/:id' para Regex
      const routeRegexSource = '^' + routePath
        .replace(/\/:[^\/]+/g, '/([^/]+)')
        .replace(/\//g, '\\/') + '$';
      
      const routeRegex = new RegExp(routeRegexSource);
      const match = hash.match(routeRegex);

      if (match) {
        routeHandler = this.routes[routePath];
        
        // Extrai nomes e valores dos parâmetros de rota
        const paramNames = (routePath.match(/:[^\/]+/g) || []).map(p => p.substring(1));
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        break;
      }
    }

    if (routeHandler) {
      this.loadView(routeHandler, params);
    } else {
      console.warn(`Rota não encontrada: ${hash}`);
      this.navigate('#/');
    }
  }

  async loadView(view, params) {
    // Destrói a view anterior se necessário
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }

    this.currentView = view;
    
    // Limpa o container e insere a nova view
    this.container.innerHTML = '';
    
    if (typeof view.render === 'function') {
      const wrapper = document.createElement('div');
      wrapper.className = 'view-wrapper fade-in';
      this.container.appendChild(wrapper);
      
      // Renderiza a view passando o container e parâmetros
      await view.render(wrapper, params);
    }
    
    this.updateActiveNav(window.location.hash || '#/');
  }

  updateActiveNav(hash) {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      
      if ((href === '#/' && (hash === '#/' || hash === '')) || 
          (href !== '#/' && hash.startsWith(href))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
}

export default Router;
