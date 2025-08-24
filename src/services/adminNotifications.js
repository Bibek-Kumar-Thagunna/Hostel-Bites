// Admin notifications service
import { db, collection, addDoc, onSnapshot, updateDoc, doc, Timestamp, query } from './firebase';

const ADMIN_NOTIFS = 'admin_notifications';

export const subscribeAdminNotifications = (callback) => {
    const q = query(collection(db, ADMIN_NOTIFS));
    return onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        callback(notifs);
    });
};

export const createAdminOrderNotification = async ({ orderId, userId, userName, total, items }) => {
    try {
        await addDoc(collection(db, ADMIN_NOTIFS), {
            type: 'order_placed',
            orderId,
            userId,
            userName,
            total,
            itemsCount: Array.isArray(items) ? items.length : 0,
            handled: false,
            createdBy: userId,
            createdAt: Timestamp.now()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating admin notification:', error);
        return { success: false, error: error.message };
    }
};

export const markAdminNotificationHandled = async (notifId, result, adminId) => {
    try {
        await updateDoc(doc(db, ADMIN_NOTIFS, notifId), {
            handled: true,
            result,
            handledBy: adminId || null,
            handledAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error handling admin notification:', error);
        return { success: false, error: error.message };
    }
};


