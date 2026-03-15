import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2, Gift } from 'lucide-react';

export default function Rewards() {
  const { user } = useAuth();
  
  const [business, setBusiness] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentReward, setCurrentReward] = useState(null); // null = add new
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // 1. Get business
      const { data: bus, error: busError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();

      if (busError) throw busError;
      setBusiness(bus);
      console.log('business:', bus);

      // 2. Get rewards
      const { data: rwds, error: rwdsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('business_id', bus.id);

      if (rwdsError) throw rwdsError;
      setRewards(rwds || []);
      console.log('rewards:', rwds);

      // 3. Get redemptions WITHOUT JOIN
      const { data: rawRedemps, error: redempsError } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('business_id', bus.id)
        .order('created_at', { ascending: false });

      console.log('business.id:', bus.id);
      console.log('redemptions:', rawRedemps);
      console.log('redemptionsError:', redempsError);

      if (redempsError) throw redempsError;

      // 4. Fetch customers separately - wrapping in try/catch so to NEVER block table
      let customersList = [];
      try {
        const customerIds = [...new Set((rawRedemps || []).map(r => r.customer_id))];
        if (customerIds.length > 0) {
          const { data: custData, error: custErr } = await supabase
            .from('customers')
            .select('*')
            .in('id', customerIds);
          if (custErr) console.error('Customers fetch error:', custErr);
          customersList = custData || [];
        }
      } catch (err) {
        console.error('Failed to fetch matched customers, falling back to raw IDs.', err);
      }
      console.log('customers:', customersList);

      // 5. Merge them completely manually
      const mergedRows = (rawRedemps || []).map((redemption) => {
        const matchingCustomer = customersList.find(c => c.id === redemption.customer_id);
        const matchingReward = (rwds || []).find(r => r.id === redemption.reward_id);

        return {
          ...redemption,
          customer_name: matchingCustomer ? matchingCustomer.name : 'غير معروف',
          customer_phone: matchingCustomer ? matchingCustomer.phone : '-',
          reward_name: matchingReward ? matchingReward.name : 'مكافأة'
        };
      });

      console.log('mergedRows:', mergedRows);
      setRedemptions(mergedRows);

    } catch (err) {
      console.error('Error in fetch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (reward = null) => {
    if (reward) {
      setCurrentReward(reward);
      setFormData({
        name: reward.name,
        description: reward.description || '',
        points_required: reward.points_required,
        is_active: reward.is_active
      });
    } else {
      setCurrentReward(null);
      setFormData({
        name: '',
        description: '',
        points_required: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentReward(null);
  };

  const handleSaveReward = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        business_id: business.id,
        name: formData.name,
        description: formData.description,
        points_required: parseInt(formData.points_required),
        is_active: formData.is_active
      };

      if (currentReward) {
        // Update
        await supabase.from('rewards').update(payload).eq('id', currentReward.id);
      } else {
        // Insert
        await supabase.from('rewards').insert([payload]);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      alert('حصلت مشكلة وإحنا بنحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReward = async (id) => {
    if (!window.confirm('أنت متأكد إنك عاوز تمسح المكافأة دي؟')) return;
    try {
      await supabase.from('rewards').delete().eq('id', id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('مقدرناش نمسح المكافأة دي.');
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      await supabase
        .from('reward_redemptions')
        .update({ status: 'completed' })
        .eq('id', id);
      
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('حصلت مشكلة في تحديث الحالة');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4" dir="rtl">
      
      {/* -------------------------------------------------- */}
      {/* SECTION 1: Rewards Management */}
      {/* -------------------------------------------------- */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary-600" />
            إدارة المكافآت
          </h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة مكافأة
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between mb-2">
                <h3 className="font-bold text-lg">{reward.name}</h3>
                <span className={reward.is_active ? "text-green-600" : "text-gray-400"}>
                  {reward.is_active ? 'شغال' : 'مقفول'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{reward.description || 'مفيش تفاصيل'}</p>
              <div className="font-bold text-lg mb-4">{reward.points_required} نقطة</div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(reward)} className="flex-1 bg-gray-100 py-2 rounded text-sm">تعديل</button>
                <button onClick={() => handleDeleteReward(reward.id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded text-sm">مسح</button>
              </div>
            </div>
          ))}
          {rewards.length === 0 && <div className="col-span-3 text-center py-8 text-gray-500">مفيش مكافآت ضفتها لسه</div>}
        </div>
      </div>

      <hr className="my-8 border-gray-300 border-2" />

      {/* -------------------------------------------------- */}
      {/* SECTION 2: Redemption Requests Table */}
      {/* -------------------------------------------------- */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200 block" style={{ display: 'block', opacity: 1, visibility: 'visible' }}>
        <h2 className="text-2xl font-bold mb-2 text-black">طلبات استبدال النقط</h2>
        <p className="font-bold text-gray-600 mb-6 bg-gray-50 inline-block px-4 py-2 rounded-lg">عدد الطلبات: {redemptions.length}</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300 border-t-2">
                <th className="p-3 border-l border-r border-gray-300">العميل</th>
                <th className="p-3 border-l border-gray-300">الموبايل</th>
                <th className="p-3 border-l border-gray-300">المكافأة المطلوبة</th>
                <th className="p-3 border-l border-gray-300">النقط اللي اتصرفت</th>
                <th className="p-3 border-l border-gray-300">الحالة</th>
                <th className="p-3 border-l border-gray-300">وقت الطلب</th>
                <th className="p-3 border-l border-gray-300">أكشن</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.length > 0 ? (
                redemptions.map((req) => (
                  <tr key={req.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 border-l border-r border-gray-200">
                      <div className="font-bold">{req.customer_name}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">ID: {req.customer_id}</div>
                    </td>
                    <td className="p-3 border-l border-gray-200" dir="ltr">
                      {req.customer_phone}
                    </td>
                    <td className="p-3 border-l border-gray-200">
                      <div className="font-bold text-indigo-700">{req.reward_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-1">ID: {req.reward_id}</div>
                    </td>
                    <td className="p-3 border-l border-gray-200 font-bold">
                      {req.points_spent}
                    </td>
                    <td className="p-3 border-l border-gray-200">
                      {req.status === 'pending' ? 'لسه مستني' : 'اتسلمت'}
                    </td>
                    <td className="p-3 border-l border-gray-200 text-sm">
                      {new Date(req.created_at).toLocaleString('ar-EG')}
                    </td>
                    <td className="p-3 border-l border-gray-200">
                      {req.status === 'pending' ? (
                        <button 
                          onClick={() => handleMarkDelivered(req.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm whitespace-nowrap"
                        >
                          سلّمته المكافأة
                        </button>
                      ) : (
                        <span className="text-green-600 font-bold">اتسلمت</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 font-bold text-lg border-l border-r border-b border-gray-300">
                    مفيش حد طلب يستبدل نقط لحد دلوقتي
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{currentReward ? 'تعديل مكافأة' : 'مكافأة جديدة'}</h2>
            <form onSubmit={handleSaveReward} className="space-y-4">
              <input
                className="w-full border p-2 rounded"
                placeholder="اسم المكافأة"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="تفاصيلها (اختياري)"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <input
                className="w-full border p-2 rounded text-left"
                type="number"
                placeholder="محتاجة كام نقطة؟"
                required
                value={formData.points_required}
                onChange={e => setFormData({...formData, points_required: e.target.value})}
                dir="ltr"
              />
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                />
                خليها شغالة للمستخدمين
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-200 p-2 rounded">إلغاء</button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary-600 text-white p-2 rounded">حفظ المكافأة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
