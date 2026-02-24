import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const FilterSection = ({ title, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b border-slate-800 py-4 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left mb-2 group"
            >
                <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {title}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="space-y-2 mt-2">
                    {options.map((option) => (
                        <label
                            key={option}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={() => onChange(option)}
                                    className="peer h-4 w-4 bg-slate-800 border-2 border-slate-600 rounded appearance-none checked:bg-red-600 checked:border-red-600 transition-all focus:ring-0 focus:ring-offset-0"
                                />
                                <svg
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className={`text-sm transition-colors ${selected.includes(option) ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FilterSidebar({ filters, onFilterChange, isOpen, onClose }) {
    const filterOptions = {
        locations: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'],
        states: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi NCR', 'Telangana'],
        types: ['Public/Government', 'Private', 'Deemed'],
        courses: ['B.Tech', 'MBBS', 'BBA', 'MBA', 'B.Sc', 'B.Com']
    };

    const handleOptionChange = (category, option) => {
        const currentSelected = filters[category] || [];
        const newSelected = currentSelected.includes(option)
            ? currentSelected.filter(item => item !== option)
            : [...currentSelected, option];

        onFilterChange(category, newSelected);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Content */}
            <aside className={`
                fixed lg:sticky top-0 lg:top-24 left-0 h-screen lg:h-[calc(100vh-8rem)]
                w-80 bg-slate-900 lg:bg-transparent border-r lg:border border-slate-800
                transform transition-transform duration-300 ease-in-out z-50 lg:z-0
                overflow-y-auto lg:rounded-xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between lg:hidden mb-6">
                        <h2 className="text-xl font-bold text-white">Filters</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="hidden lg:flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                            Filters
                        </h2>
                        {(filters.locations?.length > 0 || filters.types?.length > 0) && (
                            <button
                                onClick={() => onFilterChange('reset')}
                                className="text-xs text-red-400 hover:text-red-300 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <FilterSection
                            title="State"
                            options={filterOptions.states}
                            selected={filters.states || []}
                            onChange={(opt) => handleOptionChange('states', opt)}
                        />
                        <FilterSection
                            title="City"
                            options={filterOptions.locations}
                            selected={filters.locations || []}
                            onChange={(opt) => handleOptionChange('locations', opt)}
                        />
                        <FilterSection
                            title="Ownership"
                            options={filterOptions.types}
                            selected={filters.types || []}
                            onChange={(opt) => handleOptionChange('types', opt)}
                        />
                        <FilterSection
                            title="Course"
                            options={filterOptions.courses}
                            selected={filters.courses || []}
                            onChange={(opt) => handleOptionChange('courses', opt)}
                        />
                    </div>
                </div>
            </aside>
        </>
    );
}
