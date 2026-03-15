import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Settings,
    LogOut,
    Menu,
    X,
    QrCode,
    Gift
} from 'lucide-react';
import { cn } from '../utils/cn';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'QR Codes', href: '/dashboard/qr-codes', icon: QrCode },
    { name: 'Rewards', href: '/dashboard/rewards', icon: Gift },
];

export default function DashboardLayout() {
    const { user, business, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Subscription Lock: Block access if the business is loaded but not active
    if (business && business.subscription_status !== 'active') {
        return <Navigate to="/subscription-expired" replace />;
    }

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50" dir="ltr">
            {/* Mobile sidebar */}
            <div className={cn("fixed inset-0 z-40 md:hidden", sidebarOpen ? "block" : "hidden")}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r">
                    <div className="flex items-center justify-between h-16 px-4 border-b">
                        <span className="text-xl font-bold text-primary-600">Loyalty App</span>
                        <button onClick={() => setSidebarOpen(false)}>
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="px-2 py-4 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center px-2 py-2 text-base font-medium rounded-md",
                                            isActive
                                                ? "bg-primary-50 text-primary-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn("mr-4 w-6 h-6", isActive ? "text-primary-700" : "text-gray-400")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="p-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                        >
                            <LogOut className="mr-4 w-6 h-6 text-gray-400" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-white border-r">
                    <div className="flex items-center justify-center h-16 border-b">
                        <span className="text-xl font-bold text-primary-600">Loyalty App</span>
                    </div>
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <nav className="flex-1 px-2 py-4 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                                            isActive
                                                ? "bg-primary-50 text-primary-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn("mr-3 w-5 h-5", isActive ? "text-primary-700" : "text-gray-400")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                            >
                                <LogOut className="mr-3 w-5 h-5 text-gray-400" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <div className="md:hidden flex items-center h-16 px-4 bg-white border-b justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-bold text-primary-600">Loyalty App</span>
                </div>
                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
