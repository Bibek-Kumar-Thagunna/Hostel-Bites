// Modern Hostel Canteen App - Refactored with Components
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import services
// import { auth } from './services/firebase'; // Not used in this component

// Import hooks and contexts
import { useAuth } from './hooks/useAuth';

// Import components
import LoadingScreen from './components/common/LoadingScreen';
import AuthComponent from './components/auth/AuthComponent';
import LandingPage from './components/landing/LandingPage';
import Layout from './components/layout/Layout';
import UserApp from './components/UserApp';
import AdminPanel from './components/admin/AdminPanel';

// Import styles
import './styles/design-system.css';

// Main App Component
const App = () => {
    const { user, userData, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                        {/* Public routes - always accessible */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth" element={<AuthComponent />} />

                        {/* Protected routes - require authentication */}
                        <Route path="/app" element={
                            user && userData ? (
                                userData.isAdmin ? (
                                    <Layout userData={userData}>
                                        <AdminPanel userData={userData} />
                                    </Layout>
                                ) : (
                                    <Layout userData={userData}>
                                        <UserApp userData={userData} />
                                    </Layout>
                                )
                            ) : (
                                <AuthComponent />
                            )
                        } />

                        {/* Admin specific route - redirects if not admin */}
                        <Route path="/admin" element={
                            user && userData && userData.isAdmin ? (
                                <Layout userData={userData}>
                                    <AdminPanel userData={userData} />
                                </Layout>
                            ) : (
                                <AuthComponent />
                            )
                        } />

                        {/* Fallback route */}
                        <Route path="*" element={<LandingPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
