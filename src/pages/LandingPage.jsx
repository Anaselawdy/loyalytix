import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import CountUp from 'react-countup';
import {
    Gift,
    Cake,
    Award,
    Crown,
    HeartHandshake,
    Users,
    Utensils,
    Coffee,
    ShoppingBag,
    Pill,
    Scissors,
    CheckCircle2,
    Sparkles,
    ArrowLeft,
    ChevronDown,
    BarChart3,
    MessageCircleCode,
    MessageCircle,
    Smartphone
} from 'lucide-react';
import { cn } from '../utils/cn';
import FloatingCouponElements from '../components/FloatingCouponElements';

// --- Variants for Framer Motion ---
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState(0);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const features = [
        {
            title: 'نظام نقاط مرن',
            desc: 'حرفياً تقدر تظبط النظام زي ما تحب، نقطة لكل مبلغ بتحدده أو لكل زيارة.',
            icon: <Award className="w-8 h-8 text-indigo-600" />
        },
        {
            title: 'رسائل واتساب أوتوماتيك',
            desc: 'رسائل تلقائية للعملاء اللي بقالهم فترة مجوش، أو تهنئة بعيد ميلادهم.',
            icon: <MessageCircleCode className="w-8 h-8 text-indigo-600" />
        },
        {
            title: 'تقارير وإحصائيات',
            desc: 'تعرف مين أكتر عملاء بيشتروا، وإيه أكتر أوقات زحمة، وكمية النقط المستهلكة.',
            icon: <BarChart3 className="w-8 h-8 text-indigo-600" />
        },
        {
            title: 'سهل الاستخدام',
            desc: 'مش محتاج تدريب، واجهة بسيطة وسهلة لأي موظف يشتغل عليها في ثواني.',
            icon: <Smartphone className="w-8 h-8 text-indigo-600" />
        }
    ];

    return (
        <div dir="rtl" className="font-sans text-gray-900 bg-[#FAFAFA] overflow-x-hidden selection:bg-indigo-200">
            {/* Scroll Progress Bar */}
            <motion.div style={{ scaleX, transformOrigin: "0%" }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 z-[100]" />

            {/* --- NAVBAR --- */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-indigo-600 to-purple-800">
                            ولاء+
                        </span>
                    </div>
                    <div className="hidden md:flex gap-8 text-gray-600 font-medium">
                        <a href="#problem" className="hover:text-indigo-600 transition-colors">المشكلة</a>
                        <a href="#solution" className="hover:text-indigo-600 transition-colors">الحل</a>
                        <a href="#features" className="hover:text-indigo-600 transition-colors">المميزات</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth/login" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors hidden sm:block">
                            تسجيل الدخول
                        </Link>
                        <Link
                            to="/auth/signup"
                            className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium hover:bg-indigo-600 transition-colors shadow-md"
                        >
                            جرب مجاناً
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- 1. HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <FloatingCouponElements />

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-gradient-to-b from-indigo-50/50 to-transparent">
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-200/40 blur-[100px]"
                    />
                    <motion.div
                        animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px]"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-gray-100 shadow-sm text-sm font-semibold text-indigo-700 mb-10"
                    >
                        نظام الولاء الأذكى في مصر والوطن العربي
                        <svg className="w-2 h-2 ml-1" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="4" cy="4" r="4" fill="url(#paint0_linear)" />
                            <defs>
                                <linearGradient id="paint0_linear" x1="0" y1="0" x2="8" y2="8" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#34D399" />
                                    <stop offset="1" stopColor="#10B981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.3] md:leading-[1.4]"
                    >
                        حوّل العملاء لزوار دائمين <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-500 to-purple-500 block">
                            وكبّر أرباح مشروعك بكل سهولة
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-8 text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        خلي عملاءك يرجعوا لك باستمرار وزود مبيعاتك باشتراكات تبدأ من 290 ج.م في الشهر.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/auth/signup" className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-bold text-lg shadow-[0_10px_30px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1">
                            ابدأ تجربتك المجانية
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <p className="text-sm text-gray-500 sm:hidden">14 يوم مجاناً، بدون كارت ائتمان.</p>
                    </motion.div>
                </div>
            </section>

            {/* --- 2. THE PROBLEM SECTION --- */}
            <section id="problem" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900">إزاي ولاء+ هيكبّر مبيعاتك؟</h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            { id: 1, title: 'تجربة شخصية للعميل', text: 'النظام يقوم بتحليل تفضيلات كل عميل، لتقديم أفضل خدمة مخصصة تجعله يشعر بالتميز والولاء لنشاطك التجاري.' },
                            { id: 2, title: 'تحويل الزيارات لمكافآت', text: 'يحصل العميل على نقاط مع كل مرة زيارة أو شراء، مما يحفزه على العودة باستمرار لزيادة رصيده من المكافآت.' },
                            { id: 3, title: 'رسائل تسويقية ذكية الآداء', text: 'أرسل عروض وخصومات لعملائك المستهدفين تلقائياً في الوقت المناسب لإعادة التفاعل وزيادة المبيعات.' },
                        ].map((item) => (
                            <motion.div
                                key={item.id}
                                variants={fadeInLeft}
                                className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-100 transition-all">
                                    <span className="text-2xl font-bold">0{item.id}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- 3. THE SOLUTION SECTION --- */}
            <section id="solution" className="py-24 bg-gray-900 text-white relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">الحل الذكي والمتكامل</h2>
                        <div className="bg-white/10 p-6 md:p-8 rounded-3xl border border-white/20 backdrop-blur-md mb-12 shadow-2xl text-right inline-block max-w-4xl text-lg md:text-xl text-indigo-100 leading-relaxed font-medium">
                            <p>
                                تخيل إن فيه مساعد ذكي بيراقب أداء نشاطك وبيقولك على التحسينات على طول:
                                <span className="text-white font-bold mx-2">"أحد عملائك المميزين بقاله أسبوعين مجاش، النظام بعتله عرض مخصوص عشان يرجعه!"</span>
                            </p>
                            <p className="mt-4 text-indigo-200">
                                نظامنا لا يكتفي بتسجيل البيانات، بل <strong>يستبق</strong> انقطاع العملاء ويعمل على الاحتفاظ بهم وبناء ولاء دائم.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {[
                            { icon: Users, title: 'ترحيب أول زيارة', text: 'رسالة وخصم ترحيبي بعد أول عملية شراء' },
                            { icon: Cake, title: 'تهنئة عيد الميلاد', text: 'هدية أوتوماتيكية في شهر ميلاد العميل' },
                            { icon: Gift, title: 'مكافأة الزيارات', text: 'مكافأة مجانية بعد عدد زيارات تحدده (مثلا الـ 5)' },
                            { icon: Crown, title: 'ترقية الـ VIP', text: 'ترقية للعملاء الأكثر إنفاقاً بشكل آلي' },
                            { icon: MessageCircle, title: 'تنبيه وحشتنا', text: 'بنفكر العميل بيك لو غاب عنك 30 يوم' },
                            { icon: HeartHandshake, title: 'مكافأة الترشيح', text: 'مكافأة للعميل اللي يجيب أصحاب جداد ليك' },
                        ].map((Feature, i) => (
                            <motion.div
                                key={i}
                                variants={scaleIn}
                                className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-all duration-500" />
                                <Feature.icon className="w-10 h-10 text-indigo-400 mb-4 group-hover:text-white group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300" />
                                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-200 transition-colors">{Feature.title}</h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{Feature.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- 4. WHO IS IT FOR? --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                        <h2 className="text-3xl font-bold text-gray-900 mb-12">مناسب لمين؟</h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="flex flex-wrap justify-center gap-8 md:gap-16"
                    >
                        {[
                            { label: 'المحلات والمشاريع', icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50' },
                            { label: 'الخدمات', icon: HeartHandshake, color: 'text-amber-700', bg: 'bg-amber-50' },
                            { label: 'المتاجر المتنوعة', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-50' },
                            { label: 'العيادات والمراكز', icon: Pill, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { label: 'أعمال تانية كتير', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                        ].map((Cat, i) => (
                            <motion.div
                                key={i}
                                variants={scaleIn}
                                className="flex flex-col items-center group cursor-pointer"
                            >
                                <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-2", Cat.bg, Cat.color)}>
                                    <Cat.icon className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" />
                                </div>
                                <span className="text-lg font-bold text-gray-700">{Cat.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- 5. FEATURES HIGHLIGHT (Interactive) --- */}
            <section id="features" className="py-24 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInLeft} className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">شاشات مصممة <br /> لراحة بالك</h2>

                            <div className="flex flex-col gap-3">
                                {features.map((feature, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveTab(idx)}
                                        className={cn(
                                            "text-right p-6 rounded-2xl transition-all duration-300 border-2 w-full",
                                            activeTab === idx
                                                ? "bg-white border-indigo-500 shadow-lg shadow-indigo-100"
                                                : "bg-transparent border-transparent hover:bg-white/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-2 rounded-xl transition-colors", activeTab === idx ? "bg-indigo-50" : "bg-gray-100")}>
                                                {feature.icon}
                                            </div>
                                            <h3 className={cn("text-xl font-bold", activeTab === idx ? "text-indigo-900" : "text-gray-600")}>
                                                {feature.title}
                                            </h3>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
                            className="relative h-[400px] sm:h-[500px] w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 overflow-hidden flex items-center justify-center"
                        >
                            {/* Abstract Glass panel representing the App Dashboard feature selected */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-white -z-10" />
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center"
                                >
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8 border border-gray-100">
                                        {features[activeTab].icon}
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{features[activeTab].title}</h3>
                                    <p className="text-xl text-gray-500 max-w-sm mx-auto leading-relaxed">{features[activeTab].desc}</p>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* --- 6. STATS SECTION --- */}
            <section className="py-24 bg-indigo-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-indigo-400/30">

                        <div className="text-center pt-8 md:pt-0">
                            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 font-mono flex justify-center">
                                <span>+</span><CountUp end={500} enableScrollSpy={true} scrollSpyOnce={true} duration={2.5} />
                            </div>
                            <p className="text-indigo-200 text-lg font-medium">نشاط تجاري يستخدم النظام</p>
                        </div>

                        <div className="text-center pt-8 md:pt-0">
                            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 font-mono flex justify-center">
                                <span>+</span><CountUp end={10} enableScrollSpy={true} scrollSpyOnce={true} duration={2} /><span>K</span>
                            </div>
                            <p className="text-indigo-200 text-lg font-medium">رسالة أوتوماتيكية يومياً</p>
                        </div>

                        <div className="text-center pt-8 md:pt-0">
                            <div className="text-5xl md:text-6xl font-extrabold text-white mb-2 font-mono flex justify-center">
                                <span>%</span><CountUp end={85} enableScrollSpy={true} scrollSpyOnce={true} duration={2} />
                            </div>
                            <p className="text-indigo-200 text-lg font-medium">نسبة زيادة في رجوع العملاء</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- NEW: PRICING SECTION --- */}
            <section id="pricing" className="py-24 bg-[#FAFAFA] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-[100px]" />
                    <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[120px]" />
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">خطط الأسعار</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">اختار الباقة اللي تناسب حجم شغلك وكبّر قاعدة عملائك.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        
                        {/* Starter Plan */}
                        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">البداية (Starter)</h3>
                                <p className="text-gray-500 font-medium">مناسبة للأنشطة والمشاريع الناشئة</p>
                            </div>
                            
                            <div className="mb-8 flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-gray-900">290</span>
                                <span className="text-xl text-gray-500 font-bold font-arabic">ج.م / شهرياً</span>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <span>لحد <strong className="text-indigo-600 mx-1 border-b-2 border-indigo-200">100</strong> عميل مسجل</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <span><strong className="text-indigo-600 mx-1 border-b-2 border-indigo-200">1</strong> رمز QR Code</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <span>دعم إشعارات الموبايل (Push Notifications)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <span>نظام المكافآت والنقاط الأساسي</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <span>لوحة تحكم وتقارير مبسطة</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-400 font-medium opacity-60">
                                    <div className="w-5 h-5 shrink-0" />
                                    <span>بدون هوية بصرية مخصصة</span>
                                </li>
                            </ul>

                            <Link to="/auth/signup?plan=starter" className="w-full py-4 px-6 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg hover:bg-indigo-100 transition-colors text-center border border-indigo-100">
                                ابدأ الآن
                            </Link>
                        </motion.div>

                        {/* Growth Plan - Highlighted */}
                        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, delay: 0.2 }} className="relative bg-gradient-to-b from-indigo-900 to-gray-900 rounded-3xl p-8 border border-indigo-800 shadow-2xl shadow-indigo-900/30 transform md:-translate-y-4 flex flex-col overflow-hidden">
                            {/* Popular Badge */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
                            <div className="absolute top-6 left-6 py-1 px-4 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-bold backdrop-blur-md">
                                الأكثر شيوعاً
                            </div>

                            <div className="mb-8 relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">النمو (Growth)</h3>
                                <p className="text-indigo-200 font-medium">القوة الكاملة لنمو فروعك وتوسعاتك</p>
                            </div>
                            
                            <div className="mb-8 flex items-baseline gap-2 relative z-10">
                                <span className="text-5xl font-extrabold text-white">590</span>
                                <span className="text-xl text-indigo-300 font-bold font-arabic">ج.م / شهرياً</span>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1 relative z-10">
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="bg-indigo-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-indigo-300 shrink-0" /></div>
                                    <span>لحد <strong className="text-indigo-300 mx-1 border-b-2 border-indigo-500/30">500</strong> عميل مسجل</span>
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="bg-indigo-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-indigo-300 shrink-0" /></div>
                                    <span><strong className="text-indigo-300 mx-1 border-b-2 border-indigo-500/30">5</strong> رموز QR Code للفروع</span>
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="bg-indigo-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-indigo-300 shrink-0" /></div>
                                    <span>كل مميزات باقة الـ Starter</span>
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="bg-indigo-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-indigo-300 shrink-0" /></div>
                                    <span>تقارير وتحليلات متقدمة لقراراتك</span>
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="bg-indigo-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-indigo-300 shrink-0" /></div>
                                    <span>هوية بصرية مخصصة (Custom Branding)</span>
                                </li>
                                <li className="flex items-center gap-3 text-indigo-200 font-medium bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 mt-4">
                                     الأفضل للأنشطة المتوسعة التي تبحث عن استقرار المبيعات باحترافية.
                                </li>
                            </ul>

                            <Link to="/auth/signup?plan=growth" className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:from-indigo-400 hover:to-purple-500 transition-all text-center shadow-lg shadow-indigo-500/25 relative z-10 hover:scale-[1.02]">
                                ابدأ الآن بـ Growth
                            </Link>
                            
                            {/* Abstract Glow Rings behind button */}
                            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] border border-white/5 rounded-full" />
                            <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] border border-indigo-500/10 rounded-full" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- 7. FINAL CTA --- */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white" />

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">مستعد تكبّر مبيعاتك؟</h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">ابدأ دلوقتي مع ولاء+ وخلي عملاءك يتحولوا لمسوقين لمشروعك.</p>

                        <Link to="/auth/signup" className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-bold text-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)] hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-105">
                            ابدأ الآن مجاناً
                            <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                        </Link>

                        <p className="mt-6 text-gray-500 font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            بدون كارت ائتماني، جرّب 14 يوم مجاناً
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-indigo-600 w-5 h-5" />
                        <span className="text-xl font-bold text-gray-900">ولاء+</span>
                    </div>
                    <div className="flex gap-6 text-gray-500 font-medium">
                        <a href="#" className="hover:text-indigo-600 transition-colors">الشروط والأحكام</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">سياسة الخصوصية</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">المساعدة</a>
                    </div>
                    <p className="text-gray-400">© 2024 ولاء+ جميع الحقوق محفوظة</p>
                </div>
            </footer>
        </div>
    );
}

function ChevronLeftIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}
