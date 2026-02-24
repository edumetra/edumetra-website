
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';


export const StatCard = ({ icon: Icon, label, value, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-5 rounded-2xl hover:border-blue-500/30 hover:bg-slate-800/50 transition-all group"
    >
        <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            </div>
        </div>
        <div className="text-slate-400 text-sm font-medium mb-1">{label}</div>
        <div className="text-white font-bold text-lg truncate">{value}</div>
    </motion.div>
);

export const PlacementHighlight = ({ label, value, subtext }) => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/10 transition-colors" />
        <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">{label}</div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {subtext && <div className="text-sm text-green-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {subtext}</div>}
    </div>
);
