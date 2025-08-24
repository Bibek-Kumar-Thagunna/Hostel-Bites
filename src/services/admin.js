// Admin service functions for Firebase integration
import {
    db,
    collection,
    onSnapshot,
    query,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    Timestamp,
    where
} from './firebase';

// Get admin analytics data
export const getAdminAnalytics = (callback) => {
    // Listen to orders collection for real-time analytics
    const ordersUnsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate analytics
        const totalOrders = orders.length;
        const totalRevenue = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + (order.total || 0), 0);

        // Profit (rough): revenue minus assumed cost (e.g., 70% of price). Adjust if you track COGS.
        const assumedCostRate = 0.7;
        const profit = Math.max(0, Math.round(totalRevenue * (1 - assumedCostRate)));

        const orderStatus = {
            payment_pending: orders.filter(order => order.status === 'payment_pending').length,
            preparing: orders.filter(order => order.status === 'preparing').length,
            ready_for_pickup: orders.filter(order => order.status === 'ready_for_pickup' || order.status === 'ready').length,
            out_for_delivery: orders.filter(order => order.status === 'out_for_delivery').length,
            delivered: orders.filter(order => order.status === 'delivered').length,
            cancelled: orders.filter(order => order.status === 'cancelled').length,
        };

        // Get menu items for top selling analysis
        const menuItemsUnsubscribe = onSnapshot(collection(db, "menu"), (menuSnapshot) => {
            const menuItemsData = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate top selling items based on actual order data
            const itemSales = {};
            orders.forEach(order => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(orderItem => {
                        const itemName = orderItem.name || 'Unknown Item';
                        if (!itemSales[itemName]) {
                            itemSales[itemName] = { sales: 0, revenue: 0 };
                        }
                        itemSales[itemName].sales += orderItem.quantity || 1;
                        itemSales[itemName].revenue += (orderItem.price || 0) * (orderItem.quantity || 1);
                    });
                }
            });

            const topSellingItems = Object.entries(itemSales)
                .sort(([,a], [,b]) => b.sales - a.sales)
                .slice(0, 5)
                .map(([name, data]) => ({
                    name,
                    sales: data.sales,
                    revenue: data.revenue
                }));

            // We still need menuItemsData for potential future use, so we keep it but don't use it for now
            void menuItemsData;

            const analytics = {
                totalRevenue,
                totalOrders,
                activeUsers: Math.floor(totalOrders * 0.3), // Estimate based on orders
                avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
                profit,
                topSellingItems,
                orderStatus
            };

            callback(analytics);
        });

        return () => menuItemsUnsubscribe();
    });

    return () => ordersUnsubscribe();
};

// Get recent orders for admin dashboard
export const getRecentOrders = (callback) => {
    const q = query(collection(db, "orders"));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date(0);
                const bTime = b.createdAt?.toDate?.() || new Date(0);
                return bTime - aTime;
            })
            .slice(0, 10); // Get recent 10 orders

        callback(orders);
    });
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status,
            updatedAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
};

// Update order (generic fields like notes, status, upiTransactionId, etc.)
export const updateOrder = async (orderId, updates) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating order:', error);
        return { success: false, error: error.message };
    }
};

// Get menu items for admin management
export const getMenuItems = (callback) => {
    return onSnapshot(collection(db, "menu"), (snapshot) => {
        const menuItems = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(menuItems);
    });
};

// Update menu item
export const updateMenuItem = async (itemId, updates) => {
    try {
        const itemRef = doc(db, "menu", itemId);
        await updateDoc(itemRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating menu item:', error);
        return { success: false, error: error.message };
    }
};

// Add new menu item
export const addMenuItem = async (itemData) => {
    try {
        await addDoc(collection(db, "menu"), {
            ...itemData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error('Error adding menu item:', error);
        return { success: false, error: error.message };
    }
};

// Delete menu item
export const deleteMenuItem = async (itemId) => {
    try {
        await deleteDoc(doc(db, "menu", itemId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return { success: false, error: error.message };
    }
};

// Delete order
export const deleteOrder = async (orderId) => {
    try {
        await deleteDoc(doc(db, "orders", orderId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting order:', error);
        return { success: false, error: error.message };
    }
};

// Subscribe to orders by a specific user
export const subscribeOrdersByUser = (userId, callback) => {
    if (!userId) return () => {};
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date(0);
                const bTime = b.createdAt?.toDate?.() || new Date(0);
                return bTime - aTime;
            });
        callback(orders);
    });
};
