import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm z-20">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
          G
        </div>
        <div>
          <h1 className="text-base md:text-lg font-semibold text-slate-800">Grievance Management System</h1>
          <p className="text-xs text-slate-500 hidden md:block">Serverless Grievance Management Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {role && (
          <span className="text-xs md:text-sm px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
            Role: {role}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-xs md:text-sm px-3 py-1.5 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
