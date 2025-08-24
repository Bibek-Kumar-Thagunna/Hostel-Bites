import React, { useState, useEffect } from 'react';
import { auth, db, doc, setDoc, updateProfile, Timestamp } from '../../services/firebase';

const UserProfile = ({ userData, orders, focusField }) => {
    const [name, setName] = useState(userData?.displayName || '');
    const [photo, setPhoto] = useState(userData?.photoURL || '');
    const [roomNumber, setRoomNumber] = useState(userData?.roomNumber || '');
    const [whatsapp, setWhatsapp] = useState(userData?.whatsapp || '');
    const [saving, setSaving] = useState(false);
    const [imageError, setImageError] = useState(false);
    const totalSpent = orders.reduce((total, order) => total + (order.total || 0), 0);
    const roomRef = React.useRef(null);
    const [whatsappVerifiedAt, setWhatsappVerifiedAt] = useState(userData?.whatsappVerifiedAt || null);
    const [verifyMsg, setVerifyMsg] = useState('');
    const [verifyOk, setVerifyOk] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [saveNotice, setSaveNotice] = useState('');
    const whatsappRef = React.useRef(null);
    const didAutoFocusWhatsapp = React.useRef(false);

    // Photo uploader modal
    const [photoModal, setPhotoModal] = useState(false);
    const [photoPreview, setPhotoPreview] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        setName(userData?.displayName || '');
        setPhoto(userData?.photoURL || '');
        setRoomNumber(userData?.roomNumber || '');
        setWhatsapp(userData?.whatsapp || '');
        setWhatsappVerifiedAt(userData?.whatsappVerifiedAt || null);
    }, [userData?.displayName, userData?.photoURL]);

    useEffect(() => { setImageError(false); }, [photo]);

    // Auto-focus WhatsApp on load if invalid and room is not the requested focus
    useEffect(() => {
        if (!didAutoFocusWhatsapp.current && focusField !== 'room') {
            const invalid = !(whatsapp && whatsapp.length === 10);
            if (invalid && whatsappRef.current) {
                whatsappRef.current.focus();
                didAutoFocusWhatsapp.current = true;
            }
        }
    }, [focusField, whatsapp]);

    const saveProfile = async () => {
        setSaving(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name, photoURL: photo });
            }
            if (userData?.uid) {
                const patch = { displayName: name, photoURL: photo, roomNumber, whatsapp };
                if (whatsappVerifiedAt) {
                    // store as timestamp if possible
                    patch.whatsappVerifiedAt = whatsappVerifiedAt?.seconds ? whatsappVerifiedAt : Timestamp.now();
                }
                await setDoc(doc(db, 'users', userData.uid), patch, { merge: true });
            }
            setSaveNotice('Profile saved');
            setTimeout(() => setSaveNotice(''), 2000);
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column: avatar + stats */}
                <div className="space-y-6 md:col-span-1">
                    <div className="flex items-center gap-4 md:gap-6">
                        {photo && !imageError ? (
                            <img src={photo} alt="Profile" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" onError={() => setImageError(true)} />
                        ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xl md:text-2xl font-bold">{name?.charAt(0) || userData?.displayName?.charAt(0) || 'U'}</span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="text-xl md:text-2xl font-semibold truncate">{name || userData?.displayName || 'User'}</h3>
                            <p className="text-gray-600 truncate max-w-[200px] md:max-w-[400px] lg:max-w-none">{userData?.email}</p>
                        </div>
                        <div className="flex-1 hidden md:block" />
                        {/* Desktop button moved below */}
                    </div>
                    <button onClick={() => setPhotoModal(true)} className="md:hidden w-full px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-50">Change Photo</button>
                    <button onClick={() => setPhotoModal(true)} className="hidden md:block w-full px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-50">Change Photo</button>

                    {/* Stats removed as requested for user profile on all devices */}
                </div>

                {/* Right column: form */}
                <div className="space-y-6 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                            <input className="input-primary" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                            <input ref={roomRef} className="input-primary" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g., 510" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex flex-1">
                                <span className={`inline-flex items-center px-3 rounded-l-xl border border-r-0 text-sm ${whatsapp && whatsapp.length !== 10 ? 'border-red-300 bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>+91</span>
                                <input
                                    ref={whatsappRef}
                                    className={`input-primary flex-1 rounded-l-none ${whatsapp && whatsapp.length !== 10 ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9876543210"
                                />
                            </div>
                            <button
                                disabled={verifying || whatsapp.length !== 10}
                                onClick={async () => {
                                    setVerifying(true);
                                    setVerifyMsg('');
                                    setVerifyOk(null);
                                    try {
                                        const resp = await fetch('/api/verify-whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: whatsapp }) });
                                        const data = await resp.json();
                                        if (data?.normalized) setWhatsapp(data.normalized);
                                        if (data?.success) {
                                            setWhatsappVerifiedAt(Timestamp.now());
                                            setVerifyOk(true);
                                        } else {
                                            setVerifyOk(false);
                                        }
                                        setVerifyMsg(data?.message || (data?.success ? 'Verified' : 'Verification failed'));
                                    } catch (_e) {
                                        setVerifyOk(false);
                                        setVerifyMsg('Verification error. Please try again.');
                                    } finally {
                                        setVerifying(false);
                                    }
                                }}
                                className={`px-3 py-2 rounded-xl border text-gray-700 hover:bg-gray-50 ${(verifying || whatsapp.length !== 10) ? 'opacity-60 cursor-not-allowed' : ''} sm:w-auto w-full`}
                            >{verifying ? 'Verifying…' : 'Verify'}</button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {whatsappVerifiedAt ? (
                                <span className="inline-flex items-center text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">Verified</span>
                            ) : (
                                <span className="inline-flex items-center whitespace-nowrap text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">Not verified</span>
                            )}
                        </div>
                        {verifyMsg && (!verifyOk || !whatsappVerifiedAt) && (
                            <p className={`text-xs mt-1 ${verifyOk ? 'text-green-700' : 'text-red-600'}`}>{verifyMsg}</p>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button disabled={saving} onClick={saveProfile} className="btn-primary w-full md:w-auto">{saving ? 'Saving...' : 'Save Profile'}</button>
                    </div>
                </div>
            </div>

            {/* Photo Uploader Modal */}
            {photoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setPhotoModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Update Photo</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setPhotoModal(false)}>×</button>
                        </div>
                        <div className="space-y-3">
                            <input type="file" accept="image/*" onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => setPhotoPreview(reader.result);
                                reader.readAsDataURL(file);
                            }} />
                            {photoPreview && (
                                <div className="text-center">
                                    <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-full mx-auto border" />
                                </div>
                            )}
                            <p className="text-xs text-gray-500">We will compress to 512×512 for faster loading. If upload is not configured, we will store the image inline.</p>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button className="px-4 py-2 rounded-xl border" onClick={() => setPhotoModal(false)}>Cancel</button>
                            <button disabled={uploadingPhoto} className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60" onClick={async () => {
                                if (!photoPreview) { setPhotoModal(false); return; }
                                setUploadingPhoto(true);
                                try {
                                    // Compress to 512x512 square
                                    const img = new Image();
                                    img.src = photoPreview;
                                    await new Promise(r => { img.onload = r; });
                                    const canvas = document.createElement('canvas');
                                    const size = 512;
                                    canvas.width = size;
                                    canvas.height = size;
                                    const ctx = canvas.getContext('2d');
                                    // cover algorithm
                                    const ratio = Math.max(size / img.width, size / img.height);
                                    const nw = img.width * ratio;
                                    const nh = img.height * ratio;
                                    const nx = (size - nw) / 2;
                                    const ny = (size - nh) / 2;
                                    ctx.drawImage(img, nx, ny, nw, nh);
                                    const dataUrl = canvas.toDataURL('image/webp', 0.9);
                                    const uploadUrl = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;
                                    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                                    if (uploadUrl && preset) {
                                        const blob = await (await fetch(dataUrl)).blob();
                                        const form = new FormData();
                                        form.append('file', blob, 'profile.webp');
                                        form.append('upload_preset', preset);
                                        const resp = await fetch(uploadUrl, { method: 'POST', body: form });
                                        const json = await resp.json();
                                        if (json?.secure_url) {
                                            setPhoto(json.secure_url);
                                        } else {
                                            setPhoto(dataUrl);
                                        }
                                    } else {
                                        setPhoto(dataUrl);
                                    }
                                    setPhotoModal(false);
                                } finally {
                                    setUploadingPhoto(false);
                                }
                            }}>{uploadingPhoto ? 'Uploading...' : 'Save Photo'}</button>
                        </div>
                    </div>
                </div>
            )}
            {saveNotice && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow">
                    {saveNotice}
                </div>
            )}
        </div>
    );
};

export default UserProfile;


