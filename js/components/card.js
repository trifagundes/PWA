/**
 * Componente de Card de Item Reutilizável.
 * Recebe os dados por parâmetro e retorna um elemento DOM.
 */

export function createItemCard(item, isFavorited, onFavoriteToggle) {
  const card = document.createElement('article');
  card.className = 'item-card';
  card.dataset.id = item.id;
  
  // Indicador de indisponibilidade
  const badgeHTML = !item.available 
    ? `<span class="card-badge">Indisponível</span>` 
    : '';

  card.innerHTML = `
    <div class="card-image-container">
      ${badgeHTML}
      <button class="card-favorite-btn ${isFavorited ? 'favorited' : ''}" aria-label="Favoritar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy">
    </div>
    <div class="card-content">
      <span class="card-category">${item.categoryId}</span>
      <h3 class="card-title">${item.title}</h3>
      <p class="card-desc">${item.description}</p>
      <div class="card-footer">
        <span class="card-price">${item.price}</span>
        <button class="card-action-btn">Ver Detalhes</button>
      </div>
    </div>
  `;

  // Ouvinte de clique para favoritar (com stopPropagation para não navegar)
  const favBtn = card.querySelector('.card-favorite-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onFavoriteToggle(item.id);
  });

  // Navega ao clicar no restante do card
  card.addEventListener('click', () => {
    window.location.hash = `#/item/${item.id}`;
  });

  return card;
}
