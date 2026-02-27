import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import CollegeActions from "@/components/CollegeActions";
import CollegeImage from "@/components/CollegeImage";


export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: colleges } = await supabase
        .from("colleges")
        .select("*")
        .order("name");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collegesList = (colleges as any[]) || [];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Colleges Directory</h1>
                    <p className="text-slate-400 text-sm">Manage all colleges, control visibility, and publish changes.</p>
                </div>
                <Link
                    href="/colleges/new"
                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-500 transition-all font-medium shadow-lg shadow-red-900/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Add New College
                </Link>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Public", count: collegesList.filter(c => c.visibility === "public").length, color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
                    { label: "Draft", count: collegesList.filter(c => c.visibility === "draft" || !c.visibility).length, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
                    { label: "Hidden", count: collegesList.filter(c => c.visibility === "hidden").length, color: "text-slate-400", bg: "bg-slate-800 border-slate-700" },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.bg}`}>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                            {collegesList.map((college) => (
                                <tr key={college.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/colleges/${college.id}`} className="flex items-center gap-3 group">
                                            <CollegeImage
                                                src={college.image}
                                                alt={college.name}
                                            />
                                            <div>
                                                <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{college.name}</div>
                                                <div className="text-xs text-slate-500 sm:hidden mt-0.5">{college.location_city}, {college.location_state}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="text-sm text-slate-400">{college.location_city}, {college.location_state}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                            {college.type}
                                        </span>
                                    </td>
                                    {/* Visibility removed - now handled in Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <CollegeActions
                                            id={college.id}
                                            visibility={college.visibility ?? (college.is_published ? "public" : "draft")}
                                        />
                                    </td>
                                </tr>
                            ))}
                            {collegesList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <h3 className="text-slate-300 font-medium text-lg">No colleges yet</h3>
                                        <p className="text-slate-500 text-sm mt-1 mb-4">Add your first college to get started.</p>
                                        <Link href="/colleges/new" className="text-red-400 hover:text-red-300 text-sm font-medium hover:underline">
                                            Add your first college →
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
