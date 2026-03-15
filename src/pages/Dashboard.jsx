import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, ShoppingBag, Star, Award, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { business } = useAuth();
    const [stats, setStats] = useState([
        { name: 'إجمالي العملاء', stat: 0, icon: Users },
        { name: 'إجمالي الطلبات', stat: 0, icon: ShoppingBag },
        { name: 'نقاط نشطة', stat: 0, icon: Star },
        { name: 'عملاء مميزين (VIP)', stat: 0, icon: Award },
    ]);
    const [recentCustomers, setRecentCustomers] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!business) return;

        const fetchDashboardData = async () => {
            // Fetch stats
            const { count: totalCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
            const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
            const { count: vipCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('is_vip', true);
            const { data: customersData } = await supabase.from('customers').select('total_points').eq('business_id', business.id);

            const activePoints = customersData ? customersData.reduce((acc, curr) => acc + (curr.total_points || 0), 0) : 0;

            setStats([
                { name: 'إجمالي العملاء', stat: totalCustomers || 0, icon: Users },
                { name: 'إجمالي الطلبات', stat: totalOrders || 0, icon: ShoppingBag },
                { name: 'نقاط نشطة', stat: activePoints, icon: Star },
                { name: 'عملاء مميزين (VIP)', stat: vipCustomers || 0, icon: Award },
            ]);

            // Fetch recent customers
            const { data: recCustomers } = await supabase.from('customers').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(5);
            setRecentCustomers(recCustomers || []);

            // Fetch recent orders
            const { data: recOrders } = await supabase.from('orders').select('*, customer:customers(name)').eq('business_id', business.id).order('created_at', { ascending: false }).limit(5);
            setRecentOrders(recOrders || []);

            setLoading(false);
        };

        fetchDashboardData();
    }, [business]);

    const businessName = business?.name || 'صاحب النشاط';

    if (loading) {
        return <div className="p-8 text-center text-gray-500">بنجمع بياناتك...</div>;
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">أهلاً بيك يا {businessName}</h1>
                    <p className="mt-1 text-sm text-gray-500">دي نظرة سريعة على برنامج الولاء بتاعك النهاردة.</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        to="/dashboard/customers"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                    >
                        <PlusCircle className="-ml-1 ml-2 h-5 w-5" />
                        إضافة عميل
                    </Link>
                    <Link
                        to="/dashboard/orders"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <ShoppingBag className="-ml-1 ml-2 h-5 w-5" />
                        طلب جديد
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                                </div>
                                <div className="mr-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-2xl font-semibold text-gray-900">{item.stat}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">أحدث العملاء</h2>
                        <Link to="/dashboard/customers" className="text-sm font-medium text-primary-600 hover:text-primary-500">عرض الكل</Link>
                    </div>
                    {recentCustomers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">مفيش عملاء لحد دلوقتي.</div>
                    ) : (
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {recentCustomers.map(customer => (
                                    <li key={customer.id} className="py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                                            <p className="text-sm text-gray-500" dir="ltr">{customer.phone}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">{customer.total_points} نقطة</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">أحدث الطلبات</h2>
                        <Link to="/dashboard/orders" className="text-sm font-medium text-primary-600 hover:text-primary-500">عرض الكل</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">مفيش طلبات لحد دلوقتي.</div>
                    ) : (
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {recentOrders.map(order => (
                                    <li key={order.id} className="py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.customer?.name || 'عميل'}</p>
                                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">{order.amount} جنيه</p>
                                            <p className="text-sm text-green-600">+{order.points_earned} نقطة</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
