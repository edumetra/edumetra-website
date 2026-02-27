import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft, MapPin, Building2, Calendar, DollarSign,
    TrendingUp, Award, BookOpen, Star, ExternalLink,
    CheckCircle, ShieldCheck
} from "lucide-react";
import CollegeActions from "@/components/CollegeActions";
import CollegeImage from "@/components/CollegeImage";
import AdminQASection from "@/components/AdminQASection";

export default async function CollegeViewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: college } = await (supabase
        .from("colleges") as any)
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

    if (!college) {
        notFound();
    }

    const { data: details } = await (supabase
        .from("college_details") as any)
        .select("*")
        .eq("college_id", resolvedParams.id)
        .single();

    // Parse stats safely
    let stats = null;
    if (details?.placement_stats) {
        try {
            stats = typeof details.placement_stats === 'string'
                ? JSON.parse(details.placement_stats)
                : details.placement_stats;
        } catch (e) {
            // ignore
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Navigation & Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Directory
                </Link>
                <div className="flex items-center gap-3">
                    <CollegeActions
                        id={college.id}
                        visibility={college.visibility ?? (college.is_published ? "public" : "draft")}
                    />
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Logo/Image */}
                        <div className="-mt-16 w-32 h-32 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-950 shadow-2xl shrink-0">
                            {college.image ? (
                                <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-800/50">
                                    <Building2 className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        {/* Title & Badges */}
                        <div className="flex-1 pt-2">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {college.type && (
                                    <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-lg shadow-lg shadow-blue-900/30">
                                        {college.type}
                                    </span>
                                )}
                                {college.rank && (
                                    <span className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-amber-400" /> Rank #{college.rank}
                                    </span>
                                )}
                                {college.rating > 0 && (
                                    <span className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {college.rating}/5
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-3">
                                {college.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-400" />
                                    {college.location_city}{college.location_state ? `, ${college.location_state}` : ''}
                                </div>
                                {college.website_url && (
                                    <a href={college.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                                        <ExternalLink className="w-4 h-4 text-blue-400" /> Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> Fees
                            </div>
                            <div className="text-lg font-bold text-white">{college.fees || "N/A"}</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" /> Avg Package
                            </div>
                            <div className="text-lg font-bold text-emerald-400">{college.avg_package || "N/A"}</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> Exams
                            </div>
                            <div className="text-lg font-bold text-white truncate" title={college.exams || "N/A"}>{college.exams || "N/A"}</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Established
                            </div>
                            <div className="text-lg font-bold text-white">{(college as any).established_year || "Unknown"}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">About College</h2>
                        {college.description ? (
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{college.description}</p>
                        ) : (
                            <div className="text-slate-500 italic p-4 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                No description provided for this college.
                            </div>
                        )}
                    </div>

                    {/* Courses */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Courses Offered</h2>
                        {college.courses && college.courses.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {college.courses.map((course: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg">
                                        {course}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-500 italic">No courses listed.</div>
                        )}
                    </div>
                </div>

                {/* Right Column (Sidebar Stats) */}
                <div className="space-y-6">
                    {/* Placement Highlight */}
                    {(stats || college.highest_package || college.placement_rate) && (
                        <div className="bg-gradient-to-b from-emerald-600/10 to-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" /> Placement Stats
                            </h2>
                            <div className="space-y-6">
                                {(stats?.highest_package || (college as any).highest_package) && (
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Highest Package</div>
                                        <div className="text-3xl font-black text-white">{stats?.highest_package || (college as any).highest_package}</div>
                                    </div>
                                )}
                                {(stats?.placement_rate || (college as any).placement_rate) && (
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Placement Rate</div>
                                        <div className="text-2xl font-bold text-emerald-400">{stats?.placement_rate || (college as any).placement_rate}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Internal IDs/Tech Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">System Info</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-500">ID</span>
                                <code className="text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs break-all">{college.id}</code>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-500">Slug</span>
                                <code className="text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs break-all">{college.slug}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Q&A Management Section */}
            <AdminQASection collegeId={college.id} />
        </div>
    );
}
