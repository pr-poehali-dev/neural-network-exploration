import { useState, useEffect } from 'react';
import { getStoredUser, isLoggedIn, setStoredUser } from '@/store/auth';
import { User, Chat } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import Auth from './Auth';
import ChatList from './ChatList';
import ChatView from './ChatView';
import ProfileView from './ProfileView';
import Settings from './Settings';

type Screen =
  | { type: 'chatlist' }
  | { type: 'chat'; chatId: string; partner: Chat['partner'] }
  | { type: 'profile'; userId: string }
  | { type: 'settings' };

export default function Index() {
  const [authed, setAuthed] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [screen, setScreen] = useState<Screen>({ type: 'chatlist' });
  const { theme } = useTheme();

  // Применяем тему при старте
  useEffect(() => {
    const saved = localStorage.getItem('tnt_theme') || 'dark';
    const fakeEvent = new Event('apply-theme');
    document.dispatchEvent(fakeEvent);
    // Принудительно применяем тему через CSS класс на html
    document.documentElement.setAttribute('data-tnt-theme', saved);
  }, [theme]);

  if (!authed || !currentUser) {
    return (
      <Auth onAuth={() => {
        setAuthed(true);
        setCurrentUser(getStoredUser());
      }} />
    );
  }

  function openChat(chatId: string, partner: Chat['partner']) {
    setScreen({ type: 'chat', chatId, partner });
  }

  function renderScreen() {
    switch (screen.type) {
      case 'chatlist':
        return (
          <ChatList
            currentUser={currentUser!}
            onOpenChat={openChat}
            onOpenSettings={() => setScreen({ type: 'settings' })}
            onOpenProfile={() => setScreen({ type: 'profile', userId: currentUser!.id })}
          />
        );

      case 'chat':
        return (
          <ChatView
            chatId={screen.chatId}
            partner={screen.partner}
            currentUser={currentUser!}
            onBack={() => setScreen({ type: 'chatlist' })}
            onOpenProfile={(uid) => setScreen({ type: 'profile', userId: uid })}
          />
        );

      case 'profile':
        return (
          <ProfileView
            userId={screen.userId}
            currentUser={currentUser!}
            onBack={() => setScreen({ type: 'chatlist' })}
            isSelf={screen.userId === currentUser!.id}
            onOpenChat={openChat}
            onUserUpdated={(updated) => {
              const merged = { ...currentUser!, ...updated };
              setCurrentUser(merged);
              setStoredUser(merged);
            }}
          />
        );

      case 'settings':
        return (
          <Settings
            currentUser={currentUser!}
            onBack={() => setScreen({ type: 'chatlist' })}
            onLogout={() => {
              setAuthed(false);
              setCurrentUser(null);
              setScreen({ type: 'chatlist' });
            }}
          />
        );
    }
  }

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        background: 'var(--tnt-bg)',
        // Safe area для iOS
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Desktop: 2-колоночный */}
      <div className="hidden md:flex w-full h-full">
        {/* Левая панель: всегда показываем список */}
        <div className="w-80 flex-shrink-0 h-full" style={{ borderRight: '1px solid var(--tnt-border)' }}>
          <ChatList
            currentUser={currentUser}
            onOpenChat={openChat}
            onOpenSettings={() => setScreen({ type: 'settings' })}
            onOpenProfile={() => setScreen({ type: 'profile', userId: currentUser.id })}
          />
        </div>

        {/* Правая панель */}
        <div className="flex-1 h-full relative">
          {screen.type === 'chatlist' ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--tnt-text-muted)' }}>
              <p className="text-5xl mb-4">💬</p>
              <p className="text-lg font-medium" style={{ color: 'var(--tnt-text)' }}>Тут и Там</p>
              <p className="text-sm mt-1">Выберите чат чтобы начать</p>
            </div>
          ) : renderScreen()}
        </div>
      </div>

      {/* Mobile: 1 панель */}
      <div className="flex md:hidden w-full h-full">
        {renderScreen()}
      </div>
    </div>
  );
}
