import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { orderService } from '@/services/orderService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: '0.00', nombre_items: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Charger le panier depuis l'API au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Si non connecté, utiliser le localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCart({
            items: parsed.items || [],
            total: parsed.total || '0.00',
            nombre_items: parsed.nombre_items || 0,
          });
        } catch (err) {
          console.error('Erreur parsing localStorage cart:', err);
        }
      }
    }
  }, [isAuthenticated]);

  // OPTIMISATION - Mémorisation des calculs
  const total = useMemo(() => {
    return parseFloat(cart.total || '0.00');
  }, [cart.total]);

  const itemCount = useMemo(() => {
    return cart.nombre_items || 0;
  }, [cart.nombre_items]);

  /**
   * Récupérer le panier depuis l'API
   */
  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Erreur chargement panier:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement du panier');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ajouter un produit au panier
   */
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Mode déconnecté : utiliser localStorage
      setCart((prevCart) => {
        const existingItem = prevCart.items.find((item) => item.produit.id === product.id);
        
        let newItems;
        if (existingItem) {
          newItems = prevCart.items.map((item) =>
            item.produit.id === product.id
              ? { ...item, quantite: item.quantite + quantity }
              : item
          );
        } else {
          newItems = [
            ...prevCart.items,
            {
              id: Date.now(), // ID temporaire
              produit: product,
              quantite: quantity,
              prix_total: (product.prix_final || product.prix) * quantity,
            },
          ];
        }

        const newTotal = newItems.reduce(
          (sum, item) => sum + parseFloat(item.prix_total),
          0
        ).toFixed(2);

        const newCart = {
          items: newItems,
          total: newTotal,
          nombre_items: newItems.reduce((sum, item) => sum + item.quantite, 0),
        };

        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
      return;
    }

    // Mode connecté : utiliser l'API
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.addToCart(product.id, quantity);
      setCart(data);
      return data;
    } catch (err) {
      console.error('Erreur ajout au panier:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'ajout au panier';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer un produit du panier
   */
  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      // Mode déconnecté
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.id !== itemId);
        const newTotal = newItems.reduce(
          (sum, item) => sum + parseFloat(item.prix_total),
          0
        ).toFixed(2);

        const newCart = {
          items: newItems,
          total: newTotal,
          nombre_items: newItems.reduce((sum, item) => sum + item.quantite, 0),
        };

        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
      return;
    }

    // Mode connecté
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.removeFromCart(itemId);
      setCart(data);
    } catch (err) {
      console.error('Erreur suppression du panier:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour la quantité d'un produit
   */
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    if (!isAuthenticated) {
      // Mode déconnecté
      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantite: quantity,
                prix_total: (item.produit.prix_final || item.produit.prix) * quantity,
              }
            : item
        );

        const newTotal = newItems.reduce(
          (sum, item) => sum + parseFloat(item.prix_total),
          0
        ).toFixed(2);

        const newCart = {
          items: newItems,
          total: newTotal,
          nombre_items: newItems.reduce((sum, item) => sum + item.quantite, 0),
        };

        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
      return;
    }

    // Mode connecté
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.updateCartItem(itemId, quantity);
      setCart(data);
    } catch (err) {
      console.error('Erreur mise à jour quantité:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vider le panier
   */
  const clearCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: '0.00', nombre_items: 0 });
      localStorage.removeItem('cart');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await orderService.clearCart();
      setCart(data);
    } catch (err) {
      console.error('Erreur vidage panier:', err);
      setError(err.response?.data?.error || 'Erreur lors du vidage du panier');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Synchroniser le panier localStorage avec l'API après connexion
   */
  const syncCartAfterLogin = async () => {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
      await fetchCart();
      return;
    }

    try {
      const localCart = JSON.parse(savedCart);
      if (localCart.items && localCart.items.length > 0) {
        // Ajouter les items du localStorage à l'API
        for (const item of localCart.items) {
          await orderService.addToCart(item.produit.id, item.quantite);
        }
        localStorage.removeItem('cart');
      }
      await fetchCart();
    } catch (err) {
      console.error('Erreur sync panier:', err);
      await fetchCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: cart.items || [],
        cartData: cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal: () => total,
        getItemCount: () => itemCount,
        fetchCart,
        syncCartAfterLogin,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans CartProvider');
  }
  return context;
};