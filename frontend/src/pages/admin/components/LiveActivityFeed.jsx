import React from 'react';
import { motion } from 'framer-motion';

const LiveActivityFeed = ({ activities }) => {
    const liveActivities = activities || [
        { message: 'Citizen filed complaint #2384', time: '2 min ago', type: 'new' },
        { message: 'Officer started work on #2381', time: '15 min ago', type: 'progress' },
        { message: 'Work completed for #2377', time: '1 hr ago', type: 'resolved' },
        { message: 'Complaint #2359 escalated', time: '2 hr ago', type: 'escalated' }
    ];

    const getDotColor = (type) => {
        switch (type) {
            case 'new': return 'bg-blue-500';
            case 'progress': return 'bg-amber-500';
            case 'resolved': return 'bg-emerald-500';
            case 'escalated': return 'bg-rose-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="dashboard-card p-6 h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Live Activity Feed</h3>
            <div className="flex-1 space-y-6 overflow-y-auto pr-1 relative custom-scrollbar">
                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-slate-100" />
                {liveActivities.map((activity, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4 relative"
                    >
                        <div className={`w-2.5 h-2.5 rounded-full ${getDotColor(activity.type)} border-2 border-white shadow-sm z-10 mt-1`} />
                        <div className="flex-1 flex justify-between items-start pt-0.5">
                            <span className="text-[11px] font-bold text-slate-600 tracking-tight leading-none">{activity.message || activity.message}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap ml-4">{activity.time || 'a moment ago'}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default LiveActivityFeed;
