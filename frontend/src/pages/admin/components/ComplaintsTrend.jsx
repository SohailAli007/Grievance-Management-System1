import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ComplaintsTrend = ({ trendData }) => {
    const [filter, setFilter] = useState('Weekly');
    const filters = ['Today', 'Weekly', 'Monthly', 'Yearly'];

    // Map backend trend keys to display filters
    const trendKey = filter.toLowerCase();
    const currentTrend = trendData?.[trendKey] || [];

    const maxVal = Math.max(...currentTrend.map(d => d.total), 10);
    const chartHeight = 180;
    const chartWidth = 400;

    return (
        <div className="dashboard-card p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Complaints Trend</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 relative min-h-[180px]">
                {currentTrend.length > 0 ? (
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                            <line
                                key={i}
                                x1="0"
                                y1={chartHeight * p}
                                x2={chartWidth}
                                y2={chartHeight * p}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                            />
                        ))}

                        {/* Area */}
                        <path
                            d={`M 0,${chartHeight} ${currentTrend.map((d, i) =>
                                `L ${(i / (currentTrend.length - 1)) * chartWidth},${chartHeight - (d.total / maxVal) * chartHeight}`
                            ).join(' ')} L ${chartWidth},${chartHeight} Z`}
                            fill="url(#gradient)"
                            opacity="0.2"
                        />

                        {/* Line */}
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            d={`M 0,${currentTrend.length > 0 ? chartHeight - (currentTrend[0].total / maxVal) * chartHeight : chartHeight} ${currentTrend.map((d, i) =>
                                `L ${(i / (currentTrend.length - 1)) * chartWidth},${chartHeight - (d.total / maxVal) * chartHeight}`
                            ).join(' ')}`}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Dots */}
                        {currentTrend.map((d, i) => (
                            <circle
                                key={i}
                                cx={(i / (currentTrend.length - 1)) * chartWidth}
                                cy={chartHeight - (d.total / maxVal) * chartHeight}
                                r="4"
                                fill="white"
                                stroke="#2563eb"
                                strokeWidth="2"
                            />
                        ))}

                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 text-xs font-bold uppercase tracking-widest">
                        No data available
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-4">
                {currentTrend.map((d, i) => (
                    <span key={i} className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {d.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ComplaintsTrend;
