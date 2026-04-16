import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

const ShopToastContext = createContext(null);

export function ShopToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4200);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ShopToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2 p-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'shop-toast-item pointer-events-auto rounded-shop border px-4 py-3 text-sm font-medium shadow-shop transition-all duration-300 ease-out',
              t.type === 'success'
                ? 'border-brand-border bg-white text-brand'
                : 'border-red-200 bg-red-50 text-red-800',
            ].join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ShopToastContext.Provider>
  );
}

export function useShopToast() {
  const ctx = useContext(ShopToastContext);
  if (!ctx) {
    throw new Error('useShopToast must be used within ShopToastProvider');
  }
  return ctx;
}
