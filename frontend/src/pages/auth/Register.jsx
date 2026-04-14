import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle, FaFacebookF, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import AnimatedBackground from '../../components/AnimatedBackground.jsx';
import { register as registerApi } from '../../api/api.js';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'Citizen' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Placeholder API call
      await registerApi(form);
      setSuccess('Registration simulated successfully. You can now login.');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 bg-white rounded-[30px] shadow-2xl overflow-hidden max-w-4xl w-full mx-4 min-h-[500px] flex flex-col md:flex-row">

        {/* Left Side - Info Panel (Blue Zone) - REVERSED */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full md:w-1/2 bg-gradient-to-br from-primary-600 to-indigo-800 text-white p-8 md:p-12 flex flex-col justify-center items-center text-center relative order-1 md:rounded-r-[100px] shadow-[10px_0_20px_rgba(0,0,0,0.1)] z-20"
        >
          <div className="relative z-10 max-w-xs">
            <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-sm text-white/90 mb-8 leading-relaxed">
              To keep connected with us please login with your personal info
            </p>

            <Link
              to="/login"
              className="inline-block border border-white rounded-lg px-10 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-primary-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </motion.div>

        {/* Right Side - Register Form - REVERSED */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center bg-white order-2 z-10"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Create Account</h1>

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

          {/* <span className="text-xs text-slate-400 mb-6 font-medium">or use your email for registration</span> */}

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400"
                placeholder="Name"
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400"
                placeholder="Email Address"
              />
            </div>
            <div>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-slate-100 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 placeholder-slate-400"
                placeholder="Phone Number"
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
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
            {success && <p className="text-xs text-emerald-600 text-center">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white text-xs font-bold py-3.5 rounded-lg uppercase tracking-wider hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 mt-4 disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}

export default Register;
