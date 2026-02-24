
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

export const PlacementChart = ({ stats }) => {
    // Default data if stats are missing
    const data = [
        { label: 'Highest Package', value: stats?.highest_package || '45 LPA', amount: 90, color: 'bg-blue-500' },
        { label: 'Average Package', value: stats?.average_package || '12 LPA', amount: 40, color: 'bg-indigo-500' },
        { label: 'Median Package', value: stats?.median_package || '10 LPA', amount: 35, color: 'bg-purple-500' },
    ];

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Placement Trend</h3>
            <div className="space-y-6">
                {data.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300 font-medium">{item.label}</span>
                            <span className="text-white font-bold">{item.value}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.amount}%` }}
                                transition={{ duration: 1, delay: index * 0.2, type: "spring" }}
                                viewport={{ once: true }}
                                className={`h-full rounded-full ${item.color} relative`}
                            >
                                <div className="absolute inset-0 bg-white/20" />
                            </motion.div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
                    <div className="text-3xl font-bold text-white mb-1">{stats?.placement_rate || '94%'}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Placement Rate</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
                    <div className="text-3xl font-bold text-white mb-1">{stats?.recruiters_count || '150+'}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Recruiters</div>
                </div>
            </div>
        </div>
    );
};
