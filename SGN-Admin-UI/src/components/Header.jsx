import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Header({ onMenu, role }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const heading = role === 'NurseryOwner' ? 'Nursery Portal' : 'Administration';
  const subtitle =
    role === 'NurseryOwner'
      ? 'Manage plants, inventory, and customer orders'
      : 'Manage users, nurseries, and orders';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-primary/20 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-primary/30 p-2 text-primary lg:hidden"
          aria-label="Open menu"
          onClick={onMenu}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-base font-bold text-primary sm:text-lg">
            {heading}
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            {subtitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-light sm:px-4"
      >
        Logout
      </button>
    </header>
  );
}
