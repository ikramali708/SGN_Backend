import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback((plant, quantity = 1) => {
    const plantId = plant.plantId ?? plant.PlantId;
    const maxStock = plant.stockQuantity ?? plant.StockQuantity ?? 999;
    const plantName = plant.plantName ?? plant.PlantName ?? 'Plant';
    const price = plant.price ?? plant.Price ?? 0;
    const imageUrl = plant.imageUrl ?? plant.ImageUrl ?? '';
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.plantId === plantId);
      if (idx === -1) {
        const qty = Math.min(Math.max(1, quantity), maxStock);
        return [
          ...prev,
          { plantId, plantName, price, imageUrl, quantity: qty, maxStock },
        ];
      }
      const next = [...prev];
      const merged = Math.min(next[idx].quantity + quantity, maxStock);
      next[idx] = {
        ...next[idx],
        maxStock,
        quantity: Math.max(1, merged),
      };
      return next;
    });
  }, []);

  const setLineQuantity = useCallback((plantId, quantity) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.plantId === plantId);
      if (idx === -1) return prev;
      const maxStock = prev[idx].maxStock ?? 999;
      const qty = Math.min(Math.max(1, quantity), maxStock);
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: qty };
      return next;
    });
  }, []);

  const removeLine = useCallback((plantId) => {
    setItems((prev) => prev.filter((i) => i.plantId !== plantId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      setLineQuantity,
      removeLine,
      clearCart,
      cartCount: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      cartOpen,
      openCart,
      closeCart,
    }),
    [
      items,
      addToCart,
      setLineQuantity,
      removeLine,
      clearCart,
      cartOpen,
      openCart,
      closeCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
