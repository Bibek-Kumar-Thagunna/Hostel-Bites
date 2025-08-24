// Modern cart summary component
import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Gift, MapPin, Clock, IndianRupee, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { DELIVERY_OPTIONS } from '../../constants/app';
import { useNavigate } from 'react-router-dom';

const CartSummary = ({ cart, cartTotal, onRemoveFromCart, onClearCart, onBack, onAddToCart }) => {
    const [deliveryOption, setDeliveryOption] = useState(DELIVERY_OPTIONS.DELIVERY);
    const navigate = useNavigate();

    const deliveryCharge = deliveryOption === DELIVERY_OPTIONS.DELIVERY ? 10 : 0;
    const finalTotal = cartTotal + deliveryCharge;

    const cartItems = Object.values(cart);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                        <ShoppingBag className="w-16 h-16 text-primary-400" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full animate-pulse"></div>
                    </div>

                    {/* Floating elements for visual appeal */}
                    <div className="absolute top-4 right-1/4 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-xs">🍕</span>
                    </div>
                    <div className="absolute bottom-4 left-1/4 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.5s'}}>
                        <span className="text-xs">🍔</span>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Hungry? 🥺</h2>
                <p className="text-gray-600 mb-8 text-lg">Your cart is feeling a little empty...</p>

                <div className="space-y-4">
                    <button
                        onClick={onBack}
                        className="bg-primary-500 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
                    >
                        🛍️ Browse Our Menu
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-2xl">
                            <div className="text-2xl mb-2">⚡</div>
                            <h3 className="font-semibold text-gray-900">Lightning Fast</h3>
                            <p className="text-sm text-gray-600">15-minute delivery</p>
                        </div>

                        <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-2xl">
                            <div className="text-2xl mb-2">💚</div>
                            <h3 className="font-semibold text-gray-900">Fresh & Hot</h3>
                            <p className="text-sm text-gray-600">Made just for you</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const goToCheckout = () => {
        const params = new URLSearchParams(window.location.search);
        params.set('section', 'checkout');
        params.set('delivery', deliveryOption);
        navigate(`/app?${params.toString()}`);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors hover:bg-gray-100 px-3 py-2 rounded-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Menu</span>
                </button>

                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Items</p>
                        <p className="font-bold text-gray-900">{itemCount}</p>
                    </div>
                    <button
                        onClick={onClearCart}
                        className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors hover:bg-red-50 px-3 py-2 rounded-xl"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Clear</span>
                    </button>
                </div>
            </div>

            {/* Quick Actions removed (unused) */}

            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {itemCount} items
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatCurrency(cartTotal)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {cartItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            style={{animationDelay: `${index * 100}ms`}}
                        >
                            <div className="relative">
                                <img
                                    src={item.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=80&h=80&fit=crop&crop=center`}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                />
                                {item.quantity > 1 && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {item.quantity}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-600">{formatCurrency(item.sellingPrice)} each</p>
                                {item.quantity > 1 && (
                                    <p className="text-xs text-primary-600 font-medium mt-1">
                                        {item.quantity} × {formatCurrency(item.sellingPrice)} = {formatCurrency(item.sellingPrice * item.quantity)}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
                                    <button
                                        onClick={() => onRemoveFromCart(item.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-600 transition-all"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <span className="font-bold text-gray-900 px-2 min-w-[2rem] text-center">
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() => onAddToCart && onAddToCart(item)}
                                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-green-50 hover:text-green-600 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-lg">
                                        {formatCurrency(item.sellingPrice * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                        <span>Order Total</span>
                        <span>{formatCurrency(finalTotal)}</span>
                    </div>
                    {deliveryCharge === 0 && (
                        <p className="text-sm text-green-600 mt-1">Free delivery on takeaway orders! 🎉</p>
                    )}
                </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Option</h3>
                <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                        <input
                            type="radio"
                            name="delivery"
                            value={DELIVERY_OPTIONS.DELIVERY}
                            checked={deliveryOption === DELIVERY_OPTIONS.DELIVERY}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900">Room Delivery</div>
                            <div className="text-sm text-gray-600">Delivered straight to your room</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">+{formatCurrency(deliveryCharge)}</div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors">
                        <input
                            type="radio"
                            name="delivery"
                            value={DELIVERY_OPTIONS.TAKEAWAY}
                            checked={deliveryOption === DELIVERY_OPTIONS.TAKEAWAY}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900">Takeaway</div>
                            <div className="text-sm text-gray-600">Collect from Room 510</div>
                        </div>
                        <div className="text-sm font-semibold text-green-600">FREE</div>
                    </label>
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({itemCount} items)</span>
                        <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Delivery Charge</span>
                        <span>{deliveryCharge > 0 ? formatCurrency(deliveryCharge) : 'FREE'}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span>{formatCurrency(finalTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Button */}
            <button
                className="w-full btn-primary"
                onClick={goToCheckout}
            >
                Proceed to Checkout • {formatCurrency(finalTotal)}
            </button>
        </div>
    );
};

export default CartSummary;
