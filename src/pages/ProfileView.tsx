import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Check, X, Heart, UserPlus, Ban, MessageCircle } from 'lucide-react';
import { api } from '@/api';
import { User } from '@/types';
import Avatar from '@/components/Avatar';

interface Props {
  userId: string;
  currentUser: User;
  onBack: () => void;
  onOpenChat: (chatId: string, partner: { id: string; username: string; display_name: string; avatar_url: string; is_online: boolean; last_seen: string | null; has_partner: boolean }) => void;
  onUserUpdated?: (user: User) => void;
  isSelf?: boolean;
}

function formatLastSeen(dateStr: string, isOnline: boolean) {
  if (isOnline) return 'в сети';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
  if (diff < 86400000) return `сегодня в ${d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfileView({ userId, currentUser, onBack, onOpenChat, onUserUpdated, isSelf }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadUser() {
    try {
      if (isSelf || userId === currentUser.id) {
        const me = await api.auth.me();
        setUser(me);
        setEditForm({ display_name: me.display_name, bio: me.bio || '' });
      } else {
        const u = await api.profile.getUser(userId);
        setUser(u);
      }
    } finally { setLoading(false); }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await api.profile.update(editForm);
      setUser(u => u ? { ...u, ...updated } : u);
      onUserUpdated?.(updated);
      setEditing(false);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Ошибка'); }
    setSaving(false);
  }

  async function handleOpenChat() {
    if (!user) return;
    try {
      const { chat_id } = await api.chats.open(user.id);
      onOpenChat(chat_id, {
        id: user.id, username: user.username, display_name: user.display_name,
        avatar_url: user.avatar_url, is_online: user.is_online,
        last_seen: user.last_seen, has_partner: !!user.relationship_partner_id
      });
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Ошибка'); }
  }

  const isSelfView = isSelf || userId === currentUser.id;

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--tnt-bg)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--tnt-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--tnt-bg)' }}>
      {/* Шапка */}
      <div
        className="flex items-center gap-3 px-3 py-2.5"
        style={{ background: 'var(--tnt-sidebar)', borderBottom: '1px solid var(--tnt-border)' }}
      >
        <button onClick={onBack} className="p-1" style={{ color: 'var(--tnt-accent)' }}>
          <ArrowLeft size={22} />
        </button>
        <span className="font-semibold flex-1" style={{ color: 'var(--tnt-text)' }}>
          {isSelfView ? 'Мой профиль' : 'Профиль'}
        </span>
        {isSelfView && !editing && (
          <button onClick={() => setEditing(true)} style={{ color: 'var(--tnt-accent)' }}>
            <Edit2 size={20} />
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} style={{ color: 'var(--tnt-text-muted)' }}>
              <X size={20} />
            </button>
            <button onClick={saveProfile} disabled={saving} style={{ color: 'var(--tnt-accent)' }}>
              <Check size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Аватар и имя */}
        <div
          className="flex flex-col items-center py-8 px-4"
          style={{ background: 'linear-gradient(180deg, var(--tnt-accent) 0%, var(--tnt-bg) 100%)' }}
        >
          <Avatar url={user.avatar_url} name={user.display_name} size={96} isOnline={user.is_online} hasPartner={!!user.relationship_partner_id} />
          <div className="mt-4 text-center">
            {editing ? (
              <input
                value={editForm.display_name}
                onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))}
                className="text-center bg-transparent text-2xl font-bold outline-none border-b w-full pb-1"
                style={{ color: 'var(--tnt-text)', borderColor: 'var(--tnt-accent)' }}
              />
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--tnt-text)' }}>{user.display_name}</h2>
                {user.relationship_partner_id && <Heart size={18} className="text-pink-400 fill-pink-400" />}
              </div>
            )}
            <p className="text-sm mt-1" style={{ color: 'var(--tnt-text-muted)' }}>
              {user.is_online ? '🟢 в сети' : `был(а) ${formatLastSeen(user.last_seen, user.is_online)}`}
            </p>
          </div>
        </div>

        {/* Инфо */}
        <div className="px-4 space-y-2 pb-6">
          {/* Username */}
          <InfoRow label="Имя пользователя" value={`@${user.username}`} />

          {/* Bio */}
          <div className="rounded-xl p-4" style={{ background: 'var(--tnt-sidebar)' }}>
            <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--tnt-text-muted)' }}>О себе</p>
            {editing ? (
              <textarea
                value={editForm.bio}
                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Расскажите о себе..."
                className="w-full bg-transparent text-sm outline-none resize-none"
                style={{ color: 'var(--tnt-text)' }}
              />
            ) : (
              <p className="text-sm" style={{ color: user.bio ? 'var(--tnt-text)' : 'var(--tnt-text-muted)' }}>
                {user.bio || 'Нет информации'}
              </p>
            )}
          </div>

          {/* Действия для чужого профиля */}
          {!isSelfView && (
            <div className="space-y-2 pt-2">
              <button
                onClick={handleOpenChat}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium"
                style={{ background: 'var(--tnt-accent)' }}
              >
                <MessageCircle size={18} />
                Написать сообщение
              </button>
              <div className="flex gap-2">
                <button
                  onClick={async () => { await api.profile.addContact(user.id); alert('Добавлено в контакты!'); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--tnt-sidebar)', color: 'var(--tnt-text)' }}
                >
                  <UserPlus size={16} />
                  В контакты
                </button>
                <button
                  onClick={async () => {
                    await api.profile.relationship(user.id, 'partner', 'set');
                    alert('Приглашение в отношения отправлено!');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--tnt-sidebar)', color: '#e91e63' }}
                >
                  <Heart size={16} />
                  В отношения
                </button>
              </div>
              {!user.is_blocked && (
                <button
                  onClick={async () => {
                    if (confirm('Заблокировать пользователя?')) {
                      await api.profile.block(user.id, 'block');
                      alert('Заблокировано');
                      onBack();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--tnt-sidebar)', color: '#ef4444' }}
                >
                  <Ban size={16} />
                  Заблокировать
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--tnt-sidebar)' }}>
      <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--tnt-text-muted)' }}>{label}</p>
      <p className="text-sm" style={{ color: 'var(--tnt-text)' }}>{value}</p>
    </div>
  );
}