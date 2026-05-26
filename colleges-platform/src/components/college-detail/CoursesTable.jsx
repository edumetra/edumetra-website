import React, { useState } from 'react';
import { BookOpen, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react';

export function CoursesTable({ courses = [] }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    if (!courses || courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">Course details not available yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                        <th className="text-left px-5 py-3 text-slate-400 font-semibold">Course</th>
                        <th className="text-left px-5 py-3 text-slate-400 font-semibold">Duration</th>
                        <th className="text-right px-5 py-3 text-slate-400 font-semibold">Total Fees</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, i) => {
                        const isExpanded = expandedIndex === i;
                        const hasBreakdown = course.fees_breakdown && course.fees_breakdown.length > 0;
                        return (
                            <React.Fragment key={i}>
                                <tr 
                                    onClick={() => hasBreakdown && setExpandedIndex(isExpanded ? null : i)}
                                    className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/30'} ${hasBreakdown ? 'cursor-pointer' : ''}`}
                                >
                                    <td className="px-5 py-4 text-white font-medium flex items-center gap-2">
                                        {hasBreakdown && (
                                            isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-red-500 shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                                            )
                                        )}
                                        {course.name}
                                    </td>
                                    <td className="px-5 py-4 text-slate-400">{course.duration}</td>
                                    <td className="px-5 py-4 text-green-400 font-semibold text-right flex items-center justify-end gap-1">
                                        <IndianRupee className="w-3 h-3 opacity-60" />{course.fees}
                                    </td>
                                </tr>
                                {isExpanded && hasBreakdown && (
                                    <tr className="bg-slate-950/80 border-b border-slate-800">
                                        <td colSpan={3} className="px-8 py-4">
                                            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detailed Fees Breakdown</h4>
                                                <div className="space-y-2">
                                                    {course.fees_breakdown.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800/50 last:border-0">
                                                            <span className="text-slate-300 font-medium">{item.fee_type}</span>
                                                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                                                                <IndianRupee className="w-2.5 h-2.5 opacity-60" />
                                                                {item.amount?.toLocaleString('en-IN')}
                                                                {item.is_annual && <span className="text-[10px] text-slate-500 font-normal ml-1">/ Year</span>}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
