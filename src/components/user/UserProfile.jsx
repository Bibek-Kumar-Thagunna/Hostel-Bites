import React, { useState, useEffect } from 'react';
import { auth, db, doc, setDoc, updateProfile } from '../../services/firebase';

const UserProfile = ({ userData, orders }) => {
    const [name, setName] = useState(userData?.displayName || '');
    const [photo, setPhoto] = useState(userData?.photoURL || '');
    const [saving, setSaving] = useState(false);
    const [imageError, setImageError] = useState(false);
    const totalSpent = orders.reduce((total, order) => total + (order.total || 0), 0);

    useEffect(() => {
        setName(userData?.displayName || '');
        setPhoto(userData?.photoURL || '');
    }, [userData?.displayName, userData?.photoURL]);

    useEffect(() => { setImageError(false); }, [photo]);

    const saveProfile = async () => {
        setSaving(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name, photoURL: photo });
            }
            if (userData?.uid) {
                await setDoc(doc(db, 'users', userData.uid), { displayName: name, photoURL: photo }, { merge: true });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            </div>
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    {photo && !imageError ? (
                        <img src={photo} alt="Profile" className="w-16 h-16 rounded-full object-cover" onError={() => setImageError(true)} />
                    ) : (
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-bold">{name?.charAt(0) || userData?.displayName?.charAt(0) || 'U'}</span>
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-semibold">{name || userData?.displayName || 'User'}</h3>
                        <p className="text-gray-600">{userData?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input className="input-primary" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                        <input className="input-primary" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://..." />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Total Orders</h4>
                        <p className="text-2xl font-bold text-orange-600">{orders.length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Total Spent</h4>
                        <p className="text-2xl font-bold text-orange-600">₹{totalSpent}</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button disabled={saving} onClick={saveProfile} className="btn-primary">{saving ? 'Saving...' : 'Save Profile'}</button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;


