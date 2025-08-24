// Users service: subscribe to users collection for admin view
import { db, collection, onSnapshot } from './firebase';

export const subscribeUsers = (callback) => {
    const ref = collection(db, 'users');
    return onSnapshot(ref, (snapshot) => {
        const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(users);
    });
};


