import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, MoreVertical, Send, Smile, Reply, X, Trash2, UserPlus, Ban } from 'lucide-react';
import { api } from '@/api';
import { Message, User, Chat } from '@/types';
import Avatar from '@/components/Avatar';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '🎉', '👏', '💯'];

interface Props {
  chatId: string;
  partner: Chat['partner'];
  currentUser: User;
  onBack: () => void;
  onOpenProfile: (userId: string) => void;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}

function formatLastSeen(dateStr: string | null, isOnline: boolean) {
  if (isOnline) return 'в сети';
  if (!dateStr) return 'давно';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'только что';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
  if (diff < 86400000) return `сегодня в ${d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
  return `${d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}`;
}

export default function ChatView({ chatId, partner, currentUser, onBack, onOpenProfile }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const [emojiFor, setEmojiFor] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await api.messages.list(chatId);
      setMessages(data);
      // Получаем счётчик чата
      const chats = await api.chats.list();
      const chat = chats.find((c: { id: string; message_count: number }) => c.id === chatId);
      if (chat) {
        setTotalCount(chat.message_count);
        if (chat.message_count >= 1000000) setShowMilestone(true);
      }
    } catch { /* ignore */ }
  }, [chatId]);

  useEffect(() => {
    loadMessages();
    const id = setInterval(loadMessages, 3000);
    return () => clearInterval(id);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput('');
    try {
      const res = await api.messages.send({
        chat_id: chatId,
        content,
        reply_to_id: replyTo?.id,
      });
      setReplyTo(null);
      if (res.message_count >= 1000000) setShowMilestone(true);
      await loadMessages();
    } finally { setSending(false); }
  }

  async function deleteMsg(msgId: string) {
    try {
      await api.messages.delete(msgId);
      await loadMessages();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Ошибка'); }
    setSelectedMsg(null);
  }

  async function react(msgId: string, emoji: string) {
    try {
      await api.messages.react(msgId, emoji);
      await loadMessages();
    } catch { /* ignore */ }
    setEmojiFor(null);
    setSelectedMsg(null);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const msgCount = totalCount;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--tnt-bg)' }}>
      {/* Заголовок */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 z-10"
        style={{ background: 'var(--tnt-sidebar)', borderBottom: '1px solid var(--tnt-border)' }}
      >
        <button onClick={onBack} className="p-1 -ml-1" style={{ color: 'var(--tnt-accent)' }}>
          <ArrowLeft size={22} />
        </button>
        <button onClick={() => onOpenProfile(partner.id)} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar url={partner.avatar_url} name={partner.display_name} size={38} isOnline={partner.is_online} hasPartner={partner.has_partner} />
          <div className="text-left min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm truncate" style={{ color: 'var(--tnt-text)' }}>{partner.display_name}</span>
              {partner.has_partner && <span className="text-pink-400 text-xs">♥</span>}
            </div>
            <p className="text-xs" style={{ color: partner.is_online ? 'var(--tnt-online)' : 'var(--tnt-text-muted)' }}>
              {formatLastSeen(partner.last_seen, partner.is_online)}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:opacity-70"
            style={{ color: 'var(--tnt-text-muted)' }}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Меню 3 точки */}
      {showMenu && (
        <div
          className="absolute top-14 right-2 rounded-xl shadow-xl z-50 min-w-[180px] py-1"
          style={{ background: 'var(--tnt-card)', border: '1px solid var(--tnt-border)' }}
        >
          <MenuItem icon={<span className="text-sm">📊</span>} label={`Сообщений: ${msgCount.toLocaleString('ru')}`} onClick={() => setShowMenu(false)} />
          <MenuItem icon={<UserPlus size={16} />} label="Добавить в контакты" onClick={async () => {
            try { await api.profile.addContact(partner.id); alert('Добавлено!'); } catch (e: unknown) { alert(e instanceof Error ? e.message : 'Ошибка'); }
            setShowMenu(false);
          }} />
          <MenuItem icon={<span className="text-sm">♥</span>} label="Пригласить в отношения" onClick={async () => {
            try { await api.profile.relationship(partner.id, 'partner', 'set'); alert('Приглашение отправлено!'); } catch (_e) { console.log(_e); }
            setShowMenu(false);
          }} />
          <MenuItem icon={<Ban size={16} />} label="Заблокировать" danger onClick={async () => {
            if (confirm('Заблокировать?')) { await api.profile.block(partner.id, 'block'); onBack(); }
            setShowMenu(false);
          }} />
        </div>
      )}

      {/* Milestone 1M */}
      {showMilestone && (
        <div
          className="mx-4 mt-2 rounded-xl p-3 text-center text-sm"
          style={{ background: 'var(--tnt-accent)', color: '#fff' }}
        >
          🎉 Вы написали 1 000 000 сообщений! Создайте новый чат?
          <div className="flex gap-2 justify-center mt-2">
            <button onClick={async () => { const { chat_id } = await api.chats.open(partner.id); setShowMilestone(false); }} className="px-3 py-1 rounded-lg bg-white/20 text-sm">Создать</button>
            <button onClick={() => setShowMilestone(false)} className="px-3 py-1 rounded-lg bg-white/10 text-sm">Закрыть</button>
          </div>
        </div>
      )}

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1" onClick={() => { setSelectedMsg(null); setEmojiFor(null); setShowMenu(false); }}>
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            prev={messages[i - 1]}
            currentUserId={currentUser.id}
            isSelected={selectedMsg === msg.id}
            emojiOpen={emojiFor === msg.id}
            onSelect={(id) => { setSelectedMsg(id); setEmojiFor(null); }}
            onReply={() => { setReplyTo(msg); setSelectedMsg(null); inputRef.current?.focus(); }}
            onDelete={() => deleteMsg(msg.id)}
            onEmojiOpen={(id) => { setEmojiFor(id); setSelectedMsg(null); }}
            onReact={(emoji) => react(msg.id, emoji)}
            replyMsg={msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{ background: 'var(--tnt-sidebar)', borderTop: '1px solid var(--tnt-border)' }}
        >
          <Reply size={16} style={{ color: 'var(--tnt-accent)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: 'var(--tnt-accent)' }}>{replyTo.sender.display_name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--tnt-text-muted)' }}>{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ color: 'var(--tnt-text-muted)' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Ввод */}
      <div
        className="flex items-end gap-2 px-3 py-2"
        style={{ background: 'var(--tnt-sidebar)', borderTop: '1px solid var(--tnt-border)' }}
      >
        <button className="p-2 flex-shrink-0" style={{ color: 'var(--tnt-text-muted)' }}>
          <Smile size={22} />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Сообщение..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none"
          style={{ background: 'var(--tnt-input)', color: 'var(--tnt-text)', border: '1px solid var(--tnt-border)' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="p-2.5 rounded-full flex-shrink-0 disabled:opacity-40 transition-opacity"
          style={{ background: 'var(--tnt-accent)' }}
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:opacity-80"
      style={{ color: danger ? '#ef4444' : 'var(--tnt-text)' }}
    >
      <span style={{ color: danger ? '#ef4444' : 'var(--tnt-text-muted)' }}>{icon}</span>
      {label}
    </button>
  );
}

function MessageBubble({
  msg, prev, currentUserId, isSelected, emojiOpen,
  onSelect, onReply, onDelete, onEmojiOpen, onReact, replyMsg
}: {
  msg: Message; prev?: Message; currentUserId: string;
  isSelected: boolean; emojiOpen: boolean;
  onSelect: (id: string) => void; onReply: () => void;
  onDelete: () => void; onEmojiOpen: (id: string) => void;
  onReact: (emoji: string) => void; replyMsg?: Message;
}) {
  const isMine = msg.is_mine;
  const showAvatar = !isMine && (!prev || prev.sender_id !== msg.sender_id);

  const readStatus = isMine ? (
    msg.is_read
      ? <span style={{ color: 'var(--tnt-read)' }} title={`Прочитано`}>✓✓</span>
      : <span style={{ color: 'var(--tnt-text-muted)' }}>✓</span>
  ) : null;

  const reactions = Object.entries(msg.reactions || {});

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-1 group`}>
      {!isMine && (
        <div style={{ width: 28 }}>
          {showAvatar && (
            <Avatar url={msg.sender.avatar_url} name={msg.sender.display_name} size={28} />
          )}
        </div>
      )}
      <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Reply */}
        {replyMsg && (
          <div
            className="text-xs px-2 py-1 rounded-lg mb-1 max-w-full truncate"
            style={{ background: 'var(--tnt-input)', color: 'var(--tnt-text-muted)', borderLeft: '2px solid var(--tnt-accent)' }}
          >
            <span style={{ color: 'var(--tnt-accent)' }}>{replyMsg.sender.display_name}: </span>
            {replyMsg.is_deleted ? '[Удалено]' : replyMsg.content}
          </div>
        )}

        {/* Bubble */}
        <div
          className="relative rounded-2xl px-3 py-2 cursor-pointer select-none"
          style={{
            background: isMine ? 'var(--tnt-msg-out)' : 'var(--tnt-msg-in)',
            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            minWidth: 60,
          }}
          onDoubleClick={() => onEmojiOpen(msg.id)}
          onClick={(e) => { e.stopPropagation(); onSelect(msg.id); }}
        >
          {msg.is_deleted ? (
            <p className="text-sm italic" style={{ color: 'var(--tnt-text-muted)' }}>Сообщение удалено</p>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ color: 'var(--tnt-text)' }}>
              {msg.content}
            </p>
          )}
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px]" style={{ color: 'var(--tnt-text-muted)' }}>
              {formatTime(msg.created_at)}
            </span>
            {readStatus}
          </div>
        </div>

        {/* Реакции */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={(e) => { e.stopPropagation(); onReact(emoji); }}
                className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs"
                style={{
                  background: data.mine ? 'var(--tnt-accent)' : 'var(--tnt-card)',
                  color: data.mine ? '#fff' : 'var(--tnt-text)',
                  border: `1px solid ${data.mine ? 'var(--tnt-accent)' : 'var(--tnt-border)'}`,
                }}
                title={data.users.join(', ')}
              >
                {emoji} {data.count}
              </button>
            ))}
          </div>
        )}

        {/* Emoji picker */}
        {emojiOpen && (
          <div
            className="flex gap-1 mt-1 p-2 rounded-2xl shadow-xl z-50"
            style={{ background: 'var(--tnt-card)', border: '1px solid var(--tnt-border)' }}
            onClick={e => e.stopPropagation()}
          >
            {EMOJIS.map(e => (
              <button key={e} onClick={() => onReact(e)} className="text-lg hover:scale-125 transition-transform">
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Контекстное меню */}
        {isSelected && !emojiOpen && (
          <div
            className="flex items-center gap-1 mt-1 rounded-xl overflow-hidden shadow-xl z-50"
            style={{ background: 'var(--tnt-card)', border: '1px solid var(--tnt-border)' }}
            onClick={e => e.stopPropagation()}
          >
            <CtxBtn onClick={() => onEmojiOpen(msg.id)} icon="😊" label="Реакция" />
            <CtxBtn onClick={onReply} icon={<Reply size={15} />} label="Ответить" />
            {msg.is_mine && !msg.is_deleted && (
              <CtxBtn onClick={onDelete} icon={<Trash2 size={15} />} label="Удалить" danger />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CtxBtn({ onClick, icon, label, danger }: { onClick: () => void; icon: React.ReactNode; label: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-3 py-2 text-xs hover:opacity-70"
      style={{ color: danger ? '#ef4444' : 'var(--tnt-text)' }}
    >
      <span>{icon}</span>
      <span style={{ fontSize: 10 }}>{label}</span>
    </button>
  );
}