import React from 'react';
import { FaClipboardList, FaEllipsisV } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StatsOverview = ({ analytics }) => {
    const [trendView, setTrendView] = React.useState('monthly'); // 'weekly', 'monthly', 'daily'

    if (!analytics) return <div className="p-10 text-center">Loading Stats...</div>;

    const trendData = analytics.charts.trend[trendView] || [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-overview"
        >
            {/* Stats Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card blue">
                    <div>
                        <p className="stat-label">Total Complaints Today</p>
                        <p className="stat-value">{analytics.stats.today}</p>
                    </div>
                    <FaClipboardList className="text-3xl text-blue-100" />
                </div>
                <div className="admin-stat-card yellow">
                    <div>
                        <p className="stat-label">Pending</p>
                        <p className="stat-value">{analytics.stats.pending}</p>
                    </div>
                    <div className="h-10 w-10 border-4 border-yellow-100 flex items-center justify-center font-bold text-yellow-600 rounded-full">
                        {analytics.stats.pending}
                    </div>
                </div>
                <div className="admin-stat-card green">
                    <div>
                        <p className="stat-label">Resolved</p>
                        <p className="stat-value">{analytics.stats.resolved}</p>
                    </div>
                    <div className="h-10 w-10 border-4 border-green-100 flex items-center justify-center font-bold text-green-600 rounded-full">
                        {analytics.stats.resolved}
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="admin-charts-grid">
                <div className="admin-chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Complaints by Department</h3>
                        <FaEllipsisV className="text-slate-300 pointer" />
                    </div>
                    <div className="donut-chart-box">
                        <svg className="donut-svg" viewBox="0 0 100 100">
                            {analytics.charts.department.length > 0 ? analytics.charts.department.map((d, i) => {
                                const total = analytics.charts.department.reduce((a, b) => a + b.count, 0);
                                let offset = 0;
                                for (let j = 0; j < i; j++) offset += (analytics.charts.department[j].count / total) * 100;
                                const color = colors[i % colors.length];
                                return (
                                    <circle
                                        key={d.name}
                                        className="donut-segment"
                                        cx="50" cy="50" r="40"
                                        stroke={color}
                                        strokeDasharray={`${(d.count / total) * 251.2} 251.2`}
                                        strokeDashoffset={-(offset / 100) * 251.2}
                                        strokeWidth="20"
                                        fill="none"
                                    />
                                );
                            }) : <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="20" fill="none" />}
                        </svg>
                        <div className="donut-legend">
                            {analytics.charts.department.slice(0, 5).map((d, i) => (
                                <div key={d.name} className="legend-item">
                                    <div className="legend-color" style={{ backgroundColor: colors[i % colors.length] }} />
                                    <span>{d.name.substring(0, 20)}... ({d.percentage}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="admin-chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title text-capitalize">{trendView} Complaints Trend</h3>
                        <div className="flex gap-2 text-[10px] font-bold">
                            <button
                                className={`px-2 py-1 rounded ${trendView === 'daily' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                                onClick={() => setTrendView('daily')}
                            >Daily</button>
                            <button
                                className={`px-2 py-1 rounded ${trendView === 'weekly' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                                onClick={() => setTrendView('weekly')}
                            >Weekly</button>
                            <button
                                className={`px-2 py-1 rounded ${trendView === 'monthly' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                                onClick={() => setTrendView('monthly')}
                            >Monthly</button>
                        </div>
                    </div>
                    <div className="bar-chart-box h-[180px] flex items-end justify-between px-2 gap-2">
                        {trendData.length > 0 ? (() => {
                            const totals = trendData.map(x => x.total || 0);
                            const max = Math.max(...totals, 1);

                            return trendData.map((m, i) => {
                                const totalHeight = m.total > 0 ? Math.max((m.total / max) * 120, 4) : 0;
                                const resolvedHeight = m.resolved > 0 ? Math.max((m.resolved / max) * 120, 4) : 0;

                                return (
                                    <div key={`${m.label}-${i}`} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                                        <div className="flex items-end justify-center gap-1 w-full h-full pb-1 border-b border-slate-100 relative">
                                            {/* Total Bar */}
                                            <div
                                                className="w-2 md:w-3 bg-blue-500 rounded-t-sm transition-all duration-500 relative group"
                                                style={{ height: `${totalHeight}px` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                                    Total: {m.total}
                                                </div>
                                            </div>

                                            {/* Resolved Bar */}
                                            <div
                                                className="w-2 md:w-3 bg-green-500 rounded-t-sm transition-all duration-500 relative group"
                                                style={{ height: `${resolvedHeight}px` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                                    Resolved: {m.resolved}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 rotate-0 truncate w-full text-center">{m.label}</span>
                                    </div>
                                );
                            });
                        })() : <p className="text-xs text-slate-400 w-full text-center pb-10 self-center">No trend data available for this view</p>}
                    </div>
                </div>
            </div>

            {/* Bottom Grid for Overdue and Problem Areas */}
            <div className="admin-charts-grid mt-6">
                <div className="admin-chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Overdue Complaints</h3>
                        <FaEllipsisV className="text-slate-300 pointer" />
                    </div>
                    <div className="overdue-list">
                        {analytics.stats.overdue > 0 ? (
                            <div className="flex items-center justify-center h-40 flex-col gap-2">
                                <span className="text-4xl font-bold text-red-600">{analytics.stats.overdue}</span>
                                <span className="text-slate-500 text-sm">Complaints pending over 48h</span>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-10">No overdue complaints</p>
                        )}
                    </div>
                </div>

                <div className="admin-chart-container">
                    <div className="chart-header">
                        <h3 className="chart-title">Top Problem Areas (This Month)</h3>
                        <FaEllipsisV className="text-slate-300 pointer" />
                    </div>
                    <div className="problem-areas-list px-2 space-y-4">
                        {analytics.problemAreas && analytics.problemAreas.length > 0 ? (
                            analytics.problemAreas.map((p, i) => {
                                const counts = analytics.problemAreas.map(pa => pa.count);
                                const maxCount = counts.length > 0 ? Math.max(...counts, 1) : 1;
                                return (
                                    <div key={p.area || i} className="flex items-center gap-4">
                                        <span className="text-slate-600 text-sm font-semibold flex-1 truncate">{p.area || `Unknown Area ${i + 1}`}</span>
                                        <div className="flex items-center gap-2 w-32">
                                            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(p.count / maxCount) * 100}%`,
                                                        backgroundColor: colors[i % colors.length]
                                                    }}
                                                />
                                            </div>
                                            <span className="text-slate-800 text-sm font-bold min-w-[20px] text-right">{p.count}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-slate-400 text-center py-10 italic">No problem areas recorded this month</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StatsOverview;
