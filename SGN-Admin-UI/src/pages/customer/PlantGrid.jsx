import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useShopToast } from '../../contexts/ShopToastContext.jsx';
import {
  isCustomerLoggedIn,
  loginUrlWithRedirect,
} from '../../utils/postLoginRedirect.js';
import { mediaUrl } from '../../utils/mediaUrl.js';
import { plantId, plantName, plantPrice } from '../../utils/plantCatalog.js';
import PlantGridSkeleton from '../../components/customer/PlantGridSkeleton.jsx';

function PlantCard({ plant, showAddToCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role } = useAuth();
  const { addToCart, openCart } = useCart();
  const toast = useShopToast();
  const id = plantId(plant);
  const name = plantName(plant);
  const price = plantPrice(plant);
  const img = plant.imageUrl ?? plant.ImageUrl;
  const stock = plant.stockQuantity ?? plant.StockQuantity ?? 0;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (stock < 1) {
      toast.error('This plant is out of stock.');
      return;
    }
    if (!isCustomerLoggedIn(token, role)) {
      navigate(loginUrlWithRedirect(location.pathname, location.search));
      return;
    }
    addToCart(plant, 1);
    toast.success(`“${name}” added to cart`);
    openCart();
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-shop border border-brand-border bg-white shadow-shop transition-all duration-300 ease-out hover:z-[1] hover:scale-[1.05] hover:shadow-shop-hover">
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        {img ? (
          <img
            src={mediaUrl(img)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold text-slate-900">
          {name}
        </h3>
        <p className="text-lg font-bold text-brand">
          Rs. {price.toFixed(2)}
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <Link
            to={`/customer/plants/${id}`}
            className="inline-flex justify-center rounded-shop border-2 border-brand bg-white px-4 py-2.5 text-center text-sm font-semibold text-brand transition-all duration-300 ease-out hover:bg-brand-surface"
          >
            View details
          </Link>
          {showAddToCart && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock < 1}
              className="inline-flex justify-center rounded-shop bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-shop border border-dashed border-brand-border bg-white px-6 py-16 text-center shadow-shop">
      <p className="text-lg font-semibold text-brand">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

export default function PlantGrid({
  plants,
  loading,
  error,
  showAddToCart = true,
  skeletonCount = 8,
  emptyTitle = 'Nothing to show yet',
  emptyDescription = 'Try another category or check back soon for new arrivals.',
  className = '',
}) {
  if (loading) {
    return <PlantGridSkeleton count={skeletonCount} />;
  }
  if (error) {
    return (
      <div className="rounded-shop border border-red-200 bg-red-50 p-4 text-red-800">
        {error}
      </div>
    );
  }
  if (!plants?.length) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }
  return (
    <div
      className={`grid grid-cols-1 gap-5 overflow-visible sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {plants.map((p) => (
        <div key={plantId(p)} className="shop-slide-up">
          <PlantCard plant={p} showAddToCart={showAddToCart} />
        </div>
      ))}
    </div>
  );
}
