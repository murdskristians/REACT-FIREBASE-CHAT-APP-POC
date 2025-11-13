import type firebaseCompat from 'firebase/compat/app';

type ActiveApp = 'chat' | 'profile';

type AppDockProps = {
  user: firebaseCompat.User;
  activeApp: ActiveApp;
  onSelectApp: (app: ActiveApp) => void;
  onOpenProfile: () => void;
};

type DockItem = {
  id: 'spreadsheets' | 'chat' | 'contacts';
  label: string;
  icon: string;
};

const DOCK_ITEMS: DockItem[] = [
  { id: 'spreadsheets', label: 'Spreadsheets', icon: '📊' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'contacts', label: 'Contacts', icon: '👥' },
];

export function AppDock({ user, activeApp, onSelectApp, onOpenProfile }: AppDockProps) {
  const initials = (user.displayName ?? user.email ?? 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleDockClick = (id: DockItem['id']) => {
    if (id === 'chat') {
      onSelectApp('chat');
    }
  };

  return (
    <aside className="dock">
      <div className="dock__logo">PC</div>
      <nav className="dock__nav" aria-label="Applications">
        {DOCK_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dock__item ${
              item.id === 'chat' && activeApp === 'chat' ? 'dock__item--active' : ''
            }`}
            aria-pressed={item.id === 'chat' && activeApp === 'chat'}
            onClick={() => handleDockClick(item.id)}
          >
            <span aria-hidden="true" className="dock__item-icon">
              {item.icon}
            </span>
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </nav>
      <button
        type="button"
        className={`dock__user ${activeApp === 'profile' ? 'dock__item--active' : ''}`}
        onClick={onOpenProfile}
        title="Open profile"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName ?? 'Current user'} />
        ) : (
          <span>{initials}</span>
        )}
        <span className="dock__status-indicator" aria-hidden="true" />
      </button>
    </aside>
  );
}

