// Modern loading screen component
import React from 'react';
import { motion } from 'framer-motion';


const LoadingScreen = ({ message = "Warming up the kitchen..." }) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col items-center justify-center z-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="bg-dots-pattern h-full w-full"></div>
            </div>

            {/* Loading Animation */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Main Loading Icon */}
                <motion.div
                    className="relative mb-8"
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                >
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-4xl">🍔</span>
                    </div>

                    {/* Pulsing Ring */}
                    <motion.div
                        className="absolute inset-0 border-4 border-primary-300 rounded-2xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* Loading Text */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {message}
                    </h2>
                    <p className="text-gray-600">
                        Preparing your favorite dishes...
                    </p>
                </motion.div>

                {/* Progress Dots */}
                <div className="flex space-x-2 mt-6">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-3 h-3 bg-primary-500 rounded-full"
                            animate={{
                                y: [0, -10, 0],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                {/* Fun Facts */}
                <motion.div
                    className="mt-8 text-center max-w-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <p className="text-sm text-gray-500 italic">
                        "Did you know? Our chefs prepare fresh meals every day!"
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoadingScreen;
