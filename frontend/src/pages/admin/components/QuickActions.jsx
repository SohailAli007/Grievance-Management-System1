import React from 'react';
import { FaBuilding, FaUserPlus, FaBullhorn, FaExclamationTriangle, FaFileExport } from 'react-icons/fa';
import { motion } from 'framer-motion';

const QuickActions = ({ onAction }) => {
    const actions = [
        { label: 'Add Department', icon: <FaBuilding />, color: 'bg-blue-600', action: 'add_dept' },
        { label: 'Add Officer', icon: <FaUserPlus />, color: 'bg-indigo-600', action: 'add_officer' },
        { label: 'Broadcast Notice', icon: <FaBullhorn />, color: 'bg-emerald-600', action: 'broadcast' },
        { label: 'Emergency Alert', icon: <FaExclamationTriangle />, color: 'bg-rose-600', action: 'emergency' },
        { label: 'Export Report', icon: <FaFileExport />, color: 'bg-slate-700', action: 'export' }
    ];

    return (
        <div className="dashboard-card p-6 h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 flex-1 overflow-auto custom-scrollbar">
                {actions.map((action, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAction(action.action)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl text-white shadow-lg shadow-${action.color.split('-')[1]}-500/20 transition-all ${action.color} group relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                        <span className="text-xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">
                            {action.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
