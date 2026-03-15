import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gift, MapPin, BellRing, BellOff, Loader2 } from 'lucide-react';
import { isNotificationsSupported, onForegroundMessage } from '../../firebase';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const realId = customerId || localStorage.getItem('customerId');
  
  // States
  const [customer, setCustomer] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [visits, setVisits] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [hasToken, setHasToken] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Custom Modal States
  const [selectedReward, setSelectedReward] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!realId) {
      setError('مش لاقيين حسابك.');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Section 1: Customer Info
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', realId)
          .single();

        console.log('PROFILE - Customer:', custData);
        if (custError) throw custError;

        setCustomer(custData);
        setHasToken(!!custData?.fcm_token);

        // Section 2: Available Rewards
        if (custData && custData.business_id) {
          const { data: rewData, error: rewErr } = await supabase
            .from('rewards')
            .select('*')
            .eq('business_id', custData.business_id)
            .eq('is_active', true)
            .order('points_required', { ascending: true });
            
          console.log('PROFILE - Rewards:', rewData);
          console.log('PROFILE - Rewards Error:', rewErr);
          
          setRewards(rewData || []);
        }

        // Section 3: Recent Visits
        const { data: visData, error: visErr } = await supabase
          .from('customer_visits')
          .select('*, businesses(name)')
          .eq('customer_id', realId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        console.log('PROFILE - Visits:', visData);
        setVisits(visData || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('حصلت مشكلة وإحنا بنحمل الصفحة');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [realId]);

  const handleRedeem = async () => {
    if (!selectedReward) return;
    
    try {
      setProcessing(true);
      
      const newPoints = customer.total_points - selectedReward.points_required;
      if (newPoints < 0) {
        console.error('Insufficient points! Customer has:', customer.total_points, 'needs:', selectedReward.points_required);
        throw new Error('نقطك مش هتكفّي للأسف.');
      }

      console.log(`Proceeding with deduction. New balance will be: ${newPoints}`);

      const insertPayload = {
        customer_id: realId,
        business_id: customer.business_id,
        reward_id: selectedReward.id,
        points_spent: selectedReward.points_required,
        status: 'pending'
      };
      
      console.log('Inserting into reward_redemptions:', insertPayload);

      // Insert Redemption
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert([insertPayload])
        .select()
        .single();
        
      if (redemptionError) {
        console.error('INSERT ERROR:', redemptionError);
        throw redemptionError;
      }
      console.log('Insert SUCCESS:', redemptionData);

      console.log(`Updating customer ${realId} to ${newPoints} points`);
      
      // Deduct Points
      const { data: updateData, error: updateError } = await supabase
        .from('customers')
        .update({ total_points: newPoints })
        .eq('id', realId)
        .select()
        .single();

      if (updateError) {
        console.error('UPDATE ERROR:', updateError);
        throw updateError;
      }
      console.log('Update SUCCESS:', updateData);

      // Refresh local state 
      setCustomer({ ...customer, total_points: newPoints });

      // Close confirm modal, show success overlay
      setShowConfirmModal(false);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('TRANSACTION FAILED:', err);
      alert(err.message || 'مقدرناش نبدل المكافأة.');
      setShowConfirmModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const confirmRedemptionPrompt = (reward) => {
     setSelectedReward(reward);
     setShowConfirmModal(true);
  };

  const handleEnableNotifications = async () => {
    // Guard: check browser/device support before touching Notification API
    if (!isNotificationsSupported()) {
      alert('الإشعارات مش متاحة على الجهاز أو المتصفح ده حالياً');
      return;
    }

    setNotificationLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const { getToken } = await import('firebase/messaging');
        const { messaging } = await import('../../firebase');

        if (!messaging) {
          alert('الإشعارات مش متاحة على الجهاز ده حالياً');
          return;
        }

        const token = await getToken(messaging, { 
          vapidKey: 'BJ8wlw_qDGiq8YJ277b8B-MJfjbWysNFrvvl7ohbKoICANZA7zDoHvvR5cv-0KptafIZuOvF5wNCFMU-lDETfYk'
        });
        
        if (token) {
          const { error } = await supabase
            .from('customers')
            .update({ fcm_token: token })
            .eq('id', realId);
          
          if (!error) {
            alert('شغلنا الإشعارات بنجاح');
            setHasToken(true);
          }
        }
      } else {
        alert('الإشعارات مقفولة. تقدر تفتحها من إعدادات المتصفح.');
      }
    } catch (error) {
       console.error(error);
       alert('حصلت مشكلة في تفعيل الإشعارات.');
    } finally {
      setNotificationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      </div>
    );
  }

  if (error || !customer) {
    return (
       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 mx-auto"><span className="text-4xl font-bold">!</span></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">عذراً</h2>
        <p className="text-gray-500 mb-8">{error || 'ملقناش حسابك'}</p>
        <button onClick={() => navigate('/customer')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-md">الرئيسية</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      
      {/* SECTION 1: Customer Info */}
      <div className="bg-white px-6 pt-10 pb-8 rounded-b-[2rem] shadow-sm relative mb-8">
        <div className="flex items-center space-x-4 space-x-reverse mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {customer.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm text-gray-500">أهلاً بيك،</p>
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <p className="text-xs text-indigo-600 font-bold mt-1">{customer.phone}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 text-white shadow-xl">
          <p className="text-indigo-200 text-sm font-medium mb-1">نقطك دلوقتي</p>
          <div className="flex items-end">
            <span className="text-5xl font-bold tracking-tight">{customer.total_points}</span>
            <span className="mr-2 text-indigo-200 font-medium pb-1.5">نقطة</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Available Rewards */}
      <div className="px-6 mb-10 text-right">
        <h3 className="text-xl font-bold text-gray-900 font-arabic mb-4">مكافآتك المتاحة</h3>
        
        {rewards && rewards.length > 0 ? (
          <div className="space-y-4">

            {rewards.map(reward => {
              const canRedeem = customer.total_points >= reward.points_required;
              return (
                <div key={reward.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col text-right">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 font-arabic">{reward.name}</h3>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold whitespace-nowrap">
                      {reward.points_required} نقطة
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-5">{reward.description || 'مفيش تفاصيل'}</p>
                  
                  {/* Debug Text */}
                  <div className="mb-4 bg-gray-50 p-3 rounded text-xs text-left text-gray-700 font-mono" style={{ direction: 'ltr' }}>
                    <div>Customer points: {customer.total_points}</div>
                    <div>Required: {reward.points_required}</div>
                    <div>Disabled: {(!canRedeem || processing) ? 'true' : 'false'}</div>
                  </div>

                  <button 
                    type="button"
                    disabled={!canRedeem || processing}
                    onClick={() => {
                       confirmRedemptionPrompt(reward);
                    }}
                    style={{ pointerEvents: 'auto', zIndex: 100, position: 'relative' }}
                    className={`w-full py-4 rounded-xl font-bold text-base transition-all active:scale-95 flex items-center justify-center ${
                       canRedeem 
                       ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700' 
                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> 
                    : canRedeem ? 'اطلب المكافأة' : `ناقصك ${reward.points_required - customer.total_points} نقطة`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500 border border-gray-100 shadow-sm">
            مفيش مكافآت دلوقتي
          </div>
        )}
      </div>

      {/* SECTION 3: Recent Visits */}
      <div className="px-6 mb-10 text-right">
        <h3 className="text-lg font-bold text-gray-900 font-arabic mb-4">زياراتك اللي فاتت</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {visits && visits.length > 0 ? (
            visits.map((visit) => (
              <div key={visit.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {visit.businesses?.name ? `زيارة لـ ${visit.businesses.name}` : 'تسجيل زيارة'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(visit.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  +{visit.points_earned} نقطة
                </div>
              </div>
            ))
          ) : (
             <div className="p-6 text-center text-gray-500 text-sm">مفيش أي زيارات قبل كده</div>
          )}
        </div>
      </div>

      {/* SECTION 4: Notification Toggle */}
      <div className="px-6 pb-12 mb-6">
         <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${hasToken ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                {hasToken ? <BellRing size={22} /> : <BellOff size={22} />}
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">إشعارات العروض</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hasToken
                    ? 'الإشعارات شغالة'
                    : isNotificationsSupported()
                    ? 'عشان تعرف كل جديد وتجيلك الفلوس'
                    : 'الإشعارات مش متاحة على الجهاز ده حالياً'}
                </p>
              </div>
            </div>
            
            {!hasToken && isNotificationsSupported() && (
              <button 
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors disabled:opacity-70 flex items-center"
              >
                {notificationLoading ? <Loader2 size={16} className="animate-spin" /> : 'شغّل'}
              </button>
            )}
         </div>
      </div>

      {/* Custom Confirm Modal Override */}
      {showConfirmModal && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
              <Gift className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-wiggle" />
              <h3 className="text-2xl font-bold font-arabic mb-2">تأكيد التبديل</h3>
              <p className="text-gray-600 mb-8">
                 أنت متأكد إنك عاوز تبدّل 
                 <span className="font-bold text-indigo-600 mx-1">{selectedReward.points_required} نقطة</span>
                 عشان تاخد 
                 <span className="font-bold text-indigo-600 mx-1">{selectedReward.name}</span>؟
              </p>
              
              <div className="flex gap-4">
                 <button 
                   onClick={() => setShowConfirmModal(false)}
                   className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                 >
                   إلغاء
                 </button>
                 <button 
                   onClick={handleRedeem}
                   disabled={processing}
                   className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                 >
                   {processing ? <Loader2 className="animate-spin w-5 h-5"/> : 'أيوة، بدّل'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Custom Success Delivery UI Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-indigo-600 p-6 animate-fade-in text-center text-white">
           <div className="bg-white/10 p-4 rounded-full mb-6 max-w-xs">
              <div className="bg-white text-indigo-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                 <span className="text-5xl font-bold">✓</span>
              </div>
           </div>
           
           <h2 className="text-4xl font-bold font-arabic mb-4">مبروك عليك!</h2>
           <p className="text-xl mb-2 text-indigo-100 font-medium">المكافأة اتطلبت بنجاح</p>
           <p className="text-base text-indigo-200 mb-12 max-w-xs">
               ورّي الشاشة دي للمسؤول عشان تاخد مكافأتك دلوقتي.
           </p>

           <div className="bg-white/20 px-8 py-5 rounded-2xl backdrop-blur-md border border-white/30 text-2xl font-mono tracking-widest font-bold mb-10 shadow-inner">
               {selectedReward?.name}
           </div>

           <button 
             onClick={() => setShowSuccessModal(false)}
             className="w-full max-w-xs py-4 bg-white text-indigo-700 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-xl"
           >
             اقفل
           </button>
        </div>
      )}

    </div>
  );
}
