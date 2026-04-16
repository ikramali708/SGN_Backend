import { Outlet } from 'react-router-dom';
import CustomerShopHeader from '../components/customer/CustomerShopHeader.jsx';
import CustomerShopFooter from '../components/customer/CustomerShopFooter.jsx';
import CustomerAccountSidebar from '../components/customer/CustomerAccountSidebar.jsx';

export default function CustomerAccountLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-surface">
      <CustomerShopHeader variant="account" />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row">
        <CustomerAccountSidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <CustomerShopFooter />
    </div>
  );
}
