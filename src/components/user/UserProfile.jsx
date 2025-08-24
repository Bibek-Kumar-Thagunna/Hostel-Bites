import React, { useState, useEffect } from 'react';
import { auth, db, doc, setDoc, updateProfile } from '../../services/firebase';

const UserProfile = ({ userData, orders, focusField }) => {
    const [name, setName] = useState(userData?.displayName || '');
    const [photo, setPhoto] = useState(userData?.photoURL || '');
    const [roomNumber, setRoomNumber] = useState(userData?.roomNumber || '');
    const [whatsapp, setWhatsapp] = useState(userData?.whatsapp || '');
    const [saving, setSaving] = useState(false);
    const [imageError, setImageError] = useState(false);
    const totalSpent = orders.reduce((total, order) => total + (order.total || 0), 0);
    const roomRef = React.useRef(null);

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
                await setDoc(doc(db, 'users', userData.uid), { displayName: name, photoURL: photo, roomNumber, whatsapp }, { merge: true });
            }
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (focusField === 'room' && roomRef.current) {
            roomRef.current.focus();
        }
    }, [focusField]);

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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                        <input ref={roomRef} className="input-primary" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g., 510" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                        <div className="flex gap-2">
                            <input className="input-primary flex-1" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="10-digit number" />
                            <button
                                onClick={async () => {
                                    const resp = await fetch('/api/verify-whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: whatsapp }) });
                                    const data = await resp.json();
                                    if (data?.normalized) setWhatsapp(data.normalized);
                                    alert(data?.message || (data?.success ? 'Verified' : 'Verification failed'));
                                }}
                                className="px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-50"
                            >Background Verify</button>
                            <a href={whatsapp ? `https://wa.me/91${String(whatsapp).replace(/\D/g,'')}` : undefined} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-50">Open WA</a>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Background verify simulates a check; Open WA lets you send a test message.</p>
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


