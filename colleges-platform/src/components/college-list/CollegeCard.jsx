import { Link } from 'react-router-dom';
import { MapPin, Star, Trophy, ArrowRight, Wallet, BookOpen } from 'lucide-react';

export default function CollegeCard({ college }) {
    return (
        <div className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/10 flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                <img
                    src={college.image}
                    alt={college.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    #{college.rank}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent md:hidden" />
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded mb-2 border border-slate-700">
                                {college.type}
                            </span>
                            <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                                {college.name}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-semibold text-slate-200">{college.rating}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                        <MapPin className="w-4 h-4 shrink-0" />
                        {college.location}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 py-4 border-y border-slate-800/50">
                        <div>
                            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                <Wallet className="w-3 h-3" /> Total Fees
                            </p>
                            <p className="text-sm font-semibold text-slate-200">{college.fees}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Avg. Package
                            </p>
                            <p className="text-sm font-semibold text-green-400">{college.avgPackage}</p>
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-xs text-slate-500 mb-1">Exam Accepted</p>
                            <p className="text-sm font-semibold text-slate-200">{college.exams}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-auto">
                    <button className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-red-900/20">
                        Apply Now
                    </button>
                    <Link
                        to={`/colleges/${college.id}`}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2 group/btn"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
