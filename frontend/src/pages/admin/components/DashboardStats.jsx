import React from 'react';
import { FaClipboardList, FaClock, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaHistory } from 'react-icons/fa';
import { motion } from 'framer-motion';

const DashboardStats = ({ stats }) => {
    const cards = [
        {
            title: 'Total Complaints Today',
            value: stats?.today || 0,
            icon: <FaClipboardList />,
            color: 'bg-blue-500',
            lightColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Pending Complaints',
            value: stats?.pending || 0,
            icon: <FaExclamationTriangle />,
            color: 'bg-orange-500',
            lightColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
        {
            title: 'In-Progress Complaints',
            value: stats?.inProgress || 0,
            icon: <FaSpinner className="animate-spin-slow" />,
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            title: 'Resolved Today',
            value: stats?.resolvedToday || 0,
            icon: <FaCheckCircle />,
            color: 'bg-emerald-500',
            lightColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            title: 'Escalated Cases',
            value: stats?.escalated || 0,
            icon: <FaHistory />,
            color: 'bg-rose-500',
            lightColor: 'bg-rose-50',
            textColor: 'text-rose-600',
            isUrgent: true
        },
        {
            title: 'Avg Resolution Time',
            value: stats?.avgResolutionTime || '0 hrs',
            icon: <FaClock />,
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-50',
            textColor: 'text-indigo-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {cards.map((card, idx) => (
                <motion.div
                    key={idx}
                    whileHover={{ y: -5, scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, type: "spring", stiffness: 300 }}
                    className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-between group cursor-pointer relative overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${card.lightColor} opacity-20 group-hover:scale-150 transition-transform duration-500`} />

                    <div className="flex flex-col relative z-10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5">
                            {card.title}
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">
                                {card.value}
                            </span>
                            {card.isUrgent && card.value > 0 && (
                                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                            )}
                        </div>
                    </div>
                    <div className={`${card.lightColor} ${card.textColor} p-3 rounded-xl text-xl transition-all duration-300 group-hover:bg-opacity-80 group-hover:scale-110 relative z-10`}>
                        {card.icon}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardStats;
