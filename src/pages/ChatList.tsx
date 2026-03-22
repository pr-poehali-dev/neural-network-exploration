import { useState, useEffect, useCallback } from 'react';
import { Search, Settings, Edit, X, MoreVertical, UserPlus, ArrowLeft } from 'lucide-react';
import { api } from '@/api';
import { Chat, User } from '@/types';
import Avatar from '@/components/Avatar';

interface Props {
  currentUser: User;
  onOpenChat: (chatId: string, partner: Chat['partner']) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

export default function ChatList({ currentUser, onOpenChat, onOpenSettings, onOpenProfile }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const data = await api.chats.list();
      setChats(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);

  // Polling для обновления чатов
  useEffect(() => {
    const id = setInterval(loadChats, 5000);
    return () => clearInterval(id);
  }, [loadChats]);

  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.chats.search(search);
        setSearchResults(res);
      } finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function openChat(partnerId: string) {
    try {
      const { chat_id } = await api.chats.open(partnerId);
      const partner = searchResults.find(u => u.id === partnerId);
      if (partner) {
        onOpenChat(chat_id, {
          id: partner.id,
          username: partner.username,
          display_name: partner.display_name,
          avatar_url: partner.avatar_url,
          is_online: partner.is_online,
          last_seen: partner.last_seen,
          has_partner: partner.has_partner || false,
        });
      }
      setSearch(''); setSearchResults([]); setShowSearch(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  const filtered = search.trim()
    ? chats.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.partner?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.partner?.username?.toLowerCase().includes(search.toLowerCase())
      )
    : chats;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--tnt-sidebar)' }}>
      {/* Заголовок */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--tnt-border)' }}>
        {showSearch ? (
          <>
            <button onClick={() => { setShowSearch(false); setSearch(''); }} className="p-1" style={{ color: 'var(--tnt-accent)' }}>
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 flex items-center rounded-xl px-3 py-1.5 gap-2" style={{ background: 'var(--tnt-input)' }}>
              <Search size={15} style={{ color: 'var(--tnt-text-muted)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--tnt-text)' }}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} style={{ color: 'var(--tnt-text-muted)' }} />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={onOpenProfile} className="flex-1 text-left">
              <h1 className="font-bold text-base" style={{ color: 'var(--tnt-text)' }}>Тут и Там</h1>
            </button>
            <button onClick={() => setShowSearch(true)} className="p-2 rounded-full hover:opacity-70" style={{ color: 'var(--tnt-text-muted)' }}>
              <Search size={20} />
            </button>
            <button onClick={() => { }} className="p-2 rounded-full hover:opacity-70" style={{ color: 'var(--tnt-text-muted)' }}>
              <Edit size={20} />
            </button>
            <button onClick={onOpenSettings} className="p-2 rounded-full hover:opacity-70" style={{ color: 'var(--tnt-text-muted)' }}>
              <Settings size={20} />
            </button>
          </>
        )}
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto">
        {/* Результаты поиска пользователей */}
        {showSearch && search.length >= 2 && searchResults.length > 0 && (
          <div style={{ borderBottom: '1px solid var(--tnt-border)' }}>
            <p className="px-4 py-2 text-xs font-semibold uppercase" style={{ color: 'var(--tnt-text-muted)' }}>Пользователи</p>
            {searchResults.map(u => (
              <button key={u.id} onClick={() => openChat(u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity">
                <Avatar url={u.avatar_url} name={u.display_name} size={48} isOnline={u.is_online} hasPartner={u.has_partner} />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--tnt-text)' }}>{u.display_name}</span>
                    {u.has_partner && <span className="text-pink-400 text-xs">♥</span>}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--tnt-text-muted)' }}>@{u.username}</p>
                </div>
                <UserPlus size={16} style={{ color: 'var(--tnt-accent)' }} />
              </button>
            ))}
          </div>
        )}
        {showSearch && search.length >= 2 && !searching && searchResults.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--tnt-text-muted)' }}>Никого не найдено</p>
        )}

        {/* Чаты */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--tnt-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 && !showSearch ? (
          <div className="flex flex-col items-center justify-center h-48 px-8 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-medium mb-1" style={{ color: 'var(--tnt-text)' }}>Нет чатов</p>
            <p className="text-sm" style={{ color: 'var(--tnt-text-muted)' }}>Нажмите 🔍 чтобы найти собеседника</p>
          </div>
        ) : (
          filtered.map(chat => (
            <ChatItem key={chat.id} chat={chat} onOpen={() => onOpenChat(chat.id, chat.partner)} />
          ))
        )}
      </div>
    </div>
  );
}

function ChatItem({ chat, onOpen }: { chat: Chat; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity text-left"
      style={{ borderBottom: '1px solid var(--tnt-border)' }}
    >
      <Avatar
        url={chat.partner?.avatar_url}
        name={chat.partner?.display_name || chat.name || '?'}
        size={52}
        isOnline={chat.partner?.is_online}
        hasPartner={chat.partner?.has_partner}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-medium text-sm truncate" style={{ color: 'var(--tnt-text)' }}>
              {chat.partner?.display_name || chat.name}
            </span>
            {chat.partner?.has_partner && <span className="text-pink-400 text-xs flex-shrink-0">♥</span>}
          </div>
          <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--tnt-text-muted)' }}>
            {formatTime(chat.last_message_time)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs truncate flex-1" style={{ color: 'var(--tnt-text-muted)' }}>
            {chat.last_message || 'Начните общение'}
          </p>
          {chat.unread_count > 0 && (
            <span
              className="ml-2 min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 px-1"
              style={{ background: 'var(--tnt-accent)' }}
            >
              {chat.unread_count > 99 ? '99+' : chat.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
