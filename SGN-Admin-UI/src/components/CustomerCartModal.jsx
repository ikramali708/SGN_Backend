import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useShopToast } from '../contexts/ShopToastContext.jsx';
import Spinner from './Spinner.jsx';
import { mediaUrl } from '../utils/mediaUrl.js';
import {
  isCustomerLoggedIn,
  loginUrlWithRedirect,
} from '../utils/postLoginRedirect.js';

export default function CustomerCartModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useShopToast();
  const { token, role } = useAuth();
  const {
    items,
    setLineQuantity,
    removeLine,
    clearCart,
    subtotal,
    cartOpen,
    closeCart,
  } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cartOpen) return null;

  async function placeOrder(e) {
    e.preventDefault();
    setError('');
    if (!isCustomerLoggedIn(token, role)) {
      closeCart();
      navigate(loginUrlWithRedirect(location.pathname, location.search));
      return;
    }
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/customer/orders', {
        shippingAddress: shippingAddress.trim(),
        orderItems: items.map((i) => ({
          plantId: i.plantId,
          quantity: i.quantity,
        })),
      });
      clearCart();
      setShippingAddress('');
      toast.success('Order placed successfully!');
      navigate('/customer/account/orders', { replace: false });
      closeCart();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not place order.';
      setError(String(msg));
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        aria-label="Close cart"
        onClick={closeCart}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-[12px] border border-brand-border bg-white shadow-shop sm:rounded-shop">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-lg font-bold text-brand">Your cart</h2>
            <p className="text-sm font-semibold text-slate-700">
              Total:{' '}
              <span className="text-brand">Rs. {subtotal.toFixed(2)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-shop px-3 py-1.5 text-sm font-semibold text-slate-600 transition-all duration-300 ease-out hover:bg-brand-surface"
          >
            Close
          </button>
        </div>
        <form
          onSubmit={placeOrder}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5"
        >
          {error && (
            <div className="rounded-shop border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}
          {!items.length ? (
            <div className="rounded-shop border border-dashed border-brand-border bg-brand-surface px-6 py-12 text-center">
              <p className="font-semibold text-brand">Your cart is empty</p>
              <p className="mt-2 text-sm text-slate-600">
                Browse plants and tap “Add to cart” to start shopping.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((line) => (
                <li
                  key={line.plantId}
                  className="flex gap-3 rounded-shop border border-brand-border bg-brand-surface/60 p-3"
                >
                  {line.imageUrl ? (
                    <img
                      src={mediaUrl(line.imageUrl)}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-shop object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-shop bg-white text-xs text-brand">
                      —
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{line.plantName}</p>
                    <p className="text-sm text-slate-600">
                      Rs. {Number(line.price).toFixed(2)} × {line.quantity}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="text-xs text-slate-500">Qty</label>
                      <input
                        type="number"
                        min={1}
                        max={line.maxStock}
                        value={line.quantity}
                        onChange={(e) =>
                          setLineQuantity(line.plantId, Number(e.target.value) || 1)
                        }
                        className="w-20 rounded-shop border border-brand-border bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-light/40"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.plantId)}
                        className="text-xs font-semibold text-red-600 transition hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Shipping address
            </label>
            <textarea
              required={items.length > 0}
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              disabled={!items.length}
              className="mt-1 w-full rounded-shop border border-brand-border bg-white px-3 py-2 text-sm outline-none transition-all duration-300 ease-out focus:border-brand-light focus:ring-2 focus:ring-brand-light/40 disabled:bg-slate-100"
              placeholder="Street, city, phone for delivery…"
            />
          </div>
          <p className="text-sm text-slate-600">
            Payment:{' '}
            <span className="font-semibold text-brand">Cash on delivery (COD)</span>
          </p>
          <button
            type="submit"
            disabled={loading || !items.length}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-shop bg-brand py-3.5 text-sm font-bold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Spinner className="!h-5 !w-5 !border-2 !border-white !border-t-transparent" />}
            Checkout
          </button>
        </form>
      </div>
    </div>
  );
}
