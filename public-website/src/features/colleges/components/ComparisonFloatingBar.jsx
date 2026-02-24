import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ComparisonFloatingBar = ({ selectedColleges, onRemove, onCompareNow }) => {
    if (selectedColleges.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
            >
                <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
                        {selectedColleges.map(college => (
                            <div key={college.id} className="relative flex-shrink-0 group">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600">
                                    <img src={college.images[0]} alt={college.name} className="w-full h-full object-cover" />
                                </div>
                                <button
                                    onClick={() => onRemove(college.id)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
                                    {college.name}
                                </div>
                            </div>
                        ))}

                        {selectedColleges.length < 3 && (
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xs">
                                +{3 - selectedColleges.length}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pl-4 border-l border-slate-700/50">
                        <div className="hidden sm:block text-sm text-slate-400">
                            <span className="text-white font-bold">{selectedColleges.length}</span> / 3 Selected
                        </div>
                        <button
                            onClick={onCompareNow}
                            disabled={selectedColleges.length < 2}
                            className={`
                                px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap
                                ${selectedColleges.length >= 2
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-600/20'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }
                            `}
                        >
                            Compare Now
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ComparisonFloatingBar;
