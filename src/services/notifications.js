// Notification service functions for Firebase integration
import {
    db,
    collection,
    onSnapshot,
    query,
    where,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    getDocs,
    Timestamp
} from './firebase';

// Get user notifications
export const getUserNotifications = (userId, callback) => {
    const q = query(collection(db, "notifications"), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().createdAt?.toDate?.() || new Date()
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

        callback(notifications);
    });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, "notifications", notificationId);
        await updateDoc(notificationRef, {
            read: true,
            readAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
    try {
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", userId),
            where("read", "==", false)
        );

        const snapshot = await getDocs(q);

        const updatePromises = snapshot.docs.map(docItem =>
            updateDoc(docItem.ref, {
                read: true,
                readAt: Timestamp.now()
            })
        );

        await Promise.all(updatePromises);
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, error: error.message };
    }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    try {
        await deleteDoc(doc(db, "notifications", notificationId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error: error.message };
    }
};

// Create notification
export const createNotification = async (userId, notificationData) => {
    try {
        await addDoc(collection(db, "notifications"), {
            userId,
            ...notificationData,
            read: false,
            createdAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: error.message };
    }
};

// Create order notification
export const createOrderNotification = async (userId, orderId, type, title, message) => {
    return createNotification(userId, {
        type: 'order',
        title,
        message,
        orderId,
        icon: getIconForType(type),
        color: getColorForType(type)
    });
};

// Helper functions for notification types
const getIconForType = (type) => {
    const iconMap = {
        'confirmed': 'CheckCircle',
        'preparing': 'ChefHat',
        'ready': 'Package',
        'out_for_delivery': 'Truck',
        'delivered': 'CheckCircle',
        'promo': 'Info',
        'system': 'AlertCircle'
    };
    return iconMap[type] || 'Info';
};

const getColorForType = (type) => {
    const colorMap = {
        'confirmed': 'green',
        'preparing': 'blue',
        'ready': 'orange',
        'out_for_delivery': 'purple',
        'delivered': 'green',
        'promo': 'purple',
        'system': 'orange'
    };
    return colorMap[type] || 'blue';
};
