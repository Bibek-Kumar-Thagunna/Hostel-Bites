// Modern menu item card component
import React, { useState } from 'react';
import { Plus, Minus, Star, Heart, Clock, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const MenuItem = ({ item, quantityInCart, onAddToCart, onRemoveFromCart }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const hasDiscount = item.mrp > item.sellingPrice;
    const discountPercentage = hasDiscount ? Math.round((1 - item.sellingPrice / item.mrp) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 transform">
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img
                    src={item.imageUrl || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center`}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                />

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsFavorite(!isFavorite);
                    }}
                    className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                </button>

                {/* Stock Badge */}
                {item.quantity === 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Out of Stock
                    </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-12 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {discountPercentage}% OFF
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-semibold text-gray-700">4.5</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.description}
                    </p>

                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>15-20 min</span>
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                            {formatCurrency(item.sellingPrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.mrp)}
                            </span>
                        )}
                    </div>

                    {/* Quantity Badge */}
                    {item.quantity > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.quantity} left
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                {item.quantity > 0 ? (
                    quantityInCart === 0 ? (
                        <button
                            onClick={() => onAddToCart(item)}
                            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add to Cart</span>
                        </button>
                    ) : (
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
                            <button
                                onClick={() => onRemoveFromCart(item.id)}
                                className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-105"
                            >
                                <Minus className="w-4 h-4 text-gray-600" />
                            </button>

                            <span className="font-bold text-gray-900 px-4">
                                {quantityInCart}
                            </span>

                            <button
                                onClick={() => onAddToCart(item)}
                                className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-105"
                            >
                                <Plus className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    )
                ) : (
                    <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-xl cursor-not-allowed"
                    >
                        Out of Stock
                    </button>
                )}
            </div>
        </div>
    );
};

export default MenuItem;
