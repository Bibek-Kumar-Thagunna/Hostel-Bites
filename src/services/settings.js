// Settings service: store global app settings like UPI IDs and QR URLs
import { db, doc, onSnapshot, setDoc, getDoc, Timestamp } from './firebase';

const SETTINGS_COLLECTION = 'settings';
const APP_DOC_ID = 'app';

export const subscribeAppSettings = (callback) => {
    const ref = doc(db, SETTINGS_COLLECTION, APP_DOC_ID);
    // Attach error handler to avoid unhandled errors and provide fallback
    const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
            callback(snap.data());
            // Cache locally as a fallback for restricted clients
            try { localStorage.setItem('upiSettings', JSON.stringify(snap.data())); } catch (_) {}
        } else {
            // Try local cache fallback
            try {
                const cached = localStorage.getItem('upiSettings');
                if (cached) {
                    callback(JSON.parse(cached));
                    return;
                }
            } catch (_) {}
            callback({});
        }
    }, async (_err) => {
        // Permission denied or network error: fallback to local cache, then one-time fetch
        try {
            const cached = localStorage.getItem('upiSettings');
            if (cached) callback(JSON.parse(cached));
        } catch (_) {}
        try {
            const once = await getAppSettingsOnce();
            if (once && Object.keys(once).length) callback(once);
        } catch (_) {}
    });
    return unsub;
};

export const getAppSettingsOnce = async () => {
    const ref = doc(db, SETTINGS_COLLECTION, APP_DOC_ID);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : {};
};

export const updateAppSettings = async (updates) => {
    const ref = doc(db, SETTINGS_COLLECTION, APP_DOC_ID);
    await setDoc(ref, { ...updates, updatedAt: Timestamp.now() }, { merge: true });
    return { success: true };
};


