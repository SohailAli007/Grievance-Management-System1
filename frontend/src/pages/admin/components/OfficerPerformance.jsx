import React from 'react';
import { FaUserCircle, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const OfficerPerformance = ({ officers }) => {
    const performanceData = officers || [
        { name: 'Dinesh Kumar', assigned: 78, completed: 72, avgTime: '3.2 hr', rating: '4.9' },
        { name: 'Vinay Shukla', assigned: 65, completed: 54, avgTime: '4.5 hr', rating: '4.6' },
        { name: 'Neha Gupta', assigned: 62, completed: 51, avgTime: '5.1 hr', rating: '4.4' },
        { name: 'Aman Verma', assigned: 55, completed: 49, avgTime: '4.8 hr', rating: '4.3' }
    ];

    return (
        <div className="dashboard-card p-6 h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Officer Performance</h3>
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="text-left pb-3 font-black">Officer</th>
                            <th className="text-center pb-3 font-black">Assigned</th>
                            <th className="text-center pb-3 font-black">Done</th>
                            <th className="text-center pb-3 font-black">Avg Time</th>
                            <th className="text-right pb-3 font-black">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {performanceData.map((officer, idx) => (
                            <motion.tr
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="py-4">
                                    <div className="flex items-center gap-2">
                                        <FaUserCircle className="text-lg text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        <span className="text-[11px] font-bold text-slate-700">{officer.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-center text-[11px] font-black text-slate-600">{officer.assigned}</td>
                                <td className="py-4 text-center text-[11px] font-black text-emerald-600">{officer.completed}</td>
                                <td className="py-4 text-center text-[11px] font-bold text-slate-500">{officer.avgTime}</td>
                                <td className="py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 font-black text-amber-500 text-[11px]">
                                        {officer.rating} <FaStar className="text-[9px]" />
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OfficerPerformance;
