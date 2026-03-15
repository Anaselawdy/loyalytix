import { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
    const { business } = useAuth();
    const [config, setConfig] = useState({
        id: null,
        points_per_currency: 10,
        vip_threshold: 1000,
        reward_visits_count: 5,
        inactive_days: 30,
    });

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!business) return;
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('business_id', business.id)
                .single();

            if (data) {
                setConfig(data);
            }
            setLoading(false);
        };

        fetchSettings();
    }, [business]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!business) return;
        setSaving(true);

        try {
            if (config.id) {
                // Update existing
                await supabase.from('settings').update({
                    points_per_currency: config.points_per_currency,
                    vip_threshold: config.vip_threshold,
                    reward_visits_count: config.reward_visits_count,
                    inactive_days: config.inactive_days
                }).eq('id', config.id);
            } else {
                // Insert new
                const { data } = await supabase.from('settings').insert({
                    business_id: business.id,
                    points_per_currency: config.points_per_currency,
                    vip_threshold: config.vip_threshold,
                    reward_visits_count: config.reward_visits_count,
                    inactive_days: config.inactive_days
                }).select().single();
                if (data) setConfig(data);
            }
            alert('تم حفظ الإعدادات بنجاح!');
        } catch (err) {
            alert('حصلت مشكلة وإحنا بنحفظ الإعدادات: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">بنحمل الإعدادات...</div>;
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">إعدادات البرنامج</h1>
                <p className="mt-1 text-sm text-gray-500">ظبط القواعد اللي هتكافئ بيها عملاءك.</p>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 flex items-center border-b">
                    <SettingsIcon className="w-5 h-5 ml-3 text-primary-600" />
                    <h3 className="text-lg leading-6 font-medium text-gray-900">قواعد الولاء</h3>
                </div>
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">حساب النقط</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    جنيه =
                                </span>
                                <input
                                    type="number"
                                    required
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 border shadow-sm"
                                    value={config.points_per_currency}
                                    onChange={(e) => setConfig({ ...config, points_per_currency: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">مثلا: العميل يدفع 10 جنيه عشان ياخد نقطة واحدة.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">حد الـ VIP (بالنقط أو الفلوس)</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    required
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    value={config.vip_threshold}
                                    onChange={(e) => setConfig({ ...config, vip_threshold: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">الرقم اللي لو العميل وصله يبقى VIP تلقائي.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">عدد الزيارات للمكافأة</label>
                            <div className="mt-1">
                                <input
                                    type="number"
                                    required
                                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    value={config.reward_visits_count}
                                    onChange={(e) => setConfig({ ...config, reward_visits_count: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">كم زيارة محتاجها عشان المستويات تتفتح.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">افتكدهم لو غابوا كام يوم؟</label>
                            <div className="mt-1 flex">
                                <input
                                    type="number"
                                    required
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300 border shadow-sm"
                                    value={config.inactive_days}
                                    onChange={(e) => setConfig({ ...config, inactive_days: parseInt(e.target.value) || 0 })}
                                />
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                    يوم
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">ابعثله رسالة لو غاب عنك كام يوم؟</p>
                        </div>
                    </div>
                    <div className="pt-5 border-t">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || !business}
                                className="mr-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 items-center disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 ml-2" />
                                {saving ? 'بنحفظ...' : 'حفظ الإعدادات'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
