import { useEffect, useState } from 'react';
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
import {
  citiesForProvince,
  CITY_OTHER,
  DEFAULT_SHIPPING_COUNTRY,
  PAKISTAN_PROVINCES,
} from '../data/pakistanShippingLocations.js';

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
  const [province, setProvince] = useState('');
  const [citySelect, setCitySelect] = useState('');
  const [cityOther, setCityOther] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cityOptions = citiesForProvince(province);

  useEffect(() => {
    if (!province) {
      setCitySelect('');
      setCityOther('');
      return;
    }
    const opts = citiesForProvince(province);
    if (!opts.length) return;
    const stillValid = opts.some((o) => o.value === citySelect);
    if (!stillValid) setCitySelect(opts[0].value);
  }, [province]);

  if (!cartOpen) return null;

  function resetShippingForm() {
    setProvince('');
    setCitySelect('');
    setCityOther('');
    setFullAddress('');
    setReceiverPhone('');
    setComment('');
  }

  function validateShipping() {
    if (!province) return 'Please select a state or province.';
    const resolvedCity =
      citySelect === CITY_OTHER ? cityOther.trim() : (citySelect || '').trim();
    if (!resolvedCity) return 'Please select or enter a city.';
    if (!fullAddress.trim()) return 'Please enter the full delivery address.';
    if (!receiverPhone.trim()) return 'Please enter the receiver phone number.';
    return '';
  }

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
    const shipErr = validateShipping();
    if (shipErr) {
      setError(shipErr);
      return;
    }
    const resolvedCity =
      citySelect === CITY_OTHER ? cityOther.trim() : citySelect.trim();
    const trimmedAddress = fullAddress.trim();
    const trimmedPhone = receiverPhone.trim();
    const trimmedComment = comment.trim();

    setLoading(true);
    try {
      await api.post('/api/customer/orders', {
        shippingAddress: trimmedAddress,
        country: DEFAULT_SHIPPING_COUNTRY,
        province,
        city: resolvedCity,
        fullAddress: trimmedAddress,
        phoneNumber: trimmedPhone,
        comment: trimmedComment || null,
        orderItems: items.map((i) => ({
          plantId: i.plantId,
          quantity: i.quantity,
        })),
      });
      clearCart();
      resetShippingForm();
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

  const inputBase =
    'mt-1 w-full rounded-shop border border-brand-border bg-white px-3 py-2 text-sm outline-none transition-all duration-300 ease-out focus:border-brand-light focus:ring-2 focus:ring-brand-light/40 disabled:bg-slate-100';
  const labelBase = 'block text-xs font-semibold text-slate-600';

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

          <div className="rounded-shop border border-brand-border bg-brand-surface/40 p-3 sm:p-4">
            <h3 className="text-sm font-bold text-brand">Shipping address</h3>
            <p className="mt-0.5 text-xs text-slate-600">
              COD delivery — please fill in accurate details.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className={labelBase} htmlFor="ship-country">
                  Country
                </label>
                <input
                  id="ship-country"
                  type="text"
                  readOnly
                  value={DEFAULT_SHIPPING_COUNTRY}
                  tabIndex={-1}
                  className={`${inputBase} cursor-not-allowed bg-slate-50 text-slate-700`}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor="ship-province">
                  State / province <span className="text-red-600">*</span>
                </label>
                <select
                  id="ship-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  disabled={!items.length}
                  required={items.length > 0}
                  className={inputBase}
                >
                  <option value="">Select province</option>
                  {PAKISTAN_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelBase} htmlFor="ship-city">
                  City <span className="text-red-600">*</span>
                </label>
                <select
                  id="ship-city"
                  value={citySelect}
                  onChange={(e) => setCitySelect(e.target.value)}
                  disabled={!items.length || !province}
                  required={items.length > 0 && !!province && citySelect !== CITY_OTHER}
                  className={inputBase}
                >
                  {!province ? (
                    <option value="">Select province first</option>
                  ) : (
                    cityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))
                  )}
                </select>
                {citySelect === CITY_OTHER && (
                  <input
                    type="text"
                    value={cityOther}
                    onChange={(e) => setCityOther(e.target.value)}
                    placeholder="Enter city name"
                    className={`${inputBase} mt-2`}
                    autoComplete="address-level2"
                  />
                )}
              </div>
            </div>

            <div className="mt-3">
              <label className={labelBase} htmlFor="ship-full-address">
                Full address <span className="text-red-600">*</span>
              </label>
              <textarea
                id="ship-full-address"
                rows={3}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                disabled={!items.length}
                required={items.length > 0}
                className={inputBase}
                placeholder="House / street / area / landmark…"
              />
            </div>

            <div className="mt-3">
              <label className={labelBase} htmlFor="ship-phone">
                Receiver phone number <span className="text-red-600">*</span>
              </label>
              <input
                id="ship-phone"
                type="tel"
                inputMode="tel"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                disabled={!items.length}
                required={items.length > 0}
                className={inputBase}
                placeholder="03xx…"
                autoComplete="tel"
              />
            </div>

            <div className="mt-3">
              <label className={labelBase} htmlFor="ship-comment">
                Comment <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="ship-comment"
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!items.length}
                className={inputBase}
                placeholder="Delivery notes, gate code, etc."
              />
            </div>
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
