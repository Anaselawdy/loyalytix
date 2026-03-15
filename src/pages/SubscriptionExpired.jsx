import { AlertTriangle, Home, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SubscriptionExpired() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
            >
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-3">اشتراكك خلص</h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    لازم تجدد اشتراكك عشان تكمل شغل وتوصل للوحة التحكم.
                </p>

                <div className="space-y-4">
                    <a 
                        href="https://wa.me/201000000000" // Placeholder for actual support number
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                    >
                        <MessageCircle className="w-5 h-5" />
                        كلمنا عشان تجدد
                    </a>
                    
                    <Link 
                        to="/"
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl font-medium transition-colors border border-gray-200"
                    >
                        <Home className="w-5 h-5" />
                        الرئيسية
                    </Link>
                </div>
            </motion.div>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-gray-400 text-sm"
            >
                ولاء+ - حوّل العملاء لزوار دائمين
            </motion.p>
        </div>
    );
}
