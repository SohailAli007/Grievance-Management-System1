import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle, FaFacebookF, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import AnimatedBackground from '../../components/AnimatedBackground.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form);
    if (!result.success) {
      setError(result.error || 'Unable to login');
      return;
    }

    // Create department slug from department name
    const getDeptSlug = (deptName) => {
      if (!deptName) return 'general';
      return deptName.toLowerCase().replace(/\s+/g, '-');
    };

    const defaultRoute =
      result.user?.role === 'OFFICER'
        ? `/officer/${getDeptSlug(result.user?.departmentName)}`
        : result.user?.role === 'ADMIN'
          ? '/admin'
          : '/citizen/track-complaints';

    const from = location.state?.from?.pathname || defaultRoute;
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 bg-white rounded-[30px] shadow-2xl overflow-hidden max-w-4xl w-full mx-4 min-h-[500px] flex flex-col md:flex-row">

        {/* Left Side - Login Form */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-white order-2 md:order-1 z-10"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Login</h1>

          {/* Social Icons */}
          <div className="flex gap-4 mb-6">
            <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <FaGoogle size={18} />
            </button>
            <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <FaFacebookF size={18} />
            </button>
            <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <FaGithub size={18} />
            </button>
            <button className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <FaLinkedinIn size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400"
                placeholder="Email"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400"
                placeholder="Password"
              />
            </div>

            {error && <p className="text-xs text-rose-500 text-center">{error}</p>}

            <div className="text-center">
              <a href="#" className="text-xs text-slate-500 hover:text-slate-700 font-medium">Forget Your Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white text-xs font-bold py-3.5 rounded-lg uppercase tracking-wider hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 mt-4 disabled:opacity-70"
            >
              {loading ? <LoadingSpinner label="" size="sm" /> : 'Login'}
            </button>
          </form>
        </motion.div>

        {/* Right Side - Info Panel (Blue Zone) */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full md:w-1/2 bg-gradient-to-br from-primary-600 to-indigo-800 text-white p-8 md:p-12 flex flex-col justify-center items-center text-center relative order-1 md:order-2 md:rounded-l-[100px] shadow-[-10px_0_20px_rgba(0,0,0,0.1)] z-20"
        >
          <div className="relative z-10 max-w-xs">
            <h2 className="text-3xl font-bold mb-4">Welcome to GMS</h2>
            <p className="text-sm text-white/90 mb-8 leading-relaxed">
              A serverless grievance management system for citizens, officers, and administrators.
            </p>

            <div className="space-y-2 text-xs text-white/80 mb-8 text-left inline-block pl-4 border-l-2 border-white/20">
              <p>• File and track grievances online</p>
              <p>• Officer workflow for resolving complaints</p>
              <p>• Admin analytics and user management</p>
            </div>

            <Link
              to="/register"
              className="inline-block border border-white rounded-lg px-10 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-primary-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
