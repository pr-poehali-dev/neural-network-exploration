import { useState } from "react";
import {
  Shield,
  Zap,
  Lock,
  Globe,
  Users,
  Mic,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Hash,
  ArrowRight,
  Send,
  Key,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#17212b] text-white overflow-x-hidden">
      {/* Навигация в стиле Telegram */}
      <nav className="bg-[#232e3c] border-b border-[#0d1117] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#2cb2e4] rounded-full flex items-center justify-center">
              <Icon name="Send" size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">СекурМессенджер</h1>
              <p className="text-xs text-[#8c9ab0] hidden sm:block">Безопасная связь для вашей команды</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Button variant="ghost" className="text-[#8c9ab0] hover:text-white hover:bg-[#2b3a4a]">
              <Icon name="Shield" size={16} />
              <span className="ml-2">Безопасность</span>
            </Button>
            <Button className="bg-[#2cb2e4] hover:bg-[#1a9fd3] text-white px-6 py-2 rounded text-sm font-medium">
              Попробовать
            </Button>
          </div>
          <Button
            variant="ghost"
            className="sm:hidden text-[#8c9ab0] hover:text-white hover:bg-[#2b3a4a] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-[#0d1117]">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" className="text-[#8c9ab0] hover:text-white hover:bg-[#2b3a4a] justify-start">
                <Icon name="Shield" size={16} />
                <span className="ml-2">Безопасность</span>
              </Button>
              <Button className="bg-[#2cb2e4] hover:bg-[#1a9fd3] text-white px-6 py-2 rounded text-sm font-medium">
                Попробовать
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Макет в стиле Telegram */}
      <div className="flex min-h-screen">
        {/* Боковая панель серверов */}
        <div className="hidden lg:flex w-[72px] bg-[#0d1117] flex-col items-center py-3 gap-2">
          <div className="w-12 h-12 bg-[#2cb2e4] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
            <Icon name="Send" size={22} />
          </div>
          <div className="w-8 h-[2px] bg-[#232e3c] rounded-full"></div>
          {[
            { icon: "Lock", label: "Приватный" },
            { icon: "Globe", label: "Регионы" },
            { icon: "Users", label: "Группы" },
            { icon: "Server", label: "Сервер" },
          ].map((item, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-[#232e3c] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#2cb2e4]"
              title={item.label}
            >
              <Icon name={item.icon} size={20} />
            </div>
          ))}
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Боковая панель каналов */}
          <div
            className={`${mobileSidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-60 bg-[#232e3c] flex flex-col`}
          >
            <div className="p-4 border-b border-[#0d1117] flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">СекурМессенджер</h2>
              <Button
                variant="ghost"
                className="lg:hidden text-[#8c9ab0] hover:text-white hover:bg-[#2b3a4a] p-1"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-2">
              <div className="mb-4">
                <div className="flex items-center gap-1 px-2 py-1 text-[#8c9ab0] text-xs font-semibold uppercase tracking-wide">
                  <ArrowRight className="w-3 h-3" />
                  <span>Чаты</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {["главная", "новости", "безопасность", "поддержка"].map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[#8c9ab0] hover:text-[#dcddde] hover:bg-[#2b3a4a] cursor-pointer"
                    >
                      <Hash className="w-4 h-4" />
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 px-2 py-1 text-[#8c9ab0] text-xs font-semibold uppercase tracking-wide">
                  <ArrowRight className="w-3 h-3" />
                  <span>Голосовые</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {["Общий", "Защищённый"].map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-[#8c9ab0] hover:text-[#dcddde] hover:bg-[#2b3a4a] cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Область пользователя */}
            <div className="p-2 bg-[#1a2533] flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2cb2e4] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">А</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">Администратор</div>
                <div className="text-[#8c9ab0] text-xs truncate">В сети</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#2b3a4a]">
                  <Mic className="w-4 h-4 text-[#8c9ab0]" />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#2b3a4a]">
                  <Settings className="w-4 h-4 text-[#8c9ab0]" />
                </Button>
              </div>
            </div>
          </div>

          {/* Область чата */}
          <div className="flex-1 flex flex-col">
            {/* Заголовок чата */}
            <div className="h-12 bg-[#17212b] border-b border-[#0d1117] flex items-center px-4 gap-2">
              <Button
                variant="ghost"
                className="lg:hidden text-[#8c9ab0] hover:text-[#dcddde] hover:bg-[#2b3a4a] p-1 mr-2"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Hash className="w-5 h-5 text-[#8c9ab0]" />
              <span className="text-white font-semibold">главная</span>
              <div className="w-px h-6 bg-[#2b3a4a] mx-2 hidden sm:block"></div>
              <span className="text-[#8c9ab0] text-sm hidden sm:block">Безопасная связь для всех регионов страны</span>
              <div className="ml-auto flex items-center gap-2 sm:gap-4">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#8c9ab0] cursor-pointer hover:text-[#dcddde]" />
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#8c9ab0] cursor-pointer hover:text-[#dcddde]" />
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#8c9ab0] cursor-pointer hover:text-[#dcddde]" />
              </div>
            </div>

            {/* Сообщения чата */}
            <div className="flex-1 p-2 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto">
              {/* Приветственное сообщение бота */}
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#2cb2e4] rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Shield" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">СекурБот</span>
                    <span className="bg-[#2cb2e4] text-white text-xs px-1 rounded">БОТ</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 12:00</span>
                  </div>
                  <div className="text-[#b9bbbe] text-sm sm:text-base">
                    <p className="mb-3 sm:mb-4">
                      <strong className="text-white">Добро пожаловать в СекурМессенджер!</strong> Полностью защищённая связь, доступная из любого региона страны.
                    </p>
                    <div className="bg-[#232e3c] border-l-4 border-[#2cb2e4] p-3 sm:p-4 rounded">
                      <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Что вас защищает:</h3>
                      <ul className="space-y-1 text-xs sm:text-sm text-[#8c9ab0]">
                        <li>🔒 Сквозное шифрование всех сообщений и звонков</li>
                        <li>🌍 Работает из любой точки страны без ограничений</li>
                        <li>🏠 Сервер на вашей инфраструктуре — данные не покидают периметр</li>
                        <li>👤 Без сбора персональных данных</li>
                        <li>📵 Нет зависимости от сторонних облаков</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Демо профиля участника */}
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">К</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Кирилл</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 12:05</span>
                  </div>
                  <div className="text-[#b9bbbe] mb-3 text-sm sm:text-base">
                    Только подключился из Владивостока. Связь отличная, задержка минимальная!
                  </div>

                  {/* Карточка статуса участника */}
                  <div className="bg-[#232e3c] border border-[#0d1117] rounded-lg overflow-hidden w-full max-w-sm">
                    <div className="h-16 sm:h-20 bg-gradient-to-r from-[#2cb2e4] to-[#1a7fa8] relative">
                      <div className="absolute -bottom-3 sm:-bottom-4 left-3 sm:left-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#232e3c] bg-[#17212b] overflow-hidden relative">
                          <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl font-bold text-white">К</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#3ba55c] border-4 border-[#232e3c] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 sm:pt-6 px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-white text-lg sm:text-xl font-bold mb-1">Кирилл</h3>
                        <div className="flex items-center gap-2 text-[#8c9ab0] text-xs sm:text-sm">
                          <span>Владивосток</span>
                          <span>·</span>
                          <span className="text-[#3ba55c]">● Защищён</span>
                        </div>
                      </div>

                      <div className="mb-3 sm:mb-4">
                        <div className="bg-[#17212b] rounded-lg p-2 sm:p-3 relative">
                          <div className="absolute -top-2 left-3 sm:left-4 w-4 h-4 bg-[#17212b] rotate-45"></div>
                          <div className="flex items-center gap-2 text-[#b9bbbe] text-xs sm:text-sm">
                            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-[#2cb2e4]" />
                            <span>Соединение зашифровано</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex border-b border-[#2b3a4a] mb-3 sm:mb-4">
                        <button className="px-3 sm:px-4 py-2 text-[#8c9ab0] text-xs sm:text-sm font-medium hover:text-[#dcddde]">
                          О пользователе
                        </button>
                        <button className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium border-b-2 border-[#2cb2e4]">
                          Активность
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-[#8c9ab0] text-xs font-semibold uppercase tracking-wide mb-2 sm:mb-3">
                          <span>Статус соединения</span>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-[#17212b] rounded-lg">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2cb2e4] to-[#1a7fa8] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-xs sm:text-sm mb-1">СекурМессенджер</div>
                            <div className="text-[#b9bbbe] text-xs sm:text-sm mb-1">E2E шифрование активно</div>
                            <div className="text-[#8c9ab0] text-xs sm:text-sm mb-2">Личный сервер</div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#3ba55c] rounded-full animate-pulse"></div>
                              <span className="text-[#3ba55c] text-xs font-medium">Подключён · 12 мс</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Второе сообщение */}
              <div className="flex gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">Н</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white font-medium text-sm sm:text-base">Наталья</span>
                    <span className="text-[#72767d] text-xs hidden sm:inline">Сегодня в 12:08</span>
                  </div>
                  <div className="text-[#b9bbbe] text-sm sm:text-base">
                    Наконец-то мессенджер, которому можно доверять. Работаем из Новосибирска — никаких проблем со связью!
                  </div>
                </div>
              </div>

              {/* Секция подключения */}
              <div className="bg-[#232e3c] border border-[#0d1117] rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Icon name="Server" size={22} />
                  <span className="ml-1 text-[#2cb2e4]">Развернуть свой сервер</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2cb2e4] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-sm sm:text-base">1</span>
                    </div>
                    <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Установка сервера</h3>
                    <p className="text-[#8c9ab0] text-xs sm:text-sm">Разворачиваем на вашем оборудовании за несколько минут</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2cb2e4] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-sm sm:text-base">2</span>
                    </div>
                    <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Настройка доступа</h3>
                    <p className="text-[#8c9ab0] text-xs sm:text-sm">Добавляем пользователей, задаём роли и права</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2cb2e4] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-sm sm:text-base">3</span>
                    </div>
                    <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Начинайте общаться</h3>
                    <p className="text-[#8c9ab0] text-xs sm:text-sm">Приложение для любого устройства, связь из любого региона</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-[#2cb2e4] hover:bg-[#1a9fd3] text-white px-6 sm:px-8 py-2 sm:py-3 rounded text-sm font-medium">
                    <Icon name="Send" size={16} />
                    <span className="ml-2">Связаться с нами</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2b3a4a] text-[#8c9ab0] hover:bg-[#2b3a4a] hover:border-[#3a4a5a] px-6 sm:px-8 py-2 sm:py-3 rounded text-sm font-medium bg-transparent"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Подробнее о безопасности
                  </Button>
                </div>
              </div>

              {/* Преимущества */}
              <div className="bg-[#232e3c] border border-[#0d1117] rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Почему выбирают нас?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    {
                      icon: "Lock",
                      title: "Сквозное шифрование",
                      desc: "Все сообщения и звонки защищены E2E",
                    },
                    {
                      icon: "Globe",
                      title: "Любой регион страны",
                      desc: "Работает без ограничений по географии",
                    },
                    {
                      icon: "Server",
                      title: "Ваш собственный сервер",
                      desc: "Данные хранятся только у вас",
                    },
                    {
                      icon: "Zap",
                      title: "Высокая скорость",
                      desc: "Минимальные задержки, стабильная связь",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded hover:bg-[#2b3a4a] transition-colors"
                    >
                      <div className="text-[#2cb2e4] mt-0.5">
                        <Icon name={feature.icon} size={18} fallback="Shield" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-xs sm:text-sm">{feature.title}</div>
                        <div className="text-[#8c9ab0] text-xs sm:text-sm">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Поле ввода сообщения */}
            <div className="p-2 sm:p-4">
              <div className="bg-[#2b3a4a] rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#3ba55c] flex-shrink-0" />
                <div className="text-[#72767d] text-xs sm:text-sm flex-1">Сообщение #главная · Защищено шифрованием</div>
                <Send className="w-4 h-4 text-[#8c9ab0]" />
              </div>
            </div>
          </div>

          {/* Боковая панель участников */}
          <div className="hidden xl:block w-60 bg-[#232e3c] p-4">
            <div className="mb-4">
              <h3 className="text-[#8c9ab0] text-xs font-semibold uppercase tracking-wide mb-2">В сети — 4</h3>
              <div className="space-y-2">
                {[
                  {
                    name: "Кирилл",
                    status: "Владивосток · Защищён",
                    avatar: "К",
                    color: "from-teal-500 to-cyan-500",
                  },
                  { name: "Наталья", status: "Новосибирск · В сети", avatar: "Н", color: "from-green-500 to-teal-500" },
                  { name: "Михаил", status: "Москва · Защищён", avatar: "М", color: "from-blue-500 to-indigo-500" },
                  { name: "Администратор", status: "Управление сервером", avatar: "А", color: "from-[#2cb2e4] to-blue-600" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-[#2b3a4a] cursor-pointer">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${user.color} rounded-full flex items-center justify-center relative`}
                    >
                      <span className="text-white text-sm font-medium">{user.avatar}</span>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3ba55c] border-2 border-[#232e3c] rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{user.name}</div>
                      <div className="text-[#8c9ab0] text-xs truncate">{user.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
