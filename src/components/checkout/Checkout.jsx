// Dedicated checkout component: payment and confirmation
import React, { useMemo, useState, useEffect } from 'react';
import { MapPin, Clock, IndianRupee, CheckCircle, Clipboard } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { DELIVERY_OPTIONS } from '../../constants/app';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscribeAppSettings } from '../../services/settings';
import { createOrder } from '../../services/orders';
import { useAuth } from '../../hooks/useAuth';
import QRCode from 'react-qr-code';
import ConfirmDialog from '../common/ConfirmDialog';

const Checkout = ({ cart, cartTotal, onBack, onClearCart }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [deliveryOption, setDeliveryOption] = useState(DELIVERY_OPTIONS.TAKEAWAY);
    const [notes, setNotes] = useState('');
    const [settings, setSettings] = useState({ upiId: '', upiQrUrl: '' });
    const [placing, setPlacing] = useState(false);
    const [placed, setPlaced] = useState(false);
    const [upiRef, setUpiRef] = useState('');
    const [copied, setCopied] = useState({ upi: false, amount: false });
    const { userData } = useAuth();

    // Contact details prompt
    const [showContactModal, setShowContactModal] = useState(false);
    const [roomNumber, setRoomNumber] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [roomError, setRoomError] = useState('');
    const [whatsappError, setWhatsappError] = useState('');

    useEffect(() => {
        const unsub = subscribeAppSettings(setSettings);
        return () => unsub();
    }, []);

    // Initialize from URL param (coming from cart)
    useEffect(() => {
        const d = searchParams.get('delivery');
        if (d === DELIVERY_OPTIONS.DELIVERY || d === DELIVERY_OPTIONS.TAKEAWAY) {
            setDeliveryOption(d);
        }
    }, [searchParams]);

    const deliveryCharge = deliveryOption === DELIVERY_OPTIONS.DELIVERY ? 10 : 0;
    const finalTotal = cartTotal + deliveryCharge;

    const upiLink = useMemo(() => {
        if (!settings.upiId || String(settings.upiId).trim() === '') return '';
        const amount = finalTotal.toFixed(2);
        const payeeName = encodeURIComponent('Hostel Bites');
        return `upi://pay?pa=${encodeURIComponent(String(settings.upiId).trim())}&pn=${payeeName}&am=${amount}&cu=INR`;
    }, [settings.upiId, finalTotal]);

    const items = useMemo(() => Object.values(cart), [cart]);

    // Validation: require UPI reference to be at least 6 chars for delivery
    const trimmedRef = (upiRef || '').trim();
    const isRefValid = deliveryOption !== DELIVERY_OPTIONS.DELIVERY || trimmedRef.length >= 6;

    const copyToClipboard = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied((prev) => ({ ...prev, [key]: true }));
            setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1500);
        } catch (_e) {
            // ignore
        }
    };

    const sanitizeWhatsapp = (num) => {
        if (!num) return '';
        const digits = String(num).replace(/\D/g, '');
        // If starts with 91 and length 12, strip country code
        if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
        return digits;
    };

    const validateContact = () => {
        let ok = true;
        const rn = String(roomNumber).trim();
        const wa = sanitizeWhatsapp(whatsapp);
        setRoomError('');
        setWhatsappError('');
        if (rn.length < 1 || rn.length > 10) {
            setRoomError('Enter your room number');
            ok = false;
        }
        if (!/^([6-9][0-9]{9})$/.test(wa)) {
            setWhatsappError('Enter a valid 10-digit WhatsApp number');
            ok = false;
        }
        return ok;
    };

    const placeOrder = async () => {
        if (!userData?.uid || placing) return;
        setPlacing(true);
        try {
            const orderItems = items.map(({ id, name, sellingPrice, quantity, imageUrl }) => ({ id, name, price: sellingPrice, quantity, imageUrl }));
            await createOrder({
                userId: userData.uid,
                userName: userData.displayName || userData.email,
                items: orderItems,
                totalAmount: finalTotal,
                orderType: deliveryOption,
                paymentMethod: 'upi',
                notes,
                upiTransactionId: upiRef || 'N/A',
                roomNumber: String(roomNumber).trim(),
                whatsapp: sanitizeWhatsapp(whatsapp)
            });
            onClearCart();
            setPlaced(true);
            if (deliveryOption === DELIVERY_OPTIONS.DELIVERY && upiLink) {
                window.location.href = upiLink;
            }
            setTimeout(() => navigate('/app?section=orders'), 1500);
        } finally {
            setPlacing(false);
        }
    };

    const onPlaceClick = () => {
        if (!validateContact()) {
            setShowContactModal(true);
            return;
        }
        placeOrder();
    };

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some delicious items before checking out.</p>
                <button onClick={onBack} className="btn-primary">Browse Menu</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">← Back to Cart</button>
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <div />
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery</h2>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300">
                                <input type="radio" name="delivery" value={DELIVERY_OPTIONS.DELIVERY} checked={deliveryOption === DELIVERY_OPTIONS.DELIVERY} onChange={(e) => { setDeliveryOption(e.target.value); setSearchParams({ delivery: e.target.value, section: 'checkout' }); }} />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Room Delivery</div>
                                    <div className="text-sm text-gray-600 flex items-center"><MapPin className="w-4 h-4 mr-1" /> Deliver to your room</div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">+{formatCurrency(deliveryCharge)}</div>
                            </label>
                            <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300">
                                <input type="radio" name="delivery" value={DELIVERY_OPTIONS.TAKEAWAY} checked={deliveryOption === DELIVERY_OPTIONS.TAKEAWAY} onChange={(e) => { setDeliveryOption(e.target.value); setSearchParams({ delivery: e.target.value, section: 'checkout' }); }} />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Takeaway</div>
                                    <div className="text-sm text-gray-600 flex items-center"><Clock className="w-4 h-4 mr-1" /> Collect from Room 510</div>
                                </div>
                                <div className="text-sm font-semibold text-green-600">FREE</div>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h2>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-primary" rows={3} placeholder="Add any special instructions (optional)" />
                    </div>

                    {/* Items Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
                        <div className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=56&h=56&fit=crop&crop=center`} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                                        <div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="font-semibold text-gray-900">{formatCurrency(item.sellingPrice * item.quantity)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{deliveryOption === DELIVERY_OPTIONS.DELIVERY ? 'UPI Payment' : 'Cash Payment'}</h2>
                        <div className="space-y-4">
                            {deliveryOption === DELIVERY_OPTIONS.TAKEAWAY && (
                                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
                                    Pay in cash at pickup (Room 510). Show your order ID at the counter.
                                </div>
                            )}
                            {deliveryOption === DELIVERY_OPTIONS.DELIVERY && (
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-600">UPI</label>
                                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-1 rounded bg-gray-100 font-mono text-sm text-gray-800 break-all">
                                            {settings.upiId || 'Not configured'}
                                        </span>
                                        {settings.upiId && (
                                            <button onClick={() => copyToClipboard(String(settings.upiId), 'upi')} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                                                <Clipboard className="w-3 h-3" />
                                                {copied.upi ? 'Copied' : 'Copy'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Payable Amount</label>
                                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-1 rounded bg-gray-100 font-mono text-sm text-gray-800">
                                            {finalTotal.toFixed(2)}
                                        </span>
                                        <button onClick={() => copyToClipboard(finalTotal.toFixed(2), 'amount')} className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                                            <Clipboard className="w-3 h-3" />
                                            {copied.amount ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            )}

                            {deliveryOption === DELIVERY_OPTIONS.DELIVERY && (
                            <div>
                                <label className="block text-sm text-gray-600">UPI Reference ID</label>
                                <input
                                    value={upiRef}
                                    onChange={(e) => setUpiRef(e.target.value)}
                                    className={`input-primary mt-1 ${trimmedRef && !isRefValid ? 'ring-2 ring-red-200 border-red-300' : ''}`}
                                    aria-invalid={trimmedRef && !isRefValid}
                                    placeholder="e.g., TID12345678"
                                />
                                <p className={`text-xs mt-1 ${trimmedRef && !isRefValid ? 'text-red-600' : 'text-gray-500'}`}>
                                    {trimmedRef && !isRefValid ? 'Reference ID must be at least 6 characters.' : 'Enter the UPI transaction/reference ID after payment.'}
                                </p>
                            </div>
                            )}

                            {deliveryOption === DELIVERY_OPTIONS.DELIVERY && upiLink ? (
                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Scan to pay</div>
                                    <div className="inline-block p-3 rounded-2xl bg-white shadow-sm border border-gray-200">
                                        <QRCode value={upiLink} size={208} fgColor="#1f2937" bgColor="#ffffff" style={{ width: '208px', height: '208px' }} />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold text-gray-900">{formatCurrency(cartTotal)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="font-semibold text-gray-900">{deliveryCharge ? formatCurrency(deliveryCharge) : 'FREE'}</span></div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2"><span>Total</span><span>{formatCurrency(finalTotal)}</span></div>
                        </div>
                        <div className="space-y-2 mt-4">
                            {deliveryOption === DELIVERY_OPTIONS.DELIVERY && (
                                <a href={upiLink || undefined} onClick={(e) => { if (!upiLink) e.preventDefault(); }} className={`block w-full text-center btn-primary ${!upiLink ? 'opacity-60 cursor-not-allowed' : ''}`} aria-disabled={!upiLink}>Open in UPI App</a>
                            )}
                            <button disabled={placing || !isRefValid} onClick={onPlaceClick} className={`w-full btn-primary ${placing || !isRefValid ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                {placing ? 'Placing Order...' : deliveryOption === DELIVERY_OPTIONS.DELIVERY ? 'Place Order' : 'Place Order (Cash)'}
                            </button>
                            {placed && (
                                <div className="flex items-center justify-center text-green-700 bg-green-50 border border-green-200 rounded-lg text-sm pt-2 pb-2 mt-1">
                                    <CheckCircle className="w-4 h-4 mr-1" /> Order placed! Redirecting to Orders...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="sr-only" aria-live="polite">
                {copied.upi ? 'UPI ID copied' : ''}
                {copied.amount ? 'Amount copied' : ''}
            </div>

            {/* Contact Details Modal */}
            {showContactModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setShowContactModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-4 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Contact Details</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowContactModal(false)}>×</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                                <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className={`input-primary ${roomError ? 'ring-2 ring-red-200 border-red-300' : ''}`} placeholder="e.g., 510" />
                                {roomError && <p className="text-xs text-red-600 mt-1">{roomError}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={`input-primary ${whatsappError ? 'ring-2 ring-red-200 border-red-300' : ''}`} placeholder="10-digit number" />
                                {whatsappError && <p className="text-xs text-red-600 mt-1">{whatsappError}</p>}
                                <p className="text-xs text-gray-500 mt-1">We'll use this to contact you if needed.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setShowContactModal(false)} className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => { if (validateContact()) { setShowContactModal(false); placeOrder(); } }} className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;


