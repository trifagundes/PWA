/**
 * Abstração da camada de dados.
 * Atualmente lê arquivos JSON locais, simulando gravação através de LocalStorage.
 * Pronto para migração para Firebase Firestore no futuro.
 */

export async function getCollection(collectionName) {
  try {
    const localKey = `db_${collectionName}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      return JSON.parse(localData);
    }

    const response = await fetch(`./data/${collectionName}.json`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar coleção ${collectionName}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Armazena localmente para simular persistência de alterações
    localStorage.setItem(localKey, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error(`db.js: Erro em getCollection(${collectionName}):`, error);
    return [];
  }
}

export async function getDocument(collectionName, id) {
  try {
    const collection = await getCollection(collectionName);
    return collection.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`db.js: Erro em getDocument(${collectionName}, ${id}):`, error);
    return null;
  }
}

export async function saveDocument(collectionName, document) {
  try {
    const collection = await getCollection(collectionName);
    const index = collection.findIndex(item => item.id === document.id);
    
    if (index !== -1) {
      collection[index] = { ...collection[index], ...document };
    } else {
      collection.push(document);
    }
    
    localStorage.setItem(`db_${collectionName}`, JSON.stringify(collection));
    return document;
  } catch (error) {
    console.error(`db.js: Erro em saveDocument(${collectionName}):`, error);
    throw error;
  }
}

export async function saveUserProfile(userProfile) {
  // Simula persistência de autenticação (futuramente Firebase Auth)
  try {
    localStorage.setItem('pwa_user', JSON.stringify(userProfile));
    return userProfile;
  } catch (error) {
    console.error('db.js: Erro ao salvar perfil do usuário:', error);
    throw error;
  }
}

export async function clearUserProfile() {
  try {
    localStorage.removeItem('pwa_user');
    return null;
  } catch (error) {
    console.error('db.js: Erro ao remover perfil do usuário:', error);
    throw error;
  }
}

export async function getNotifications() {
  try {
    const localKey = 'db_notifications';
    const localData = localStorage.getItem(localKey);
    
    if (localData) {
      return JSON.parse(localData);
    }

    // Notificações mockadas iniciais
    const initialMocks = [
      {
        id: 'welcome',
        title: 'Bem-vindo ao Agnostic App!',
        body: 'Explore nosso catálogo premium de itens de design e conectividade inteligente sem qualquer barreira de login.',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 horas atrás
      },
      {
        id: 'favorites-tip',
        title: 'Dica: Sincronize favoritos',
        body: 'Seus favoritos estão salvos neste dispositivo. Identifique-se na aba Perfil para mantê-los seguros para sempre.',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 horas atrás
      },
      {
        id: 'offline-mode',
        title: 'Suporte Offline Ativo',
        body: 'O PWA está rodando com suporte offline completo! Você pode testar desconectando a sua rede.',
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 24 horas atrás
      }
    ];

    localStorage.setItem(localKey, JSON.stringify(initialMocks));
    return initialMocks;
  } catch (error) {
    console.error('db.js: Erro em getNotifications():', error);
    return [];
  }
}

export async function saveNotifications(notifications) {
  try {
    localStorage.setItem('db_notifications', JSON.stringify(notifications));
    return notifications;
  } catch (error) {
    console.error('db.js: Erro em saveNotifications():', error);
    throw error;
  }
}
