const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, 'sw.js');
const versionPath = path.join(__dirname, 'js', 'version.js');

try {
  let swContent = fs.readFileSync(swPath, 'utf8');

  // Cria uma versão única baseada no timestamp atual
  const versionNum = Date.now();
  const newVersion = `agnostic-pwa-v${versionNum}`;

  // Substitui a linha do CACHE_NAME em sw.js
  const updatedContent = swContent.replace(/const CACHE_NAME = '[^']+'/, `const CACHE_NAME = '${newVersion}'`);

  if (swContent !== updatedContent) {
    fs.writeFileSync(swPath, updatedContent, 'utf8');
    console.log(`\x1b[32m[PWA] Versão do cache no sw.js atualizada com sucesso para: ${newVersion}\x1b[0m`);
  } else {
    console.log('[PWA] Nenhuma alteração necessária na versão do cache do sw.js.');
  }

  // Cria ou atualiza o arquivo js/version.js com a constante exportada
  const versionContent = `export const APP_VERSION = '${newVersion}';\n`;
  fs.writeFileSync(versionPath, versionContent, 'utf8');
  console.log(`\x1b[32m[PWA] Arquivo js/version.js atualizado com sucesso: ${newVersion}\x1b[0m`);

} catch (error) {
  console.error('[PWA] Erro ao atualizar as versões:', error);
}
