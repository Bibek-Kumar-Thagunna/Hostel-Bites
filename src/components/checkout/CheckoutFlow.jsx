// Modern checkout flow component with enhanced UX
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, MapPin, Clock, Shield, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const CheckoutFlow = ({ cart, cartTotal, onBack, onOrderComplete }) => {
    const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Review
    const [deliveryOption, setDeliveryOption] = useState('room');
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const deliveryCharge = deliveryOption === 'room' ? 0 : 10;
    const finalTotal = cartTotal + deliveryCharge;

    const cartItems = Object.values(cart);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);

        // Simulate order processing
        setTimeout(() => {
            setIsProcessing(false);
            onOrderComplete({
                items: cartItems,
                total: finalTotal,
                deliveryOption,
                paymentMethod,
                upiId,
                roomNumber,
                orderId: `ORD-${Date.now()}`
            });
        }, 2000);
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step >= stepNumber
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                    }`}>
                        {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                    </div>
                    {stepNumber < 3 && (
                        <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                            step > stepNumber ? 'bg-primary-500' : 'bg-gray-200'
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );

    const renderDeliveryStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Where should we deliver?</h2>
                <p className="text-gray-600">Choose your preferred delivery option</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => setDeliveryOption('room')}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                        deliveryOption === 'room'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">Room Delivery</h3>
                            <p className="text-sm text-gray-600">Free delivery to your room</p>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-green-600">FREE</span>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setDeliveryOption('pickup')}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                        deliveryOption === 'pickup'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">Pickup at Counter</h3>
                            <p className="text-sm text-gray-600">Ready in 10-15 minutes</p>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">₹10</span>
                        </div>
                    </div>
                </button>
            </div>

            {deliveryOption === 'room' && (
                <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Room Information</h4>
                            <input
                                type="text"
                                placeholder="Enter your room number (e.g., 510)"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Cart</span>
                </button>
                <button
                    onClick={handleNext}
                    disabled={deliveryOption === 'room' && !roomNumber.trim()}
                    className="bg-primary-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );

    const renderPaymentStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Payment Method</h2>
                <p className="text-gray-600">Secure and easy payment options</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                        paymentMethod === 'upi'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">UPI Payment</h3>
                            <p className="text-sm text-gray-600">Pay with any UPI app</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-green-600 font-medium">Most Popular</span>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                        paymentMethod === 'card'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">Card Payment</h3>
                            <p className="text-sm text-gray-600">Debit, Credit & Net Banking</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                        paymentMethod === 'cash'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">💵</span>
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                            <p className="text-sm text-gray-600">Pay when you receive</p>
                        </div>
                    </div>
                </button>
            </div>

            {paymentMethod === 'upi' && (
                <div className="bg-orange-50 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                        <Smartphone className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">UPI Information</h4>
                            <input
                                type="text"
                                placeholder="Enter your UPI ID (e.g., user@upi)"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-600 mt-2">
                                We'll send payment instructions to your UPI app
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {paymentMethod === 'card' && (
                <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <Shield className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Secure Payment</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        Your card details are encrypted and secure. We don't store your card information.
                    </p>
                </div>
            )}

            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={handlePrev}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <button
                    onClick={handleNext}
                    disabled={paymentMethod === 'upi' && !upiId.trim()}
                    className="bg-primary-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Review Order
                </button>
            </div>
        </div>
    );

    const renderReviewStep = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Order</h2>
                <p className="text-gray-600">Please confirm all details before placing your order</p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={item.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=40&h=40&fit=crop&crop=center`}
                                    alt={item.name}
                                    className="w-10 h-10 object-cover rounded-lg"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-600">{item.quantity} × {formatCurrency(item.sellingPrice)}</p>
                                </div>
                            </div>
                            <span className="font-semibold text-gray-900">{formatCurrency(item.sellingPrice * item.quantity)}</span>
                        </div>
                    ))}

                    <div className="border-t border-gray-200 pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">{formatCurrency(cartTotal)}</span>
                        </div>
                        {deliveryCharge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="text-gray-900">{formatCurrency(deliveryCharge)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                            <span className="text-gray-900">Total</span>
                            <span className="text-primary-600">{formatCurrency(finalTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">Delivery</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {deliveryOption === 'room' ? `Room ${roomNumber}` : 'Pickup at Counter'}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        {deliveryOption === 'room' ? '15-20 minutes' : '10-15 minutes'}
                    </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{paymentMethod}</p>
                    {paymentMethod === 'upi' && (
                        <p className="text-xs text-green-600 mt-1">{upiId}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={handlePrev}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="bg-primary-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {isProcessing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" />
                            <span>Place Order • {formatCurrency(finalTotal)}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto p-4">
                {renderStepIndicator()}

                <div className="bg-white rounded-3xl shadow-lg p-6">
                    {step === 1 && renderDeliveryStep()}
                    {step === 2 && renderPaymentStep()}
                    {step === 3 && renderReviewStep()}
                </div>
            </div>
        </div>
    );
};

export default CheckoutFlow;
