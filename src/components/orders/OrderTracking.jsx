// Modern order tracking component with real-time updates and ratings
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, Package, Star, Truck, ChefHat, ArrowLeft, Share2, Phone, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const OrderTracking = ({ order, onBack, onRateOrder }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [showRating, setShowRating] = useState(false);

    // Update current time every minute for estimated delivery
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Mock order status - in real app this would come from props/state
    const orderStatus = order?.status || 'confirmed';
    const estimatedDelivery = new Date(order?.createdAt || new Date());
    estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 20);

    const statusSteps = [
        { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, time: '2 min ago', color: 'text-green-600' },
        { key: 'preparing', label: 'Preparing Food', icon: ChefHat, time: '5 min ago', color: 'text-blue-600' },
        { key: 'ready', label: 'Ready for Delivery', icon: Package, time: '15 min ago', color: 'text-orange-600' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, time: 'In progress', color: 'text-purple-600' },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle, time: 'Just now', color: 'text-green-600' }
    ];

    const getCurrentStepIndex = () => {
        const statusIndex = {
            'confirmed': 0,
            'preparing': 1,
            'ready': 2,
            'out_for_delivery': 3,
            'delivered': 4
        };
        return statusIndex[orderStatus] || 0;
    };

    const currentStepIndex = getCurrentStepIndex();
    const isDelivered = orderStatus === 'delivered';

    const handleRatingSubmit = () => {
        if (rating > 0) {
            onRateOrder?.(order.id, rating, feedback);
            setShowRating(false);
        }
    };

    const renderOrderHeader = () => (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onBack}
                        className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Order #{order?.id || 'ORD-123'}</h1>
                        <p className="text-primary-100">Track your delicious meal</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(order?.total || 0)}</p>
                    <p className="text-sm text-primary-100">{order?.items?.length || 0} items</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">Delivery</span>
                    </div>
                    <p className="text-xs text-primary-100">
                        {order?.deliveryOption === 'room' ? `Room ${order?.roomNumber}` : 'Pickup Counter'}
                    </p>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Estimated</span>
                    </div>
                    <p className="text-xs text-primary-100">
                        {Math.max(0, Math.floor((estimatedDelivery - currentTime) / (1000 * 60)))} min
                    </p>
                </div>
            </div>
        </div>
    );

    const renderStatusTimeline = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>

            <div className="space-y-6">
                {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const IconComponent = step.icon;

                    return (
                        <div key={step.key} className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCompleted
                                    ? 'bg-green-100 text-green-600'
                                    : isCurrent
                                    ? 'bg-blue-100 text-blue-600 animate-pulse'
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                                <IconComponent className="w-5 h-5" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-semibold ${
                                        isCompleted ? 'text-gray-900' : 'text-gray-600'
                                    }`}>
                                        {step.label}
                                    </h3>
                                    <span className="text-sm text-gray-500">{step.time}</span>
                                </div>
                                {isCurrent && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">In progress...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderOrderItems = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>

            <div className="space-y-4">
                {(order?.items || []).map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <img
                            src={item.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=60&h=60&fit=crop&crop=center`}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.quantity} × {formatCurrency(item.sellingPrice)}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(item.sellingPrice * item.quantity)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-primary-600">{formatCurrency(order?.total || 0)}</span>
                </div>
            </div>
        </div>
    );

    const renderRatingSection = () => {
        if (!isDelivered || showRating) return null;

        return (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
                <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Enjoy your meal? 🌟</h3>
                    <p className="text-sm text-gray-600">Rate your experience and help us improve</p>
                </div>

                <div className="flex justify-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="w-8 h-8 transition-all duration-200"
                        >
                            <Star className={`w-8 h-8 ${
                                star <= rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                            } hover:text-yellow-300`} />
                        </button>
                    ))}
                </div>

                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your feedback (optional)"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    rows={3}
                />

                <div className="flex space-x-3 mt-4">
                    <button
                        onClick={handleRatingSubmit}
                        disabled={rating === 0}
                        className="flex-1 bg-yellow-500 text-white font-semibold py-3 rounded-xl hover:bg-yellow-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Rating
                    </button>
                    <button
                        onClick={() => setShowRating(false)}
                        className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Later
                    </button>
                </div>
            </div>
        );
    };

    const renderSupport = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>

            <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                        <p className="font-medium text-gray-900">Call Support</p>
                        <p className="text-sm text-gray-600">Speak to our team</p>
                    </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                        <p className="font-medium text-gray-900">Chat Support</p>
                        <p className="text-sm text-gray-600">Get instant help</p>
                    </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                    <Share2 className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                        <p className="font-medium text-gray-900">Share Order</p>
                        <p className="text-sm text-gray-600">Send details to friends</p>
                    </div>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {renderOrderHeader()}
                {renderStatusTimeline()}
                {renderOrderItems()}
                {renderRatingSection()}
                {renderSupport()}
            </div>
        </div>
    );
};

export default OrderTracking;
