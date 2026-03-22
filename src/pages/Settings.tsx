import { ArrowLeft, Moon, Sun, Palette } from 'lucide-react';
import { Theme } from '@/types';
import { User } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { clearAuth } from '@/store/auth';

interface Props {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
}

const THEME_LABELS: Record<Theme, { label: string; preview: string[] }> = {
  dark: { label: 'Тёмная', preview: ['#17212b', '#232e3c', '#2cb2e4'] },
  light: { label: 'Светлая', preview: ['#f0f2f5', '#ffffff', '#2cb2e4'] },
  blue: { label: 'Синяя', preview: ['#1a1f2e', '#1e2640', '#5865f2'] },
  green: { label: 'Зелёная', preview: ['#0d1f13', '#132219', '#3ba55c'] },
  purple: { label: 'Фиолетовая', preview: ['#1a0a2e', '#22103c', '#9c27b0'] },
  rose: { label: 'Розовая', preview: ['#1f0a14', '#2e1220', '#e91e63'] },
};

export default function Settings({ currentUser, onBack, onLogout }: Props) {
  const { theme, setTheme, themes } = useTheme();

  function handleLogout() {
    clearAuth();
    onLogout();
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--tnt-bg)' }}>
      {/* Заголовок */}
      <div
        className="flex items-center gap-3 px-3 py-2.5"
        style={{ background: 'var(--tnt-sidebar)', borderBottom: '1px solid var(--tnt-border)' }}
      >
        <button onClick={onBack} className="p-1" style={{ color: 'var(--tnt-accent)' }}>
          <ArrowLeft size={22} />
        </button>
        <span className="font-semibold flex-1" style={{ color: 'var(--tnt-text)' }}>Настройки</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Пользователь */}
        <div className="rounded-xl p-4" style={{ background: 'var(--tnt-sidebar)' }}>
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--tnt-text-muted)' }}>Аккаунт</p>
          <p className="font-medium" style={{ color: 'var(--tnt-text)' }}>{currentUser.display_name}</p>
          <p className="text-sm" style={{ color: 'var(--tnt-text-muted)' }}>@{currentUser.username}</p>
        </div>

        {/* Темы */}
        <div className="rounded-xl p-4" style={{ background: 'var(--tnt-sidebar)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Palette size={16} style={{ color: 'var(--tnt-accent)' }} />
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--tnt-text-muted)' }}>Тема оформления</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(t => {
              const info = THEME_LABELS[t];
              const isActive = theme === t;
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="rounded-xl p-3 flex items-center gap-3 transition-all"
                  style={{
                    background: isActive ? info.preview[1] : 'var(--tnt-input)',
                    border: `2px solid ${isActive ? info.preview[2] : 'transparent'}`,
                  }}
                >
                  <div className="flex gap-1">
                    {info.preview.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="text-sm font-medium" style={{ color: isActive ? info.preview[2] : 'var(--tnt-text)' }}>
                    {info.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Режим */}
        <div className="rounded-xl p-4" style={{ background: 'var(--tnt-sidebar)' }}>
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--tnt-text-muted)' }}>Режим</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('dark')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{
                background: theme === 'dark' ? 'var(--tnt-accent)' : 'var(--tnt-input)',
                color: theme === 'dark' ? '#fff' : 'var(--tnt-text)',
              }}
            >
              <Moon size={16} /> Тёмный
            </button>
            <button
              onClick={() => setTheme('light')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
              style={{
                background: theme === 'light' ? 'var(--tnt-accent)' : 'var(--tnt-input)',
                color: theme === 'light' ? '#fff' : 'var(--tnt-text)',
              }}
            >
              <Sun size={16} /> Светлый
            </button>
          </div>
        </div>

        {/* О приложении */}
        <div className="rounded-xl p-4" style={{ background: 'var(--tnt-sidebar)' }}>
          <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--tnt-text-muted)' }}>О приложении</p>
          <p className="font-medium" style={{ color: 'var(--tnt-text)' }}>Тут и Там</p>
          <p className="text-sm" style={{ color: 'var(--tnt-text-muted)' }}>Безопасный мессенджер · v1.0</p>
        </div>

        {/* Выход */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl text-center font-medium"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
