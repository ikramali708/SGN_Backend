import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { mediaUrl } from '../../utils/mediaUrl.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useShopToast } from '../../contexts/ShopToastContext.jsx';
import {
  isCustomerLoggedIn,
  loginUrlWithRedirect,
} from '../../utils/postLoginRedirect.js';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-shop bg-slate-200" />
        <div className="space-y-4">
          <div className="h-10 w-[75%] animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-24 animate-pulse rounded-shop bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function CustomerPlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role } = useAuth();
  const toast = useShopToast();
  const { addToCart, openCart } = useCart();
  const [plant, setPlant] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/api/plants/${id}`);
        if (!cancelled) {
          setPlant(data);
          setQty(1);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || 'Plant not found.'
          );
          setPlant(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }
  if (error || !plant) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-shop border border-red-200 bg-red-50 p-4 text-red-800">
          {error || 'Plant not found.'}
        </div>
        <Link
          to="/customer/plants"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Back to plants
        </Link>
      </div>
    );
  }

  const stock = plant.stockQuantity ?? plant.StockQuantity ?? 0;
  const name = plant.plantName ?? plant.PlantName;
  const price = plant.price ?? plant.Price;
  const desc = plant.description ?? plant.Description ?? '';
  const nursery = plant.nurseryName ?? plant.NurseryName ?? '—';
  const img = plant.imageUrl ?? plant.ImageUrl;

  function clampQty(n) {
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(n, Math.max(1, stock));
  }

  function requireCustomerOrRedirect() {
    if (!isCustomerLoggedIn(token, role)) {
      navigate(loginUrlWithRedirect(location.pathname, location.search), {
        replace: false,
      });
      return false;
    }
    return true;
  }

  function bump(delta) {
    setQty((q) => clampQty(q + delta));
  }

  function handleAddToCart() {
    if (stock < 1) {
      toast.error('This plant is out of stock.');
      return;
    }
    if (!requireCustomerOrRedirect()) return;
    setBusy(true);
    try {
      addToCart(plant, clampQty(qty));
      toast.success(`“${name}” added to your cart`);
      openCart();
    } finally {
      setBusy(false);
    }
  }

  function handleOrderNow() {
    if (stock < 1) {
      toast.error('This plant is out of stock.');
      return;
    }
    if (!requireCustomerOrRedirect()) return;
    setBusy(true);
    try {
      addToCart(plant, clampQty(qty));
      openCart();
      toast.success('Review your cart and tap Checkout when ready.');
    } finally {
      setBusy(false);
    }
  }

  const inStock = stock > 0;
  const stockLabel = inStock
    ? `${stock} available — in stock`
    : 'Currently out of stock';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 shop-fade-in">
      <Link
        to="/customer/plants"
        className="mb-6 inline-block text-sm font-semibold text-brand hover:underline"
      >
        ← Back to plants
      </Link>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-shop border border-brand-border bg-white shadow-shop">
          {img ? (
            <img
              src={mediaUrl(img)}
              alt=""
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-brand-surface text-slate-400">
              No image
            </div>
          )}
        </div>
        <div className="space-y-5 shop-slide-up">
          <h1 className="text-3xl font-bold text-brand lg:text-4xl">{name}</h1>
          <p className="text-slate-600">
            <span className="font-semibold text-slate-800">Nursery:</span>{' '}
            {nursery}
          </p>
          <p className="text-3xl font-bold text-brand">
            Rs. {Number(price).toFixed(2)}
          </p>
          <p
            className={`inline-flex rounded-shop border px-3 py-1.5 text-sm font-semibold ${
              inStock
                ? 'border-brand-border bg-brand-surface text-brand'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {stockLabel}
          </p>
          {desc && (
            <p className="whitespace-pre-wrap text-slate-700">{desc}</p>
          )}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Quantity</p>
            <div className="inline-flex items-center gap-0 overflow-hidden rounded-shop border border-brand-border bg-white shadow-shop">
              <button
                type="button"
                disabled={!inStock || qty <= 1 || busy}
                onClick={() => bump(-1)}
                className="rounded-l-xl px-4 py-3 text-lg font-bold text-brand transition-all duration-300 ease-out hover:bg-brand-surface disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-[3rem] select-none px-2 py-3 text-center text-lg font-bold text-slate-800">
                {qty}
              </span>
              <button
                type="button"
                disabled={!inStock || qty >= stock || busy}
                onClick={() => bump(1)}
                className="rounded-r-xl px-4 py-3 text-lg font-bold text-brand transition-all duration-300 ease-out hover:bg-brand-surface disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock || busy}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-shop border-2 border-brand bg-white px-6 py-3 font-semibold text-brand transition-all duration-300 ease-out hover:bg-brand-surface disabled:opacity-50"
            >
              {busy && <Spinner className="!h-5 !w-5 border-2 border-brand border-t-transparent" />}
              Add to cart
            </button>
            <button
              type="button"
              onClick={handleOrderNow}
              disabled={!inStock || busy}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-shop bg-brand px-6 py-3 font-semibold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light disabled:opacity-50"
            >
              {busy && <Spinner className="!h-5 !w-5 border-2 border-white border-t-transparent" />}
              Order now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
