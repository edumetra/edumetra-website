import React from 'react';
import { MapPin, Star, Award, CheckCircle, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CollegeCard = ({ college, onCompare, isSelected }) => {
    return (
        <motion.div
            className="card group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={college.images[0]}
                    alt={college.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                <div className="absolute top-4 right-4 z-10">
                    <button className="p-2 bg-slate-900/50 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap gap-2">
                    {college.badges.map((badge, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-red-500/90 text-white rounded-md backdrop-blur-sm">
                            <Award className="w-3 h-3" />
                            {badge}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 mb-1 group-hover:text-red-400 transition-colors line-clamp-1" title={college.name}>
                            {college.name}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                            <MapPin className="w-3 h-3" />
                            {college.location}, {college.country}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-sm font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            {college.rating}
                        </div>
                        <span className="text-xs text-slate-500 mt-1">{college.reviews} Reviews</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 py-4 border-t border-slate-700/50 border-b">
                    <div className="text-center border-r border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Total Fees</div>
                        <div className="text-sm font-bold text-slate-200">{college.fees}</div>
                    </div>
                    <div className="text-center border-r border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Ranking</div>
                        <div className="text-sm font-bold text-slate-200">{college.ranking}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Cutoff</div>
                        <div className="text-sm font-bold text-slate-200">{college.cutoff}</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {college.facilities.slice(0, 3).map((facility, idx) => (
                        <span key={idx} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-slate-500" />
                            {facility}
                        </span>
                    ))}
                    {college.facilities.length > 3 && (
                        <span className="text-xs text-slate-500 px-2 py-1">+ {college.facilities.length - 3} more</span>
                    )}
                </div>

                <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                        View Details
                    </button>
                    <button
                        onClick={() => onCompare(college)}
                        className={`flex-1 px-4 py-2.5 border-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${isSelected
                                ? 'border-red-500 bg-red-500/10 text-red-500'
                                : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
                            }`}
                    >
                        {isSelected ? 'Added to Compare' : 'Add to Compare'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CollegeCard;
