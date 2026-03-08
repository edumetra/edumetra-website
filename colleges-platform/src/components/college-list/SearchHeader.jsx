import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchHeader({ query, onSearchChange, resultCount, onToggleFilters, sort, onSortChange }) {
    return (
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-full px-5 py-3 mb-8 sticky top-24 z-30 shadow-2xl shadow-black/50 transition-all hover:bg-slate-900/80">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-2xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-red-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search colleges, courses, or exams..."
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 rounded-full pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-slate-400 text-sm hidden md:block px-2">
                        Found <span className="text-white font-bold">{resultCount}</span> colleges
                    </div>

                    <button
                        onClick={onToggleFilters}
                        className="lg:hidden flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors w-full md:w-auto border border-slate-600 shadow-md"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </button>

                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => onSortChange(e.target.value)}
                            className="appearance-none bg-slate-800 border border-slate-600 hover:border-slate-500 text-white text-sm rounded-full pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-md cursor-pointer"
                        >
                            <option value="rank_asc">Sort by: Higher Rank</option>
                            <option value="rating_desc">Sort by: Top Ratings</option>
                            <option value="fees_asc">Sort by: Lowest Fees</option>
                            <option value="fees_desc">Sort by: Premium Fees</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
