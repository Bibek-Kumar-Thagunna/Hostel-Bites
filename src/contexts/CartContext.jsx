// Cart context for global cart state management
import React, { createContext, useState, useEffect } from 'react';
import { db, doc, setDoc, onSnapshot } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

// Create context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { userData } = useAuth();
    const [cart, setCart] = useState({});
    const [loading, setLoading] = useState(false);

    // Load cart from Firebase
    useEffect(() => {
        if (!userData?.uid) {
            setCart({});
            return;
        }

        const cartRef = doc(db, 'carts', userData.uid);
        const unsubscribe = onSnapshot(cartRef, (doc) => {
            if (doc.exists()) {
                setCart(doc.data().items || {});
            } else {
                setCart({});
            }
        });

        return () => unsubscribe();
    }, [userData?.uid]);

    // Update cart in Firebase
    const updateCartInDb = async (newCart) => {
        if (!userData?.uid) return;

        setLoading(true);
        try {
            const cartRef = doc(db, 'carts', userData.uid);
            await setDoc(cartRef, { items: newCart });
        } catch (error) {
            console.error('Error updating cart:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = (item) => {
        if (!userData?.uid) return;

        const newCart = { ...cart };
        const existingItem = newCart[item.id];

        if (existingItem) {
            newCart[item.id] = { ...existingItem, quantity: existingItem.quantity + 1 };
        } else {
            newCart[item.id] = { ...item, quantity: 1 };
        }

        updateCartInDb(newCart);
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        if (!userData?.uid) return;

        const newCart = { ...cart };
        const existingItem = newCart[itemId];

        if (!existingItem) return;

        if (existingItem.quantity > 1) {
            newCart[itemId] = { ...existingItem, quantity: existingItem.quantity - 1 };
        } else {
            delete newCart[itemId];
        }

        updateCartInDb(newCart);
    };

    // Clear cart
    const clearCart = () => {
        if (!userData?.uid) return;
        updateCartInDb({});
    };

    // Get cart totals
    const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = Object.values(cart).reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

    const value = {
        cart,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartInDb
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Export the context for use in hooks
export default CartContext;
