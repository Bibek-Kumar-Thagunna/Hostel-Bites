// Categories service for Firestore-backed category management
import { db, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, Timestamp } from './firebase';

const slugify = (text) => String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const subscribeCategories = (callback) => {
    return onSnapshot(collection(db, 'categories'), (snapshot) => {
        const categories = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        callback(categories);
    });
};

export const addCategory = async ({ name, icon, key }) => {
    try {
        const payload = {
            name: String(name || '').trim(),
            icon: String(icon || '').trim(),
            key: String(key || slugify(name)).trim(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        if (!payload.name || !payload.key) {
            throw new Error('Name and key are required');
        }
        await addDoc(collection(db, 'categories'), payload);
        return { success: true };
    } catch (error) {
        console.error('Error adding category:', error);
        return { success: false, error: error.message };
    }
};

export const updateCategory = async (categoryId, updates) => {
    try {
        const ref = doc(db, 'categories', categoryId);
        const payload = { ...updates, updatedAt: Timestamp.now() };
        if (payload.name !== undefined) payload.name = String(payload.name).trim();
        if (payload.icon !== undefined) payload.icon = String(payload.icon).trim();
        if (payload.key !== undefined) payload.key = String(payload.key).trim();
        await updateDoc(ref, payload);
        return { success: true };
    } catch (error) {
        console.error('Error updating category:', error);
        return { success: false, error: error.message };
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        await deleteDoc(doc(db, 'categories', categoryId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: error.message };
    }
};


