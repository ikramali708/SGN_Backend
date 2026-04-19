import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

const items = [
  { to: '/customer/account/profile', label: 'My Profile' },
  { to: '/customer/account/plant-disease', label: 'Plant Disease Detector' },
  { to: '/customer/account/orders', label: 'My Orders' },
  { to: '/customer/account/cancelled', label: 'Cancelled Orders' },
  { to: '/customer/support', label: 'Support' },
];

export default function CustomerAccountSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/customer-dashboard', { replace: true });
  }

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white lg:w-56 lg:border-b-0 lg:border-r lg:border-slate-200 lg:bg-slate-50/50">
      <nav className="flex flex-row gap-1 overflow-x-auto p-3 lg:flex-col lg:gap-1 lg:p-4">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition lg:whitespace-normal',
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-700 hover:bg-white hover:shadow-sm',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50 lg:whitespace-normal"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
