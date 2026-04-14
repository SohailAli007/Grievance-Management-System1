import React from 'react';
import { motion } from 'framer-motion';

const DepartmentPerformance = ({ depts }) => {
    const departments = depts || [
        { name: 'Road Department', count: 45, percentage: 30 },
        { name: 'Water Supply', count: 32, percentage: 22 },
        { name: 'Electricity', count: 28, percentage: 18 },
        { name: 'Sanitation', count: 22, percentage: 15 },
        { name: 'Street Light', count: 18, percentage: 15 }
    ];

    const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];

    return (
        <div className="dashboard-card p-6 h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Department Performance</h3>
            <div className="flex-1 space-y-5 overflow-y-auto pr-1 custom-scrollbar">
                {departments.map((dept, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-slate-600">{dept.name}</span>
                            <span className="text-[10px] font-black text-slate-400">{dept.count} cases</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${dept.percentage}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`h-full ${colors[idx % colors.length]} rounded-full shadow-sm`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DepartmentPerformance;
