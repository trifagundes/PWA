const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, 'sw.js');

try {
  let swContent = fs.readFileSync(swPath, 'utf8');

  // Cria uma versão única baseada no timestamp atual (ex: agnostic-pwa-v1719273600000)
  const newVersion = `agnostic-pwa-v${Date.now()}`;

  // Substitui a linha do CACHE_NAME
  const updatedContent = swContent.replace(/const CACHE_NAME = '[^']+'/, `const CACHE_NAME = '${newVersion}'`);

  if (swContent !== updatedContent) {
    fs.writeFileSync(swPath, updatedContent, 'utf8');
    console.log(`\x1b[32m[PWA] Versão do cache atualizada com sucesso para: ${newVersion}\x1b[0m`);
  } else {
    console.log('[PWA] Nenhuma alteração necessária na versão do cache.');
  }
} catch (error) {
  console.error('[PWA] Erro ao atualizar a versão do Service Worker:', error);
}
