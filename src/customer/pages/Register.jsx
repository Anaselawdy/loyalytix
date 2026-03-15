import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User, Phone, Calendar, ArrowRight, Loader2, Bell, CheckCircle } from 'lucide-react';
import { requestNotificationPermission } from '../../firebase';

// === PRODUCTION DEBUG: runs at module load time ===
console.log('Production QR value (from module load):', new URLSearchParams(window.location.search).get('qr'));
console.log('Supabase URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase anon key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
// ===================================================

export default function Register() {
  const [searchParams] = useSearchParams();
  const qrString = searchParams.get('qr');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthday: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Notification Prompt State
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [registeredCustomerId, setRegisteredCustomerId] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('idle');

  // === ENV VAR CHECK: show on screen immediately if missing ===
  const envMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // === PRODUCTION DEBUG: on submit ===
      console.log('Supabase URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase anon key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      console.log('Production QR value:', qrString);
      // ====================================

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('إعدادات الاتصال غير مكتملة. تواصل مع الإدارة.');
      }

      if (!qrString) {
        throw new Error('مفيش QR Code. امسحه تاني لو سمحت.');
      }

      const formattedQrString = qrString.trim();
      console.log('QR query starting for code:', formattedQrString);

      // 1. Look up the qr_codes table
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('code', formattedQrString)
        .eq('is_active', true)
        .limit(1);
        
      console.log('QR query result:', { qrData, qrError });
        
      if (qrError) {
        console.error('QR Query error:', qrError);
        throw new Error(`حصلت مشكلة في الاتصال: ${qrError.message}`);
      }
      
      if (!qrData || qrData.length === 0) {
        throw new Error(`لم يتم العثور على رمز QR مفعّل: ${formattedQrString} (قد تحتاج إلى تفعيل RLS Policies)`);
      }
      
      const qrDoc = qrData[0];
      const businessId = qrDoc.business_id;
      console.log('Business ID found:', businessId);

      // 2. Fetch business data
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .limit(1);

      console.log('Business data:', { bizData, bizError });
      
      if (bizError) {
        throw new Error(`خطأ في البحث عن النشاط التجاري: ${bizError.message}`);
      }
      
      if (!bizData || bizData.length === 0) {
        throw new Error('ملقناش النشاط ده متاح.');
      }
      
      const business = bizData[0];
      
      if (business.subscription_status !== 'active') {
        throw new Error('اشتراك النشاط ده خلص.');
      }

      // 3. Try to find existing customer
      let customer;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', formData.phone)
        .eq('business_id', businessId)
        .single();
        
      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        // Enforce SaaS Subscription Limits for NEW Customers
        const plan = business.subscription_plan || 'starter';
        const limit = plan === 'growth' ? 500 : 100;

        const { count, error: countError } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId);

        if (countError) throw countError;

        if (count >= limit) {
            throw new Error(`آسفين! النشاط ده جاب آخره من عدد العملاء (${plan}). بلّغ الإدارة يرّقوا الباقة.`);
        }

        // 4. Create new customer
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([
            {
              name: formData.name,
              phone: formData.phone,
              birthday: formData.birthday || null,
              business_id: businessId,
              total_points: 0,
              total_spent: 0,
              visits_count: 1,
              is_vip: false
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Supabase insert error:", insertError);
          throw new Error('حصلت مشكلة في تسجيلك. راجع بياناتك وجرب تاني.');
        } else {
          customer = newCustomer;
        }
      }

      // 5. Log the visit
      if (customer.id !== 'mock-customer-id') {
         await supabase
          .from('customer_visits')
          .insert([
            {
              customer_id: customer.id,
              business_id: businessId,
              points_earned: 10
            }
          ]);
          
         const newPoints = (customer.total_points || 0) + 10;
         const newVisits = existingCustomer ? ((customer.visits_count || 0) + 1) : (customer.visits_count || 1);

         await supabase
            .from('customers')
            .update({ 
               total_points: newPoints,
               visits_count: newVisits
            })
            .eq('id', customer.id);
      }

      // 6. Save to local storage
      localStorage.setItem(`loyalty_customer_${businessId}`, customer.id);
      localStorage.setItem('customerId', customer.id);
      localStorage.setItem('customerPhone', formData.phone);
      
      setRegisteredCustomerId(customer.id);
      setShowNotificationPrompt(true);

    } catch (err) {
      console.error(err);
      setError(err.message || 'حصلت مشكلة وإحنا بنسجلك. حاول تاني.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    setNotificationStatus('loading');
    console.log('Starting notification setup for customer:', registeredCustomerId);
    
    try {
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      if (permission === 'granted') {
        console.log('Permission granted, getting token...');
        
        const { getToken } = await import('firebase/messaging');
        const { messaging } = await import('../../firebase');
        
        console.log('Messaging object:', messaging);
        
        const token = await getToken(messaging, { 
          vapidKey: 'BJ8wlw_qDGiq8YJ277b8B-MJfjbWysNFrvvl7ohbKoICANZA7zDoHvvR5cv-0KptafIZuOvF5wNCFMU-lDETfYk'
        });
        
        console.log('FCM Token received:', token);
        
        if (token && registeredCustomerId) {
          const { data, error } = await supabase
            .from('customers')
            .update({ fcm_token: token })
            .eq('id', registeredCustomerId);
          
          console.log('Supabase update result:', data, error);
          
          if (!error) {
            console.log('Token saved successfully!');
            setNotificationStatus('success');
            setTimeout(() => navigate(`/customer/profile/${registeredCustomerId}?welcome=true`), 2000);
          } else {
            console.error('Error saving token:', error);
            setNotificationStatus('error');
            setTimeout(() => navigate(`/customer/profile/${registeredCustomerId}?welcome=true`), 3000);
          }
        } else {
           setNotificationStatus('error');
           setTimeout(() => navigate(`/customer/profile/${registeredCustomerId}?welcome=true`), 3000);
        }
      } else {
        alert('الإشعارات مقفولة. تقدر تفتحها بعدين من المتصفح.');
        setNotificationStatus('error');
        setTimeout(() => navigate(`/customer/profile/${registeredCustomerId}?welcome=true`), 3000);
      }
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert('حصلت مشكلة: ' + error.message);
      setNotificationStatus('error');
      setTimeout(() => navigate(`/customer/profile/${registeredCustomerId}?welcome=true`), 3000);
    }
  };

  const handleSkipNotifications = () => {
    navigate(`/customer/profile/${registeredCustomerId}?welcome=true`);
  };

  // === ON-SCREEN env var warning (visible even without opening console) ===
  if (envMissing) {
    return (
      <div className="flex flex-col p-6 min-h-screen items-center justify-center text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-sm w-full">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">إعدادات الاتصال غير مكتملة</h2>
          <p className="text-red-600 text-sm">تواصل مع الإدارة.</p>
          <p className="text-gray-400 text-xs mt-4 font-mono" dir="ltr">
            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗ missing'}<br/>
            VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗ missing'}
          </p>
        </div>
      </div>
    );
  }
  // =========================================================================

  if (showNotificationPrompt) {
    return (
      <div className="flex flex-col p-6 min-h-screen items-center justify-center bg-gray-50 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-indigo-50 animate-fade-in-up">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-indigo-600 relative overflow-hidden">
            {notificationStatus === 'loading' ? (
              <Loader2 className="animate-spin" size={40} />
            ) : notificationStatus === 'success' ? (
              <CheckCircle size={48} className="text-green-500 animate-scale-in" />
            ) : (
              <Bell size={40} className="animate-wiggle" />
            )}
            
            {notificationStatus === 'idle' && (
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 mix-blend-overlay"></div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold font-arabic text-gray-900 mb-3">
            {notificationStatus === 'success' ? 'شغلنا الإشعارات بنجاح' : 'شغّل الإشعارات'}
          </h2>
          
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            {notificationStatus === 'success' 
              ? 'هنوديك لصفحتك الشخصية دلوقتي...' 
              : notificationStatus === 'error'
              ? 'تقدر تشغلها بعدين من الإعدادات'
              : 'عشان نبعتلك نقطك والمكافآت أول بـ أول'
            }
          </p>

          {notificationStatus === 'idle' && (
            <div className="space-y-3">
              <button
                onClick={handleEnableNotifications}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_8px_30px_rgb(79,70,229,0.2)] text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
              >
                شغّلها دلوقتي
              </button>
              
              <button
                onClick={handleSkipNotifications}
                className="w-full py-4 px-4 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium transition-colors"
              >
                عديها
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 min-h-screen">
      <button 
        onClick={() => navigate('/customer')}
        className="self-end p-2 bg-white rounded-full text-gray-400 hover:text-indigo-600 shadow-sm border border-gray-100 transition-colors mb-6"
      >
        <ArrowRight size={20} />
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-arabic">انضم لينا!</h1>
        <p className="text-gray-500 text-sm">كمل بياناتك عشان تبدأ تجمع نقط وتاخد مكافآت حصرية.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالكامل</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full pl-3 pr-10 py-3 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-colors"
              placeholder="محمد أحمد"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الموبايل</label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              name="phone"
              required
              dir="ltr"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full pl-3 pr-10 py-3 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 text-left transition-colors"
              placeholder="05X XXX XXXX"
            />
          </div>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ ميلادك <span className="text-gray-400 font-normal text-xs">(اختياري)</span></label>
          <div className="relative">
             <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <Calendar size={18} />
            </div>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="block w-full pl-3 pr-10 py-3 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 text-gray-600 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'ادخل دلوقتي'}
          </button>
        </div>
      </form>
    </div>
  );
}
