import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LoadingSpinner } from '../components/CommonUI';

// Public Pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ServicesPage from '../pages/public/ServicesPage';
import ServiceDetailPage from '../pages/public/ServiceDetailPage';
import ContactPage from '../pages/public/ContactPage';
import QuotePage from '../pages/public/QuotePage';
import GalleryPage from '../pages/public/GalleryPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';

// Customer Panel
import CustomerLayout from '../pages/customer/CustomerLayout';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerEnquiries from '../pages/customer/CustomerEnquiries';
import CustomerBookings from '../pages/customer/CustomerBookings';
import CustomerProfile from '../pages/customer/CustomerProfile';

// Admin Panel
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEnquiries from '../pages/admin/AdminEnquiries';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminServices from '../pages/admin/AdminServices';
import AdminGallery from '../pages/admin/AdminGallery';
import AdminCarousel from '../pages/admin/AdminCarousel';
import AdminContent from '../pages/admin/AdminContent';
import AdminSettings from '../pages/admin/AdminSettings';

// Public Layout Wrapper
const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

// Customer Route Guard
const RequireCustomer = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner text="Checking authentication status..." />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return <CustomerLayout />;
};

// Admin Route Guard
const RequireAdmin = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner text="Verifying administrator credentials..." />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  return <AdminLayout />;
};

// 404 Not Found Page
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
    <h1 style={{ fontSize: '3rem', color: 'var(--brand-navy)' }}>404</h1>
    <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
      The page you requested does not exist or has been relocated.
    </p>
    <a href="/" className="btn btn-primary">Return to Homepage</a>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Admin Login (Standalone) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Customer Routes */}
      <Route path="/account" element={<RequireCustomer />}>
        <Route index element={<CustomerDashboard />} />
        <Route path="enquiries" element={<CustomerEnquiries />} />
        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<RequireAdmin />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="carousel" element={<AdminCarousel />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminSettings />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

