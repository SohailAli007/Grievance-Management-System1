import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
  ${isActive ? 'bg-primary-100 text-primary-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

function Sidebar() {
    const { role } = useAuth();

    return (
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white/70 backdrop-blur-sm p-4 gap-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Navigation</h2>
            {role === 'CITIZEN' && (
                <>
                    <NavLink to="/citizen/file-complaint" className={linkClasses}>
                        <span className="h-2 w-2 rounded-full bg-primary-400" />
                        File Complaint
                    </NavLink>
                    <NavLink to="/citizen/track-complaints" className={linkClasses}>
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Track Complaints
                    </NavLink>
                </>
            )}
            {(role === 'ADMIN_OFFICER' || role === 'FIELD_OFFICER') && (
                <NavLink to="/officer" className={linkClasses}>
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Officer Dashboard
                </NavLink>
            )}
            {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                <NavLink to="/admin" className={linkClasses}>
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    Admin Dashboard
                </NavLink>
            )}
            {!role && <p className="text-xs text-slate-500">Login to view navigation</p>}
        </aside>
    );
}

export default Sidebar;
