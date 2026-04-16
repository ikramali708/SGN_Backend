import { Outlet } from 'react-router-dom';
import CustomerShopHeader from '../components/customer/CustomerShopHeader.jsx';
import CustomerShopFooter from '../components/customer/CustomerShopFooter.jsx';

export default function CustomerPublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerShopHeader variant="public" />
      <main className="flex-1 shop-fade-in">
        <Outlet />
      </main>
      <CustomerShopFooter />
    </div>
  );
}
