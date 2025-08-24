// Orders service: create and track orders
import { db, collection, addDoc, Timestamp } from './firebase';
import { createAdminOrderNotification } from './adminNotifications';

export const createOrder = async ({ userId, userName, items, totalAmount, orderType, paymentMethod, upiTransactionId = 'N/A', notes = '' }) => {
    const ref = collection(db, 'orders');
    const order = {
        userId,
        userName,
        items,
        total: totalAmount,
        orderType,
        paymentMethod,
        upiTransactionId,
        status: 'payment_pending',
        notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(ref, order);
    // Emit admin notification
    try {
        await createAdminOrderNotification({ orderId: docRef.id, userId, userName, total: totalAmount, items });
    } catch (e) {
        console.warn('Admin notification failed:', e);
    }
    return { id: docRef.id, ...order };
};


