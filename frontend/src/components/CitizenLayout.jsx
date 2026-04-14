import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { FaHome, FaFileAlt, FaSignOutAlt, FaBars, FaTimes, FaUser, FaCog, FaCamera, FaQuestionCircle, FaInfoCircle, FaGlobe } from 'react-icons/fa';

function CitizenLayout({ children }) {
    const { user, logout } = useAuth();
    const { t, language, changeLanguage, availableLanguages } = useLanguage();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-md ${isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="h-screen w-full flex flex-col bg-[#F3F4F6] overflow-hidden text-slate-800 font-sans">
            {/* Top Header - Gradient Blue */}
            <header className="flex-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-16 flex items-center justify-between px-4 shadow-md z-30 relative">
                <div className="flex items-center gap-3">
                    <button onClick={toggleSidebar} className="md:hidden text-white focus:outline-none p-1">
                        {isSidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                    </button>
                    <h1 className="text-xl font-bold tracking-wide">GMS</h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                const currentIndex = availableLanguages.findIndex(l => l.code === language);
                                const nextIndex = (currentIndex + 1) % availableLanguages.length;
                                changeLanguage(availableLanguages[nextIndex].code);
                            }}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                            title="Change Language"
                        >
                            <FaGlobe className="text-base" />
                            <span className="text-xs">{availableLanguages.find(l => l.code === language)?.nativeName}</span>
                        </button>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 focus:outline-none hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                        >
                            <span className="text-sm font-medium max-w-[100px] truncate">
                                {user?.name || "User"}
                            </span>
                            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 overflow-hidden relative">
                                {(user?.image || user?.imageUrl) ? (
                                    <img src={user.image || user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                                )}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <button onClick={() => { setIsProfileOpen(false); navigate('/citizen/profile'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                    <FaUser className="text-slate-400" /> {t('myProfile')}
                                </button>

                                <button onClick={() => { setIsProfileOpen(false); navigate('/citizen/settings'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                    <FaCog className="text-slate-400" /> {t('settings')}
                                </button>

                                <button onClick={() => { setIsProfileOpen(false); navigate('/citizen/help'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                    <FaQuestionCircle className="text-slate-400" /> {t('helpSupport')}
                                </button>

                                <button onClick={() => { setIsProfileOpen(false); navigate('/citizen/about'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                    <FaInfoCircle className="text-slate-400" /> {t('aboutUs')}
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>

                                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors">
                                    <FaSignOutAlt /> {t('logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm z-20">
                    <div className="p-4 flex-1 overflow-y-auto">
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Menu</p>
                        <nav className="flex flex-col gap-1">
                            <NavLink to="/citizen" className={linkClasses} end>
                                <FaHome /> {t('home')}
                            </NavLink>

                            <NavLink to="/citizen/track-complaints" className={linkClasses}>
                                <FaFileAlt /> {t('trackComplaints')}
                            </NavLink>
                        </nav>
                    </div>
                    {/* Logout removed from here as requested */}
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="absolute inset-0 z-40 bg-black/50 md:hidden animate-in fade-in duration-200" onClick={closeSidebar}></div>
                )}

                {/* Mobile Sidebar Menu */}
                <div className={`absolute top-0 left-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col border-r border-slate-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 flex-1 overflow-y-auto">
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Menu</p>
                        <nav className="flex flex-col gap-1">
                            <NavLink to="/citizen" className={linkClasses} onClick={closeSidebar} end>
                                <FaHome /> {t('home')}
                            </NavLink>

                            <NavLink to="/citizen/track-complaints" className={linkClasses} onClick={closeSidebar}>
                                <FaFileAlt /> {t('trackComplaints')}
                            </NavLink>
                        </nav>
                    </div>
                    {/* Logout removed from here as requested */}
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F3F4F6] relative w-full">
                    <div className="max-w-3xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CitizenLayout;
