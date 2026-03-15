import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export default function Customers() {
    const { business } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // New Customer Form State
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', birthday: '' });

    const fetchCustomers = async () => {
        if (!business) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', business.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching customers:", error);
        }

        setCustomers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, [business]);

    const filteredCustomers = customers.filter(
        (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search)
    );

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!business) return;

        try {
            // Check SaaS limits block
            const plan = business.subscription_plan || 'starter';
            const limit = plan === 'growth' ? 500 : 100;

            const { count, error: countError } = await supabase
                .from('customers')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', business.id);

            if (countError) throw countError;

            if (count >= limit) {
                throw new Error(`عذراً، الخطة الحالية (${plan}) تسمح بحد أقصى ${limit} عميل. يرجى الترقية لإضافة عملاء جدد.`);
            }

            const { data, error } = await supabase
                .from('customers')
                .insert([
                    {
                        business_id: business.id,
                        name: newCustomer.name,
                        phone: newCustomer.phone,
                        birthday: newCustomer.birthday || null,
                        total_points: 0,
                        total_spent: 0,
                        visits_count: 0,
                        is_vip: false
                    }
                ])
                .select();

            if (error) {
                if (error.code === '23505') throw new Error("الرقم ده متسجل لعميل تاني قبل كده.");
                throw error;
            }

            setIsModalOpen(false);
            setNewCustomer({ name: '', phone: '', birthday: '' });
            fetchCustomers();
        } catch (err) {
            console.error("Supabase insert error:", err);
            alert("حصلت مشكلة وإحنا بنضيف العميل: " + err.message);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
                    <p className="mt-1 text-sm text-gray-500">قايمة بكل عملائك مع النقط اللي جمعوها وعدد الزيارات.</p>
                </div>
                <div className="mt-4 sm:flex-none">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <Plus className="-mr-1 ml-2 h-5 w-5" />
                        إضافة عميل
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center sm:flex-nowrap">
                <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pr-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 shadow-sm"
                        placeholder="ابحث بالاسم أو رقم الموبايل"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg bg-white text-right">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">بنحمل بيانات العملاء...</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50 text-right">
                                        <tr>
                                            <th className="py-3.5 pr-4 pl-3 text-sm font-semibold text-gray-900 sm:pr-6">الاسم</th>
                                            <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">الموبايل</th>
                                            <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">الحالة</th>
                                            <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">النقاط والزيارات</th>
                                            <th className="px-3 py-3.5 text-sm font-semibold text-gray-900">آخر زيارة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredCustomers.map((person) => (
                                            <tr key={person.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                                                <td className="whitespace-nowrap py-4 pr-4 pl-3 text-sm font-medium text-gray-900 sm:pr-6">
                                                    {person.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" dir="ltr" style={{textAlign: "right"}}>{person.phone}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={cn("inline-flex rounded-full px-2 text-xs font-semibold leading-5", person.is_vip ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                                                        {person.is_vip ? 'VIP (مميز)' : 'عادي'}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <div className="font-medium text-gray-900">{person.total_points || 0} نقطة</div>
                                                    <div className="text-gray-500">{person.visits_count || 0} زيارة</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {person.last_visit ? new Date(person.last_visit).toLocaleDateString('ar-EG') : 'مجاش ولا مرة'}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCustomers.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="whitespace-nowrap py-8 text-center text-sm font-medium text-gray-500">
                                                    مفيش عملاء بالبيانات دي.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:text-right w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                إضافة عميل جديد
                                            </h3>
                                            <div className="mt-4">
                                                <form id="add-customer-form" onSubmit={handleAddCustomer} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">الاسم</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                        value={newCustomer.name}
                                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                    />
                                                </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">رقم الموبايل</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                        value={newCustomer.phone}
                                                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                                    />
                                                </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">تاريخ الميلاد (اختياري)</label>
                                                    <input
                                                        type="date"
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                        value={newCustomer.birthday}
                                                        onChange={(e) => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                                                    />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-start gap-2">
                                <button
                                    type="submit"
                                    form="add-customer-form"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
                                >
                                    حفظ
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
