
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

export const PlacementChart = ({ stats }) => {
    // Only include metrics that actually exist in the DB
    const data = [
        { label: 'Highest Package', value: stats?.highest_package, amount: 90, color: 'bg-blue-500' },
        { label: 'Average Package', value: stats?.average_package, amount: 40, color: 'bg-indigo-500' },
        { label: 'Median Package', value: stats?.median_package, amount: 35, color: 'bg-purple-500' },
    ].filter(item => item.value);

    // If no stats at all, don't render the chart container
    if (data.length === 0 && !stats?.placement_rate && !stats?.recruiters_count) return null;

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Placement Highlights</h3>
            {data.length > 0 && (
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
            )}

            {(stats?.placement_rate || stats?.recruiters_count) && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                    {stats?.placement_rate && (
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
                            <div className="text-3xl font-bold text-white mb-1">{stats.placement_rate}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Placement Rate</div>
                        </div>
                    )}
                    {stats?.recruiters_count && (
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
                            <div className="text-3xl font-bold text-white mb-1">{stats.recruiters_count}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Recruiters</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
