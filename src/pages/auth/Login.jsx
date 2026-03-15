import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/dashboard');
        } catch (err) {
            setError('حصلت مشكلة في تسجيل الدخول: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">تسجيل الدخول</h3>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                    <div className="mt-1">
                        <input
                            type="email"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
                    <div className="mt-1">
                        <input
                            type="password"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <Link to="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                            نسيت كلمة المرور؟
                        </Link>
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
                </button>
            </form>
            <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">معندكش حساب؟ </span>
                <Link to="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
                    سجل دلوقتي
                </Link>
            </div>
        </>
    );
}
