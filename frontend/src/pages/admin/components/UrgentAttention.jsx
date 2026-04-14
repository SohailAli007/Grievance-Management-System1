import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const UrgentAttention = ({ cases }) => {
    const urgentCases = cases || [];

    return (
        <div className="dashboard-card p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    Urgent Attention <FaExclamationCircle className="text-rose-500 animate-pulse" />
                </h3>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                {urgentCases.length > 0 ? urgentCases.map((c, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <span className="text-[10px] font-black text-slate-600">#{c.id?.substring(0, 4)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <h4 className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">{c.title}</h4>
                                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                                    {c.status === 'REJECTED' ? 'REJECTED' : 'OVERDUE'}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate font-medium">{c.locationText || 'No location provided'}</p>
                        </div>
                    </motion.div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2">
                        <FaExclamationCircle className="text-3xl opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No urgent cases</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UrgentAttention;
