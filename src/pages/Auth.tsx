import { useState } from 'react';
import { api } from '@/api';
import { setToken, setStoredUser } from '@/store/auth';

interface Props {
  onAuth: () => void;
}

export default function Auth({ onAuth }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', display_name: '', password: '', phone: '' });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = isRegister
        ? await api.auth.register(form)
        : await api.auth.login({ username: form.username, password: form.password });
      setToken(data.token);
      setStoredUser(data.user);
      onAuth();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--tnt-bg)' }}>
      <div className="w-full max-w-sm">
        {/* Лого */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl"
            style={{ background: 'var(--tnt-accent)' }}
          >
            ТТ
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--tnt-text)' }}>Тут и Там</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--tnt-text-muted)' }}>
            Безопасный мессенджер
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--tnt-sidebar)' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--tnt-text)' }}>
              {isRegister ? 'Регистрация' : 'Вход'}
            </h2>

            <input
              type="text"
              placeholder="Имя пользователя"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--tnt-input)',
                color: 'var(--tnt-text)',
                border: '1px solid var(--tnt-border)',
              }}
              autoComplete="username"
              required
            />

            {isRegister && (
              <>
                <input
                  type="text"
                  placeholder="Имя (отображаемое)"
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--tnt-input)', color: 'var(--tnt-text)', border: '1px solid var(--tnt-border)' }}
                  required
                />
                <input
                  type="tel"
                  placeholder="Телефон (необязательно)"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--tnt-input)', color: 'var(--tnt-text)', border: '1px solid var(--tnt-border)' }}
                />
              </>
            )}

            <input
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--tnt-input)', color: 'var(--tnt-text)', border: '1px solid var(--tnt-border)' }}
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: 'var(--tnt-accent)' }}
            >
              {loading ? '...' : isRegister ? 'Создать аккаунт' : 'Войти'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setIsRegister(r => !r); setError(''); }}
            className="w-full text-center text-sm py-2"
            style={{ color: 'var(--tnt-accent)' }}
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </form>

        {isRegister && (
          <div
            className="mt-4 rounded-2xl p-4 text-sm"
            style={{ background: 'var(--tnt-sidebar)', color: 'var(--tnt-text-muted)' }}
          >
            <p className="font-medium mb-2" style={{ color: 'var(--tnt-accent)' }}>🤖 СтикерБот</p>
            <p>После регистрации в ваших чатах появится официальный бот для создания стикеров из фото, видео и GIF!</p>
          </div>
        )}
      </div>
    </div>
  );
}
