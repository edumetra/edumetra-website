import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCompare } from '../contexts/CompareContext';
import { Star, GitCompareArrows, MapPin, Trophy, Wallet, TrendingUp, Award, X } from 'lucide-react';

const FIELDS = [
    { key: 'rating', label: 'Rating ⭐', best: 'max', format: v => v ? `${v} / 5` : '—' },
    { key: 'fees', label: 'Total Fees', best: 'min_numeric', numeric_key: 'fees_numeric', format: v => v || '—' },
    { key: 'avg_package', label: 'Avg Package', best: 'max', format: v => v || '—' },
    { key: 'naac_grade', label: 'NAAC Grade', best: 'none', format: v => v || '—' },
    { key: 'stream', label: 'Stream', best: 'none', format: v => v || '—' },
    { key: 'type', label: 'Type', best: 'none', format: v => v || '—' },
    { key: 'location', label: 'Location', best: 'none', format: v => v || '—' },
    { key: 'review_count', label: 'Reviews', best: 'max', format: v => v ?? 0 },
    { key: 'exams', label: 'Exams Accepted', best: 'none', format: v => v || '—' },
    { key: 'established_year', label: 'Established', best: 'none', format: v => v || '—' },
];

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (compareList.length === 0) return;
        fetchDetails();
    }, [compareList]);

    const fetchDetails = async () => {
        setLoading(true);
        const ids = compareList.map(c => c.id);
        const { data } = await supabase
            .from('colleges')
            .select('id, name, location_city, location_state, type, stream, naac_grade, rating, review_count, avg_package, fees, fees_numeric, exams, established_year, image, rank')
            .in('id', ids);
        // Preserve compare order
        const ordered = ids.map(id => data?.find(d => d.id === id)).filter(Boolean).map(c => ({
            ...c,
            location: `${c.location_city}, ${c.location_state}`
        }));
        setColleges(ordered);
        setLoading(false);
    };

    const getBestIndex = (field) => {
        if (field.best === 'none') return -1;
        const values = colleges.map(c => {
            const val = field.numeric_key ? c[field.numeric_key] : c[field.key];
            return parseFloat(val) || 0;
        });
        if (values.every(v => v === 0)) return -1;
        if (field.best === 'max') return values.indexOf(Math.max(...values));
        if (field.best === 'min_numeric') {
            const nonZero = values.filter(v => v > 0);
            if (nonZero.length === 0) return -1;
            return values.indexOf(Math.min(...nonZero));
        }
        return -1;
    };

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center px-4">
                    <GitCompareArrows className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-white mb-3">No Colleges to Compare</h1>
                    <p className="text-slate-400 mb-6">Go browse colleges and click the Compare button to add them here.</p>
                    <Link to="/colleges" className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all">
                        Browse Colleges
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="bg-gradient-to-b from-slate-900 to-black pt-24 pb-8 border-b border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <GitCompareArrows className="w-6 h-6 text-red-400" />
                                <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Side by Side</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white">Compare Colleges</h1>
                        </div>
                        <button onClick={clearCompare} className="text-sm text-slate-500 hover:text-red-400 transition-colors">
                            Clear All
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="text-slate-400 text-center py-20 animate-pulse">Loading details...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            {/* College Headers */}
                            <thead>
                                <tr>
                                    <td className="w-36 pr-4 pb-6 align-bottom">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Attribute</span>
                                    </td>
                                    {colleges.map(college => (
                                        <td key={college.id} className="pb-6 px-4 align-top min-w-[220px]">
                                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                                <div className="relative h-32 bg-slate-800">
                                                    {college.image && (
                                                        <img src={college.image} alt={college.name} className="w-full h-full object-cover opacity-80" />
                                                    )}
                                                    <button
                                                        onClick={() => removeFromCompare(college.id)}
                                                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-lg text-white transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                    {college.rank && (
                                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                                                            <Trophy className="w-3 h-3" /> #{college.rank}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{college.name}</h3>
                                                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                        <MapPin className="w-3 h-3" />{college.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                    {/* Empty slot if < 3 */}
                                    {colleges.length < 3 && (
                                        <td className="pb-6 px-4 align-top min-w-[220px]">
                                            <Link to="/colleges" className="flex flex-col items-center justify-center h-[186px] border-2 border-dashed border-slate-800 rounded-2xl hover:border-red-500/40 transition-colors group">
                                                <span className="text-slate-700 group-hover:text-slate-500 text-3xl mb-2">+</span>
                                                <span className="text-slate-600 text-xs">Add college</span>
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            </thead>

                            {/* Attribute Rows */}
                            <tbody>
                                {FIELDS.map((field, fi) => {
                                    const bestIdx = getBestIndex(field);
                                    return (
                                        <tr key={field.key} className={fi % 2 === 0 ? 'bg-slate-900/30' : ''}>
                                            <td className="pr-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                {field.label}
                                            </td>
                                            {colleges.map((college, ci) => (
                                                <td
                                                    key={college.id}
                                                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${bestIdx === ci ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-300'}`}
                                                >
                                                    {field.format(college[field.key])}
                                                    {bestIdx === ci && <span className="ml-1 text-xs">✓</span>}
                                                </td>
                                            ))}
                                            {colleges.length < 3 && <td />}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
