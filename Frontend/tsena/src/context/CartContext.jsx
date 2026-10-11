import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { orderService } from '@/services/orderService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const PANIER_VIDE = { items: [], total: '0.00', nombre_items: 0 };

function lirePanierLocal() {
  try {
    const parsed = JSON.parse(localStorage.getItem('cart') || 'null');
    if (!parsed) return PANIER_VIDE;
    return { items: parsed.items || [], total: parsed.total || '0.00', nombre_items: parsed.nombre_items || 0 };
  } catch {
    return PANIER_VIDE;
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(PANIER_VIDE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // false tant que le panier initial n'est pas chargé : évite d'afficher « panier vide » trop tôt
  const [ready, setReady] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Le panier serveur (/orders/panier/) est réservé aux comptes client ; la commande
  // est créée à partir de lui. Les visiteurs (et autres comptes) gardent un panier local.
  const isAuthenticated = Boolean(user?.is_client || user?.user_type === 'client');

  useEffect(() => {
    if (authLoading) return undefined;
    let annule = false;

    const charger = async () => {
      if (!isAuthenticated) {
        setCart(lirePanierLocal());
        setReady(true);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Transfère vers le serveur les articles ajoutés avant la connexion
        const local = lirePanierLocal();
        for (const item of local.items) {
          try {
            await orderService.addToCart(item.produit.id, item.quantite);
          } catch (err) {
            console.warn('Article non transféré :', item.produit?.nom, err.response?.data?.error);
          }
        }
        if (local.items.length) localStorage.removeItem('cart');

        const data = await orderService.getCart();
        if (!annule) setCart(data);
      } catch (err) {
        console.error('Erreur chargement panier:', err);
        if (!annule) setError(err.response?.data?.error || 'Erreur lors du chargement du panier');
      } finally {
        if (!annule) {
          setLoading(false);
          setReady(true);
        }
      }
    };

    setReady(false);
    charger();
    return () => {
      annule = true;
    };
  }, [isAuthenticated, authLoading]);

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

  return (
    <CartContext.Provider
      value={{
        cart: cart.items || [],
        cartData: cart,
        loading,
        ready,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal: () => total,
        getItemCount: () => itemCount,
        fetchCart,
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