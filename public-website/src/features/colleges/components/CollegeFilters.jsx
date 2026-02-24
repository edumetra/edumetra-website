import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSection = ({ title, options, selected, onChange, isOpen, onToggle }) => {
    return (
        <div className="border-b border-slate-700/50 py-4 last:border-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full text-left mb-2 group"
            >
                <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {title}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pt-2">
                            {options.map((option, idx) => (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`
                                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                                        ${selected.includes(option)
                                            ? 'bg-red-600 border-red-600'
                                            : 'border-slate-600 group-hover:border-slate-500'
                                        }
                                    `}>
                                        {selected.includes(option) && <Check className="w-3 h-3 text-white" />}
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selected.includes(option)}
                                            onChange={() => onChange(option)}
                                        />
                                    </div>
                                    <span className={`text-sm ${selected.includes(option) ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CollegeFilters = ({ filters, selectedFilters, onFilterChange, onClearFilters }) => {
    const [openSections, setOpenSections] = useState({
        countries: true,
        types: true,
        feesRange: false,
        courses: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Filter className="w-5 h-5 text-red-500" />
                    Filters
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear All
                    </button>
                )}
            </div>

            <FilterSection
                title="Country"
                options={filters.countries}
                selected={selectedFilters.countries || []}
                onChange={(val) => onFilterChange('countries', val)}
                isOpen={openSections.countries}
                onToggle={() => toggleSection('countries')}
            />

            <FilterSection
                title="College Type"
                options={filters.types}
                selected={selectedFilters.types || []}
                onChange={(val) => onFilterChange('types', val)}
                isOpen={openSections.types}
                onToggle={() => toggleSection('types')}
            />

            <FilterSection
                title="Fees Range"
                options={filters.feesRange}
                selected={selectedFilters.feesRange || []}
                onChange={(val) => onFilterChange('feesRange', val)}
                isOpen={openSections.feesRange}
                onToggle={() => toggleSection('feesRange')}
            />

            <FilterSection
                title="Course"
                options={filters.courses}
                selected={selectedFilters.courses || []}
                onChange={(val) => onFilterChange('courses', val)}
                isOpen={openSections.courses}
                onToggle={() => toggleSection('courses')}
            />
        </div>
    );
};

export default CollegeFilters;
