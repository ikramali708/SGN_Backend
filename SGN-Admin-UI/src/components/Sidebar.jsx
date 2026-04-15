import { NavLink } from 'react-router-dom';

const linksByRole = {
  Admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/nurseries', label: 'Nurseries' },
    { to: '/admin/plants', label: 'Plants' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/categories', label: 'Categories' },
  ],
  NurseryOwner: [
    { to: '/nursery/dashboard', label: 'Dashboard' },
    { to: '/nursery/plants', label: 'Plants' },
    { to: '/nursery/inventory', label: 'Inventory' },
    { to: '/nursery/orders', label: 'Orders' },
    { to: '/nursery/profile', label: 'Profile' },
  ],
};

export default function Sidebar({ role, open, onNavigate }) {
  const links = linksByRole[role] ?? linksByRole.Admin;
  const title = role === 'NurseryOwner' ? 'SGN Nursery' : 'SGN Admin';

  return (
    <aside
      className={[
        'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r-2 border-primary/30 bg-primary text-white shadow-lg transition-transform duration-200 lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      <div className="border-b border-white/10 px-5 py-6">
        <h1 className="text-lg font-bold tracking-tight text-secondary">
          {title}
        </h1>
        <p className="mt-1 text-xs text-white/70">Plant &amp; nursery portal</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'block rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-white text-primary shadow'
                  : 'text-white/90 hover:bg-white/10',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
