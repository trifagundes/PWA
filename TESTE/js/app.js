if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW de Teste registrado:', reg.scope))
      .catch(err => console.error('Erro no SW de Teste:', err));
  });
}
