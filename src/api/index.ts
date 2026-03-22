import { getToken } from '@/store/auth';

const BASE: Record<string, string> = {};

async function loadUrls() {
  if (Object.keys(BASE).length > 0) return;
  try {
    const r = await fetch('/func2url.json');
    const data = await r.json();
    Object.assign(BASE, data);
  } catch { /* dev mode */ }
}

async function req(fn: string, method: string, path: string, body?: unknown) {
  await loadUrls();
  const baseUrl = BASE[fn] || `http://localhost:8000/${fn}`;
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['X-Auth-Token'] = token;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const api = {
  auth: {
    register: (body: { username: string; display_name: string; password: string; phone?: string }) =>
      req('auth', 'POST', '/register', body),
    login: (body: { username: string; password: string }) =>
      req('auth', 'POST', '/login', body),
    logout: () => req('auth', 'POST', '/logout'),
    me: () => req('auth', 'GET', '/me'),
  },
  chats: {
    list: () => req('chats', 'GET', '/'),
    search: (q: string) => req('chats', 'GET', `/search?q=${encodeURIComponent(q)}`),
    open: (partner_id: string) => req('chats', 'POST', '/open', { partner_id }),
  },
  messages: {
    list: (chat_id: string, offset = 0) =>
      req('messages', 'GET', `/?chat_id=${chat_id}&offset=${offset}&limit=50`),
    send: (body: { chat_id: string; content: string; message_type?: string; reply_to_id?: string }) =>
      req('messages', 'POST', '/', body),
    delete: (message_id: string) => req('messages', 'PUT', '/delete', { message_id }),
    react: (message_id: string, emoji: string) =>
      req('messages', 'POST', '/reaction', { message_id, emoji }),
  },
  profile: {
    update: (body: { display_name?: string; bio?: string; avatar_url?: string; theme?: string }) =>
      req('profile', 'PUT', '/update', body),
    contacts: () => req('profile', 'GET', '/contacts'),
    addContact: (contact_id: string) => req('profile', 'POST', '/contact', { contact_id }),
    block: (blocked_id: string, action: 'block' | 'unblock') =>
      req('profile', 'POST', '/block', { blocked_id, action }),
    relationship: (partner_id: string, type: string, action: 'set' | 'remove') =>
      req('profile', 'POST', '/relationship', { partner_id, type, action }),
    getUser: (id: string) => req('profile', 'GET', `/user?id=${id}`),
  },
};
