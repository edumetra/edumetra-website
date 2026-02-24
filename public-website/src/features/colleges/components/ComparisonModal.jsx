import React from 'react';
import { X, Check, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComparisonModal = ({ isOpen, onClose, colleges, onRemove }) => {
    if (!isOpen) return null;

    const parameters = [
        { label: 'Location', key: 'location' },
        { label: 'Country', key: 'country' },
        { label: 'Type', key: 'type' },
        { label: 'Fees', key: 'fees' },
        { label: 'Ranking', key: 'ranking' },
        { label: 'Cutoff', key: 'cutoff' },
        { label: 'Rating', key: 'rating' },
        { label: 'Facilities', key: 'facilities', render: (val) => val.join(', ') },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-6xl max-h-[90vh] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800">
                        <h2 className="text-2xl font-bold text-white">Compare Colleges</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="overflow-auto flex-1 p-6 scrollbar-custom">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 bg-slate-800/50 min-w-[200px] border-b border-slate-700">Detailed Comparison</th>
                                    {colleges.map(college => (
                                        <th key={college.id} className="p-4 min-w-[250px] border-b border-slate-700 relative group">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600 mb-3">
                                                    <img src={college.images[0]} alt={college.name} className="w-full h-full object-cover" />
                                                </div>
                                                <h3 className="font-bold text-white text-lg mb-1">{college.name}</h3>
                                                <p className="text-sm text-slate-400">{college.location}</p>

                                                <button
                                                    onClick={() => onRemove(college.id)}
                                                    className="mt-2 text-xs text-red-500 hover:text-red-400 underline opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                    {colleges.length < 3 && (
                                        <th className="p-4 border-b border-slate-700">
                                            <div className="flex flex-col items-center justify-center text-slate-500 h-full min-h-[150px] border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                                                Add College
                                            </div>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {parameters.map((param, idx) => (
                                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 font-semibold text-slate-300 bg-slate-800/30">{param.label}</td>
                                        {colleges.map(college => (
                                            <td key={college.id} className="p-4 text-slate-200">
                                                {param.render
                                                    ? param.render(college[param.key])
                                                    : college[param.key]
                                                }
                                            </td>
                                        ))}
                                        {colleges.length < 3 && <td className="p-4"></td>}
                                    </tr>
                                ))}
                                <tr>
                                    <td className="p-4 font-semibold text-slate-300 bg-slate-800/30">Action</td>
                                    {colleges.map(college => (
                                        <td key={college.id} className="p-4">
                                            <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                                                Fast Apply
                                            </button>
                                        </td>
                                    ))}
                                    {colleges.length < 3 && <td className="p-4"></td>}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ComparisonModal;
