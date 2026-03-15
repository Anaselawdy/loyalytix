import { useState, useEffect } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Orders() {
    const { business } = useAuth();
    const [orders, setOrders] = useState([]);
    const [phoneSearch, setPhoneSearch] = useState('');
    const [amount, setAmount] = useState('');
    const [settings, setSettings] = useState(null);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchOrdersAndSettings = async () => {
        if (!business) return;
        setLoading(true);

        // settings
        const { data: settingsData } = await supabase.from('settings').select('*').eq('business_id', business.id).single();
        if (settingsData) setSettings(settingsData);
        else setSettings({ points_per_currency: 10, vip_threshold: 1000 }); // Defaults if missing

        // orders
        const { data: ordersData } = await supabase
            .from('orders')
            .select('*, customer:customers(name, phone)')
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });

        setOrders(ordersData || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrdersAndSettings();
    }, [business]);

    // Debounced search for customer
    useEffect(() => {
        const searchCustomer = async () => {
            if (phoneSearch.length >= 8 && business) {
                const { data } = await supabase.from('customers').select('*').eq('business_id', business.id).eq('phone', phoneSearch).single();
                setCustomerInfo(data || null);
            } else {
                setCustomerInfo(null);
            }
        };
        const debounce = setTimeout(() => searchCustomer(), 500);
        return () => clearTimeout(debounce);
    }, [phoneSearch, business]);

    const handleAddOrder = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!business || !amount) return;

        let targetCustomerId = customerInfo?.id;

        try {
            if (!targetCustomerId) {
                throw new Error("العميل مش موجود. ضيفه الأول من صفحة العملاء أو اتأكد من الرقم.");
            }

            const pointsRate = settings?.points_per_currency || 10;
            const pointsEarned = Math.floor(parseFloat(amount) / pointsRate);

            const { error: orderError } = await supabase.from('orders').insert({
                business_id: business.id,
                customer_id: targetCustomerId,
                amount: parseFloat(amount),
                points_earned: pointsEarned
            });

            if (orderError) throw orderError;

            // Update customer points, spent, visits and VIP status
            const newVisits = (customerInfo.visits_count || 0) + 1;
            const newPoints = (customerInfo.total_points || 0) + pointsEarned;
            const newSpent = parseFloat(customerInfo.total_spent || 0) + parseFloat(amount);
            const vipThreshold = settings?.vip_threshold || 1000;
            const isVip = newPoints >= vipThreshold || newSpent >= vipThreshold;

            const { error: custError } = await supabase.from('customers').update({
                total_points: newPoints,
                total_spent: newSpent,
                visits_count: newVisits,
                is_vip: isVip,
                last_visit: new Date().toISOString()
            }).eq('id', targetCustomerId);

            if (custError) throw custError;

            setPhoneSearch('');
            setAmount('');
            setCustomerInfo(null);
            fetchOrdersAndSettings();
        } catch (err) {
            setErrorMsg(err.message);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
                <p className="mt-1 text-sm text-gray-500">سجل المبيعات الجديدة وتابع طلباتك.</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ShoppingBag className="w-5 h-5 ml-2 text-primary-600" />
                    إضافة طلب جديد
                </h2>

                {errorMsg && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleAddOrder} className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-start">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">رقم العميل</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className={`focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 pl-3 sm:text-sm border-gray-300 rounded-md py-2 border ${customerInfo ? 'border-green-500 ring-1 ring-green-500' : ''}`}
                                placeholder="01000000000"
                                value={phoneSearch}
                                onChange={(e) => setPhoneSearch(e.target.value)}
                            />
                        </div>
                        {customerInfo && (
                            <p className="mt-1 text-xs text-green-600 font-medium">لقيناه: {customerInfo.name} ({customerInfo.total_points || 0} نقطة)</p>
                        )}
                        {!customerInfo && phoneSearch.length >= 8 && (
                            <p className="mt-1 text-xs text-gray-500">بنبحث...</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">قيمة الطلب (الإجمالي)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border shadow-sm"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={!customerInfo || !amount}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            سجل الطلب وضيف النقط
                        </button>
                    </div>
                </form>
                {amount && settings && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-md border border-primary-100 flex items-center justify-between">
                        <span className="text-sm text-primary-700">النقط اللي هياخدها:</span>
                        <span className="text-lg font-bold text-primary-700" dir="ltr">+{Math.floor(parseFloat(amount) / (settings.points_per_currency || 10))} نقطة</span>
                    </div>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">بنحمل الطلبات...</div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">مفيش طلبات لحد دلوقتي.</div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <li key={order.id}>
                                <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <div className="flex text-sm font-medium text-primary-600 truncate">
                                                {order.customer?.name || 'عميل غير معروف'}
                                            </div>
                                            <div className="mt-2 flex">
                                                <div className="flex items-center text-sm text-gray-500" dir="ltr">
                                                    {order.customer?.phone || 'مفيش رقم'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:mr-5">
                                            <div className="flex overflow-hidden -space-x-1">
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-gray-900">{order.amount} جنيه</div>
                                                    <div className="text-sm text-green-600 font-medium">+{order.points_earned} نقطة</div>
                                                    <div className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleString('ar-EG')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
