import { BookOpen, IndianRupee } from 'lucide-react';

export function CoursesTable({ courses = [] }) {
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
                    {courses.map((course, i) => (
                        <tr key={i} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-900/30'}`}>
                            <td className="px-5 py-4 text-white font-medium">{course.name}</td>
                            <td className="px-5 py-4 text-slate-400">{course.duration}</td>
                            <td className="px-5 py-4 text-green-400 font-semibold text-right flex items-center justify-end gap-1">
                                <IndianRupee className="w-3 h-3 opacity-60" />{course.fees}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
