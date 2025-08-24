// Order history component
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { Clock, MapPin, Package, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../constants/app';

const OrderHistory = ({ orders }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const getStatusIcon = (status) => {
        switch (status) {
            case ORDER_STATUSES.DELIVERED:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case ORDER_STATUSES.CANCELLED:
                return <XCircle className="w-5 h-5 text-red-500" />;
            case ORDER_STATUSES.PREPARING:
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <Package className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusMessage = (status, orderType) => {
        switch (status) {
            case ORDER_STATUSES.DELIVERED:
                return `Delivered to ${orderType === 'delivery' ? 'your room' : 'counter'}`;
            case ORDER_STATUSES.CANCELLED:
                return 'Order was cancelled';
            case ORDER_STATUSES.PREPARING:
                return 'Being prepared in kitchen';
            case ORDER_STATUSES.OUT_FOR_DELIVERY:
                return 'On the way to your room';
            case ORDER_STATUSES.READY_FOR_PICKUP:
                return 'Ready for pickup at counter';
            case ORDER_STATUSES.PAYMENT_PENDING:
                return 'Waiting for payment verification';
            default:
                return status.replace(/_/g, ' ');
        }
    };

    if (orders.length === 0) {
        return (
            <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-600">Your order history will appear here</p>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                        <p className="text-gray-600">Track your previous orders</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Order ID or status..."
                            className="input-primary w-full md:w-72"
                        />
                        <button
                            onClick={() => setSearchQuery(searchQuery.trim())}
                            className="btn-primary"
                            aria-label="Search orders"
                        >Search</button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {orders
                    .filter((o) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        return o.id?.toLowerCase?.().includes(q) || o.status?.toLowerCase?.().includes(q);
                    })
                    .map((order, index) => (
                    <motion.div
                        key={order.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                {getStatusIcon(order.status)}
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        Order #{order.id.slice(-6)}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(order.total || order.totalAmount)}
                                </p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Order Type & Status */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                    {order.orderType}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {getStatusMessage(order.status, order.orderType)}
                            </p>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 mb-4">
                            {order.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center justify-between py-2">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={item.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=40&h=40&fit=crop&crop=center`}
                                            alt={item.name}
                                            className="w-10 h-10 object-cover rounded-lg"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {formatCurrency(((item.price ?? item.sellingPrice ?? 0) * (item.quantity ?? 1)))}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Order Actions */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-100">
                            {order.status === ORDER_STATUSES.DELIVERED && (
                                <button className="flex-1 bg-primary-500 text-white font-semibold py-2 rounded-xl hover:bg-primary-600 transition-all duration-300">
                                    Reorder
                                </button>
                            )}
                            <button
                                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-xl hover:bg-gray-50 transition-all duration-300"
                            >
                                {expandedId === order.id ? 'Hide Details' : 'View Details'}
                            </button>
                        </div>

                        {expandedId === order.id && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-gray-600">Order ID</span><span className="font-medium text-gray-900">{order.id}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Type</span><span className="font-medium text-gray-900 capitalize">{order.orderType}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Payment</span><span className="font-medium text-gray-900 capitalize">{order.paymentMethod || 'N/A'}</span></div>
                                {order.upiTransactionId && <div className="flex justify-between"><span className="text-gray-600">UPI Ref</span><span className="font-medium text-gray-900">{order.upiTransactionId}</span></div>}
                                {order.notes && <div className="flex justify-between"><span className="text-gray-600">Notes</span><span className="font-medium text-gray-900">{order.notes}</span></div>}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
