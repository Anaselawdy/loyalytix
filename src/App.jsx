import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import SubscriptionExpired from './pages/SubscriptionExpired';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import QRCodes from './pages/dashboard/QRCodes';
import Rewards from './pages/dashboard/Rewards';

// Customer PWA Imports
import CustomerLayout from './customer/layouts/CustomerLayout';
import QRScan from './customer/pages/QRScan';
import Register from './customer/pages/Register';
import Profile from './customer/pages/Profile';
import CustomerRewards from './customer/pages/Rewards';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/subscription-expired" element={<SubscriptionExpired />} />

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="forgot-password" element={<div className="p-4 text-center">Forgot password page coming soon</div>} />
          </Route>

          {/* Customer PWA Routes */}
          <Route path="/customer" element={<CustomerLayout />}>
             <Route index element={<QRScan />} />
             <Route path="register" element={<Register />} />
             <Route path="profile/:customerId" element={<Profile />} />
             <Route path="rewards" element={<CustomerRewards />} />
             {/* Redirect undefined customer routes to the QR scanner */}
             <Route path="*" element={<Navigate to="/customer" replace />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
            <Route path="qr-codes" element={<QRCodes />} />
            <Route path="rewards" element={<Rewards />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
