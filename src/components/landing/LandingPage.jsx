// Refined, rich landing page with premium visuals and smooth UX
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { subscribeCategories } from '../../services/categories';

import {
    Clock,
    MapPin,
    Star,
    Truck,
    Shield,
    Award,
    Play,
    ChevronRight,
    Smartphone,
    ChefHat,
    Heart,
    User,
    ShoppingCart
} from 'lucide-react';

const LandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const heroSlides = [
        {
            "title": "Quick & Tasty Snacks",
            "subtitle": "Chips, cookies, and more – right when you crave.",
            "image": "https://images.unsplash.com/photo-1688217170693-e821c6e18d72?auto=format&fit=crop&q=80",
            "position": "center 60%",
            "positionMobile": "center 40%"
        },
        {
            "title": "Late Night Cravings?",
            "subtitle": "Maggi, Wai Wai, Kurkure and more – 24/7 snacking.",
            "image": "https://images.unsplash.com/photo-1594971475674-6a97f8fe8c2b?auto=format&fit=crop&q=80",
            "position": "center 55%",
            "positionMobile": "center 45%"
        },
        {
            "title": "Fresh & Crispy",
            "subtitle": "Enjoy your favorite snacks and drinks, always fresh.",
            "image": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80",
            "position": "center 50%",
            "positionMobile": "center 45%"
        }
    ];

    const features = [
        {
            icon: Clock,
            title: "Lightning Fast",
            description: "Order now, eat in 15 minutes",
            color: "text-orange-500"
        },
        {
            icon: MapPin,
            title: "Room Delivery",
            description: "Delivered straight to your hostel room",
            color: "text-green-500"
        },
        {
            icon: Star,
            title: "5 Star Rated",
            description: "Loved by 1000+ students",
            color: "text-yellow-500"
        },
        {
            icon: Shield,
            title: "Safe & Secure",
            description: "Your food, your way",
            color: "text-blue-500"
        }
    ];

    const testimonials = [
        {
            "name": "Priya Kaur",
            "room": "Room 201",
            "message": "Best midnight snacks in the hostel! Always fresh and hot.",
            "rating": 5,
            "avatar": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?crop=faces&fit=crop&w=100&h=100"
        },
        {
            "name": "Rohit Singh",
            "room": "Room 305",
            "message": "Super fast delivery! Got my order in under 15 minutes.",
            "rating": 5,
            "avatar": "https://images.unsplash.com/photo-1551028719-00167b16eac5?crop=faces&fit=crop&w=100&h=100"
        },
        {
            "name": "Sneha Reddy",
            "room": "Room 412",
            "message": "The quality is amazing for hostel food. Highly recommended!",
            "rating": 5,
            "avatar": "https://images.unsplash.com/photo-1583994009785-37ec30bf9342?crop=faces&fit=crop&w=100&h=100"
        }
    ];

    const defaultCategories = [
        { name: "Pizza", icon: "🍕", color: "bg-red-100 text-red-600" },
        { name: "Burgers", icon: "🍔", color: "bg-orange-100 text-orange-600" },
        { name: "Noodles", icon: "🍜", color: "bg-yellow-100 text-yellow-600" },
        { name: "Drinks", icon: "🥤", color: "bg-blue-100 text-blue-600" },
        { name: "Snacks", icon: "🍿", color: "bg-green-100 text-green-600" },
        { name: "Sweets", icon: "🍰", color: "bg-pink-100 text-pink-600" }
    ];

    const [categories, setCategories] = useState([]);

    // Auto slide change
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // Load categories from Firestore
    useEffect(() => {
        const unsub = subscribeCategories((cats) => {
            // Normalize and limit to 6 for the landing grid
            const normalized = cats.map(c => ({ name: c.name, icon: c.icon || '🍽️' }));
            setCategories(normalized.slice(0, 6));
        });
        return () => unsub();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Hero Section */}
            <section className="relative h-screen overflow-hidden">
                {/* Background Slides */}
                {heroSlides.map((slide, index) => (
                    <motion.div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <div className="absolute inset-0">
                            {/* Desktop/Large screens */}
                            <img
                                src={`${slide.image}&w=1920`}
                                alt="Hero background"
                                className="hidden md:block w-full h-full object-fill"
                                style={{ objectPosition: slide.position || 'center' }}
                            />
                            {/* Mobile/Small screens */}
                            <img
                                src={`${slide.image}&w=768`}
                                alt="Hero background"
                                className="md:hidden w-full h-full object-fill"
                                style={{ objectPosition: slide.positionMobile || slide.position || 'center' }}
                            />
                        </div>
                        {/* Subtle brand gradient + scrim for readability */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/35 via-pink-500/25 to-teal-500/35" />
                        <div className="absolute inset-0 bg-black/25" />
                    </motion.div>
                ))}

                {/* Hero Content */}
                <div className="relative z-10 h-full flex items-center justify-center pt-16">
                    <div className="container mx-auto px-4 text-center">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] mb-6">
                                {heroSlides[currentSlide].title}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
                                {heroSlides[currentSlide].subtitle}
                            </p>
                            <motion.button
                                onClick={() => navigate('/app')}
                                className="bg-white/95 backdrop-blur-sm text-gray-900 font-bold py-4 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/60"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Order Now
                                <ChevronRight className="inline ml-2 w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2.5 h-2.5 rounded-full ring-2 ring-white/60 transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Hostel Bites?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Experience the best food delivery service designed specifically for hostel students
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="text-center p-6 rounded-2xl hover:shadow-lg transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-gradient-to-r from-orange-50 to-teal-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Popular Categories
                        </h2>
                        <p className="text-xl text-gray-600">
                            Discover your favorite foods
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {(categories.length ? categories : defaultCategories).map((category, index) => (
                            <motion.div
                                key={category.name}
                                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg`}>
                                    {category.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900">
                                    {category.name}
                                </h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600">
                            Get your food in just 3 simple steps
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Choose Your Food",
                                description: "Browse our menu and select your favorite items",
                                icon: "📱"
                            },
                            {
                                step: "02",
                                title: "Place Order",
                                description: "Add items to cart and complete your order",
                                icon: "🛒"
                            },
                            {
                                step: "03",
                                title: "Enjoy Delivery",
                                description: "Get fresh food delivered to your room",
                                icon: "🚀"
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={item.step}
                                className="text-center relative"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <div className="w-20 h-20 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                                    {item.step}
                                </div>
                                <div className="text-6xl mb-4">{item.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600">
                                    {item.description}
                                </p>
                                {index < 2 && (
                                    <ChevronRight className="hidden md:block absolute top-10 -right-4 w-8 h-8 text-orange-500" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gradient-to-r from-teal-50 to-orange-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            What Students Say
                        </h2>
                        <p className="text-xl text-gray-600">
                            Join thousands of happy customers
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                className="bg-white rounded-2xl p-6 shadow-lg"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center mb-4">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover mr-4"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {testimonial.room}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 italic">
                                    "{testimonial.message}"
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-orange-500 to-teal-500 text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-bold mb-6">
                            Ready to Order?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Ready to satisfy your cravings? Let's get started!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                onClick={() => navigate('/app')}
                                type="button"
                                className="bg-white text-orange-600 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User className="inline w-5 h-5 mr-2" />
                                Get Started
                            </motion.button>
                            <motion.button
                                onClick={() => navigate('/app')}
                                type="button"
                                className="border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ShoppingCart className="inline w-5 h-5 mr-2" />
                                Browse Menu
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
