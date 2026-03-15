import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function SignUp() {
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        email: '',
        password: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);

            // 1. Sign up user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });
            console.log('signUp result:', { data: authData, error: authError });

            if (authError) throw authError;

            const userId = authData?.user?.id;
            console.log('userId:', userId);

            if (!userId) {
                // If it asks for email confirmation, handle that gracefully instead of hard failing.
                throw new Error("سجلنا طلبك، يرجى مراجعة إيميلك عشان تأكد الحساب.");
            }

            // Save pending profile data securely inside the browser for when the session actually hits
            localStorage.setItem('pendingBusinessSetup', JSON.stringify({
                name: formData.businessName,
                phone: formData.phone
            }));

            // Navigate to dashboard which implicitly triggers AuthContext loading the business
            navigate('/dashboard');
        } catch (err) {
            console.error("Sign up process error:", err);
            setError(err.message || "حصلت مشكلة مش متوقعة، جرب تاني.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">حساب جديد</h3>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">اسم النشاط</label>
                    <input
                        type="text"
                        name="businessName"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">اسم صاحب النشاط</label>
                    <input
                        type="text"
                        name="ownerName"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                    <input
                        type="email"
                        name="email"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">رقم الموبايل</label>
                    <input
                        type="tel"
                        name="phone"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
                    <input
                        type="password"
                        name="password"
                        required
                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        onChange={handleChange}
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {loading ? 'بنسجل الحساب...' : 'إنشاء الحساب'}
                </button>
            </form>
            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">عندك حساب بالفعل؟ </span>
                <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    تسجيل الدخول
                </Link>
            </div>
        </>
    );
}
