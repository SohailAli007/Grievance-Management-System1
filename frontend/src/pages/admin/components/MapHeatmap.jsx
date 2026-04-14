import React from 'react';
import { FaMapMarkerAlt, FaFire } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MapHeatmap = () => {
    // Mathura coordinates approximately: 27.4924° N, 77.6737° E
    // Mocking heatmap points
    const points = [
        { x: 40, y: 30, size: 60, intensity: 'high' },
        { x: 65, y: 45, size: 45, intensity: 'medium' },
        { x: 30, y: 60, size: 35, intensity: 'low' },
        { x: 75, y: 25, size: 40, intensity: 'medium' }
    ];

    const getColor = (intensity) => {
        switch (intensity) {
            case 'high': return 'bg-rose-500/40';
            case 'medium': return 'bg-orange-500/40';
            case 'low': return 'bg-amber-500/40';
            default: return 'bg-blue-500/40';
        }
    };

    return (
        <div className="dashboard-card p-6 h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 z-10">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    City Heatmap <span className="text-[10px] font-bold text-slate-400 font-sans tracking-normal bg-slate-100 px-2 py-0.5 rounded-full ml-1">Mathura</span>
                </h3>
                <FaMapMarkerAlt className="text-blue-600" />
            </div>

            <div className="flex-1 rounded-xl bg-slate-100 relative overflow-hidden group">
                {/* Mock Map Background - Stylized */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.6737,27.4924,12/400x300@2x?access_token=pk.eyJ1Ijoic29oYWlsYWxpIiwiYSI6ImNreTNoeG9ndDA1eGgybm16dnV6Znc2ZncifQ.placeholder')] bg-cover bg-center grayscale" />

                {/* Placeholder Grid lines for map feel */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                    {[...Array(36)].map((_, i) => <div key={i} className="border border-black" />)}
                </div>

                {/* Heatmap Points */}
                {points.map((p, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            transform: 'translate(-50%, -50%)'
                        }}
                        className={`absolute rounded-full blur-xl ${getColor(p.intensity)} animate-pulse shadow-2xl`}
                    />
                ))}

                <div className="absolute bottom-3 left-3 flex gap-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-white/50 shadow-sm z-10">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">High</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Med</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Low</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapHeatmap;
