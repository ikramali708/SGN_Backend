import { Outlet } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext.jsx';
import { ShopToastProvider } from '../contexts/ShopToastContext.jsx';
import CustomerCartModal from '../components/CustomerCartModal.jsx';
import ShopScrollToTop from '../components/customer/ShopScrollToTop.jsx';

export default function CustomerShopRoot() {
  return (
    <div className="customer-app min-h-screen bg-brand-surface">
      <ShopToastProvider>
        <CartProvider>
          <ShopScrollToTop />
          <Outlet />
          <CustomerCartModal />
        </CartProvider>
      </ShopToastProvider>
    </div>
  );
}
