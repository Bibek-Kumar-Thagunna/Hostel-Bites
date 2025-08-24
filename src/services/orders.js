// Orders service: create and track orders
import { db, collection, addDoc, Timestamp } from './firebase';

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
    return { id: docRef.id, ...order };
};


