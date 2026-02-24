import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchHeader({ query, onSearchChange, resultCount, onToggleFilters }) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 mb-6 sticky top-20 z-30">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search colleges, courses, or exams..."
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-slate-400 text-sm hidden md:block">
                        Found <span className="text-white font-semibold">{resultCount}</span> colleges
                    </div>

                    <button
                        onClick={onToggleFilters}
                        className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors w-full md:w-auto border border-slate-700"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>

                    <select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                        <option>Sort by: Rank</option>
                        <option>Sort by: Popularity</option>
                        <option>Sort by: Fees (Low to High)</option>
                        <option>Sort by: Fees (High to Low)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
