import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  isCustomerLoggedIn,
  loginUrlWithRedirect,
} from '../../utils/postLoginRedirect.js';
import { useCart } from '../../contexts/CartContext.jsx';
import logoUrl from '../../assets/Logo.png';

function IconCart({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15a3 3 0 00-3-3m-6.75-3.75h11.218c1.121 0 2.1-.793 2.323-1.896l1.384-6.9A1.125 1.125 0 0018.225 4.5H5.25M8.25 18.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v-.008zm6.75-.75a.75.75 0 00-.75.75v.008a.75.75 0 00.75.75h.008a.75.75 0 00.75-.75v-.008a.75.75 0 00-.75-.75h-.008z" />
    </svg>
  );
}

function IconUser({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.5-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function IconSearch({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

export default function CustomerShopHeader({ variant = 'public' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role } = useAuth();
  const { cartCount, openCart } = useCart();
  const [search, setSearch] = useState('');
  const loggedInCustomer = isCustomerLoggedIn(token, role);

  useEffect(() => {
    if (location.pathname === '/customer/plants') {
      setSearch(new URLSearchParams(location.search).get('search') || '');
    }
  }, [location.pathname, location.search]);

  function handleProfileClick() {
    if (loggedInCustomer) {
      navigate('/customer/account/profile');
      return;
    }
    navigate(loginUrlWithRedirect(location.pathname, location.search));
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = search.trim();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    navigate(`/customer/plants?${params.toString()}`);
  }

  return (
    <header className="relative z-40 border-b border-brand-border bg-white/95 shadow-shop backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <Link
              to="/customer-dashboard"
              className="flex items-center text-lg font-bold tracking-tight text-brand sm:text-xl"
            >
              <img
                src={logoUrl}
                alt=""
                className="mr-2 h-20 w-auto shrink-0 object-contain"
                aria-hidden
              />
              Smart Green Nursery
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
              <button
                type="button"
                onClick={openCart}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 ease-out hover:bg-brand-surface"
                aria-label={`Shopping cart, ${cartCount} items`}
              >
                <IconCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={handleProfileClick}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 ease-out hover:bg-brand-surface"
                aria-label={loggedInCustomer ? 'My account' : 'Sign in'}
              >
                <IconUser className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="order-3 flex w-full min-w-0 flex-1 lg:order-2 lg:max-w-xl"
          >
            <div className="relative flex w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <IconSearch className="h-4 w-4" />
              </span>
              <input
                type="search"
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                placeholder="Search plants by name…"
                className="w-full rounded-shop border border-brand-border bg-brand-surface py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition-all duration-300 ease-out placeholder:text-slate-400 focus:border-brand-light focus:ring-2 focus:ring-brand-light/40"
                aria-label="Search plants"
              />
              <button
                type="submit"
                className="ml-2 hidden shrink-0 rounded-shop bg-brand px-4 py-2 text-sm font-semibold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light sm:inline"
              >
                Search
              </button>
            </div>
          </form>

          <div className="hidden items-center gap-1 sm:gap-2 lg:order-3 lg:flex">
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 ease-out hover:bg-brand-surface"
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <IconCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleProfileClick}
              className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 ease-out hover:bg-brand-surface"
              aria-label={loggedInCustomer ? 'My account' : 'Sign in'}
            >
              <IconUser className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {variant === 'account' && (
        <div className="border-t border-brand-border bg-brand-surface py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
          My account
        </div>
      )}
    </header>
  );
}
