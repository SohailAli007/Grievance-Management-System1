import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaFacebookF, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import AnimatedBackground from '../../components/AnimatedBackground.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { register as registerApi } from '../../api/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

function AuthPage({ initialMode = 'login' }) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const navigate = useNavigate();
    const location = useLocation();
    const { login, role, loading: loginLoading } = useAuth();

    // Redirect Logic
    const from = location.state?.from?.pathname;

    // Removal of auto-redirect ensures that the app always "lands fresh" on the login page as requested.




    // Sync state with prop if it changes (e.g. navigation via URL)
    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode]);

    // Form States

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'CITIZEN' });

    const [registerLoading, setRegisterLoading] = useState(false);

    // Handlers
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const res = login(loginForm);

        toast.promise(res, {
            loading: 'Authenticating...',
            success: (data) => {
                const r = (data.user?.role || '').toLowerCase();
                const defaultRoute =
                    r === 'admin' ? '/admin' :
                        r === 'officer' ? '/officer' :
                            '/citizen';

                navigate(defaultRoute, { replace: true });


                const emailForGreet = data.user?.email || data.email || 'User';
                return `Welcome back, ${emailForGreet.split('@')[0]}!`;

            },

            error: (err) => err.message || 'Login failed'
        });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        const registerPromise = registerApi(registerForm);

        toast.promise(registerPromise, {
            loading: 'Creating your account...',
            success: () => {
                setTimeout(() => {
                    setIsLogin(true);
                    navigate('/login');
                }, 1500);
                return 'Registration successful! Redirecting to login...';
            },
            error: (err) => err.response?.data?.error || 'Registration failed'
        }).finally(() => setRegisterLoading(false));
    };

    const toggleMode = () => {
        const newMode = !isLogin;
        setIsLogin(newMode);
        // Clear forms when switching
        setLoginForm({ email: '', password: '' });
        setRegisterForm({ name: '', email: '', password: '', role: 'CITIZEN' });
        // Update URL without reloading page
        navigate(newMode ? '/login' : '/register', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <AnimatedBackground />

            {/* Main Container */}
            <div className="relative z-10 bg-white rounded-[30px] shadow-2xl overflow-hidden max-w-4xl w-full mx-4 min-h-[550px] flex relative">

                {/* LOGIN FORM (Always on Left) */}
                <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center p-8 md:p-12 transition-opacity duration-1000 ${isLogin ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
                    <h1 className="text-3xl font-bold text-slate-800 mb-6">Login</h1>
                    <div className="flex gap-4 mb-6">
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaGoogle size={18} /></button>
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaFacebookF size={18} /></button>
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaGithub size={18} /></button>
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaLinkedinIn size={18} /></button>
                    </div>
                    <form onSubmit={handleLoginSubmit} className="w-full max-w-sm space-y-4">
                        <input name="email" type="email" required value={loginForm.email} onChange={handleLoginChange} autoComplete="username email" className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400" placeholder="Email" />
                        <input name="password" type="password" required value={loginForm.password} onChange={handleLoginChange} autoComplete="current-password" className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400" placeholder="Password" />
                        <div className="text-center"><a href="#" className="text-xs text-slate-500 hover:text-slate-700 font-medium">Forget Your Password?</a></div>
                        <button type="submit" disabled={loginLoading} className="w-full bg-primary-600 text-white text-xs font-bold py-3.5 rounded-lg uppercase tracking-wider hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 mt-4 disabled:opacity-70">{loginLoading ? <LoadingSpinner label="" size="sm" /> : 'Login'}</button>
                    </form>
                </div>

                {/* REGISTER FORM (Always on Right) */}
                <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-center p-8 md:p-12 transition-opacity duration-1000 ${!isLogin ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}>
                    <h1 className="text-3xl font-bold text-slate-800 mb-6">Create Account</h1>
                    <div className="flex gap-4 mb-6">
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaGoogle size={18} /></button>
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaFacebookF size={18} /></button>
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaGithub size={18} /></button>
                        <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><FaLinkedinIn size={18} /></button>
                    </div>
                    <form onSubmit={handleRegisterSubmit} className="w-full max-w-sm space-y-4">
                        <input name="name" type="text" required value={registerForm.name} onChange={handleRegisterChange} autoComplete="off" className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400" placeholder="Name" />
                        <input name="email" type="email" required value={registerForm.email} onChange={handleRegisterChange} autoComplete="new-email off" className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400" placeholder="Email" />
                        <input name="password" type="password" required value={registerForm.password} onChange={handleRegisterChange} autoComplete="new-password" className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400" placeholder="Password" />

                        <button type="submit" disabled={registerLoading} className="w-full bg-primary-600 text-white text-xs font-bold py-3.5 rounded-lg uppercase tracking-wider hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 mt-4 disabled:opacity-70">{registerLoading ? 'Creating account...' : 'Register'}</button>
                    </form>
                </div>

                {/* --- SLIDING OVERLAY (Blue Panel) --- */}
                <motion.div
                    initial={false}
                    animate={{ x: isLogin ? '100%' : '0%' }}
                    transition={{ type: "tween", duration: 0.65, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-primary-600 to-indigo-800 text-white overflow-hidden z-50 flex flex-col justify-center items-center text-center shadow-2xl"
                    style={{
                        borderRadius: isLogin ? '100px 0 0 100px' : '0 100px 100px 0' // Dynamic rounding
                    }}
                >
                    {/* Overlay Content */}
                    <div className="relative z-10 p-12 flex flex-col items-center">
                        <AnimatePresence mode='wait'>
                            {isLogin ? (
                                <motion.div
                                    key="login-overlay"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-3xl font-bold mb-4">Welcome to GMS</h2>
                                    <p className="text-sm text-white/90 mb-8 leading-relaxed max-w-xs">Enter your personal details to create an account and start filing grievances.</p>
                                    <button onClick={toggleMode} className="inline-block border border-white rounded-lg px-10 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-primary-700 transition-colors">Register</button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register-overlay"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                                    <p className="text-sm text-white/90 mb-8 leading-relaxed max-w-xs">To stay connected with us please login with your personal info</p>
                                    <button onClick={toggleMode} className="inline-block border border-white rounded-lg px-10 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-primary-700 transition-colors">Login</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

export default AuthPage;
