import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ArrowRight, Percent, Info, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Rewards() {
  const navigate = useNavigate();
  const realId = localStorage.getItem('customerId');
  
  const [customer, setCustomer] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (!realId) {
      navigate('/customer');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // GET Customer
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', realId)
          .single();

        if (custError) throw custError;
        setCustomer(custData);

        // GET Rewards
        const { data: rwds, error: rwdError } = await supabase
          .from('rewards')
          .select('*')
          .eq('business_id', custData.business_id)
          .eq('is_active', true)
          .order('points_required', { ascending: true });
          
        if (rwdError) throw rwdError;
        setRewards(rwds || []);

        // GET Redemptions
        const { data: rdms, error: rdmError } = await supabase
          .from('reward_redemptions')
          .select('*, rewards(name)')
          .eq('customer_id', realId)
          .order('created_at', { ascending: false });

        if (!rdmError) setRedemptions(rdms || []);

      } catch (err) {
        console.error('Error fetching rewards context:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [realId, navigate]);

  const handleRedeem = async (reward) => {
    if (!window.confirm(`عاوز تبدل ${reward.points_required} نقطة بـ ${reward.name}؟`)) return;
    
    try {
      setProcessing(true);
      
      const newPoints = customer.total_points - reward.points_required;
      if (newPoints < 0) throw new Error('نقطك مش هتكفّي للأسف.');

      const { data: redemptionData, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert([{
          customer_id: realId,
          business_id: customer.business_id,
          reward_id: reward.id,
          points_spent: reward.points_required,
          status: 'pending'
        }])
        .select()
        .single();
        
      if (redemptionError) throw redemptionError;

      const { error: updateError } = await supabase
        .from('customers')
        .update({ total_points: newPoints })
        .eq('id', realId);

      if (updateError) throw updateError;

      // Update state locally
      setCustomer({ ...customer, total_points: newPoints });
      setRedemptions([ { ...redemptionData, rewards: { name: reward.name } }, ...redemptions ]);
      
      // pop success ticket
      setTicket({
        reward_name: reward.name,
        date: new Date().toLocaleString('ar-EG'),
        status: 'مستني التسليم',
        code: redemptionData.id.split('-')[0].toUpperCase()
      });

    } catch (err) {
      console.error(err);
      alert(err.message || 'مقدرناش نبدل المكافأة.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-10">
      
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-[2rem] shadow-sm z-10 relative">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
          <h1 className="text-xl font-bold font-arabic text-gray-900">مكافآتك المتاحة</h1>
          <div className="w-10"></div>
        </div>

        <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
              <Gift size={18} />
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-medium">نقطك دلوقتي</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">{customer?.total_points || 0} <span className="text-sm font-normal text-gray-500">نقطة</span></p>
            </div>
          </div>
          <button className="text-indigo-600 p-2 opacity-50"><Info size={20} /></button>
        </div>
      </div>

      <div className="px-6 pt-8 space-y-4">
        {rewards.length === 0 ? (
          <div className="text-center text-gray-500 py-10">مفيش مكافآت دلوقتي.</div>
        ) : (
          rewards.map((reward) => {
            const canRedeem = (customer?.total_points || 0) >= reward.points_required;
            const progress = Math.min(((customer?.total_points || 0) / reward.points_required) * 100, 100);
            
            return (
              <div 
                key={reward.id} 
                className={`bg-white rounded-3xl p-5 border shadow-sm transition-all focus:outline-none ${
                  canRedeem ? 'border-indigo-100 shadow-indigo-100/50' : 'border-gray-100 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                     canRedeem ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Gift size={28} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold leading-none flex items-center h-7 ${
                    canRedeem ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {reward.points_required} نقطة
                  </div>
                </div>

                <div className="mt-4 mb-5">
                  <h3 className="text-lg font-bold text-gray-900 font-arabic mb-1">{reward.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{reward.description}</p>
                </div>
                
                <div className="mb-5">
                   <div className="flex justify-between text-xs text-gray-500 font-medium mb-1.5 px-0.5">
                     <span>نسبة الإنجاز</span>
                     <span>{Math.floor(progress)}%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                     <div 
                       className={`h-2 rounded-full transition-all duration-1000 ${canRedeem ? 'bg-green-500' : 'bg-indigo-400'}`}
                       style={{ width: `${progress}%` }}
                     ></div>
                   </div>
                </div>

                <button 
                  onClick={() => handleRedeem(reward)}
                  disabled={!canRedeem || processing}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                    canRedeem 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {processing ? <Loader2 size={18} className="animate-spin" /> : 
                   canRedeem ? 'اطلب المكافأة' : `ناقصك ${reward.points_required - (customer?.total_points || 0)} نقطة`}
                </button>
              </div>
            )
          })
        )}
      </div>

      {redemptions.length > 0 && (
        <div className="px-6 pt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 font-arabic">سجل مكافآتك</h2>
          <div className="space-y-3">
             {redemptions.map(r => (
               <div key={r.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center">
                 <div>
                   <h4 className="font-bold text-gray-900 text-sm">{r.rewards?.name}</h4>
                   <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                 </div>
                 <div className="text-left">
                   <span className="inline-block px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded-full border border-yellow-100">
                     {r.status === 'pending' ? 'لسه مستني' : 'اتسلمت'}
                   </span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Ticket Modal Overlay */}
      {ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setTicket(null)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-fade-in-up flex flex-col items-center p-8 text-center border-t-8 border-indigo-500">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
               <CheckCircle size={32} />
             </div>
             
             <h2 className="text-2xl font-bold text-gray-900 mb-2">المكافأة اتطلبت بنجاح</h2>
             <p className="text-gray-500 text-sm mb-8 leading-relaxed">ورّي الشاشة دي للمسؤول عشان تاخد مكافأتك.</p>
             
             <div className="bg-gray-50 w-full rounded-2xl border border-gray-100 p-5 mb-6">
               <h3 className="font-bold text-lg text-indigo-700 mb-3">{ticket.reward_name}</h3>
               <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 mb-2">
                 <span className="text-gray-500">كود الطلب</span>
                 <span className="font-bold text-gray-900 font-mono tracking-widest">{ticket.code}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 mb-2">
                 <span className="text-gray-500">تاريخ الطلب</span>
                 <span className="font-bold text-gray-900">{ticket.date}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">حالة الطلب</span>
                 <span className="font-bold text-yellow-600">{ticket.status}</span>
               </div>
             </div>

             <button 
                onClick={() => setTicket(null)}
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition"
             >
               اقفل
             </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
