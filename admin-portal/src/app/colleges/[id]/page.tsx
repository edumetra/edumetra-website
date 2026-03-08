import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft, MapPin, Building2, Calendar, DollarSign,
    TrendingUp, Award, BookOpen, Star, ExternalLink,
    ShieldCheck, Edit, Eye, EyeOff, Images, GraduationCap,
    Globe, BarChart2, Users
} from "lucide-react";
import CollegeActions from "@/components/CollegeActions";
import AdminQASection from "@/components/AdminQASection";
import PremiumLockingManager from "@/components/PremiumLockingManager";
import { hasPermission } from "@/shared/permissions";

export default async function CollegeViewPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get current admin to check permissions
    const { data: { user } } = await supabase.auth.getUser();
    let adminProfile = null;
    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase.from("admins") as any).select("role, permissions").eq("id", user.id).single();
        adminProfile = data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: college } = await (supabase.from("colleges") as any)
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

    if (!college) notFound();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: details } = await (supabase.from("college_details") as any)
        .select("*")
        .eq("college_id", resolvedParams.id)
        .single();

    // Fetch linked rankings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rankings } = await (supabase.from("rankings") as any)
        .select("provider, year, rank, category")
        .eq("college_id", resolvedParams.id)
        .order("year", { ascending: false })
        .limit(10);

    // Fetch linked cutoffs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cutoffs } = await (supabase.from("cutoffs") as any)
        .select("exam_name, year, category, closing_score, closing_rank")
        .eq("college_id", resolvedParams.id)
        .order("year", { ascending: false })
        .limit(20);

    let stats: Record<string, string> | null = null;
    if (details?.placement_stats) {
        try {
            stats = typeof details.placement_stats === "string"
                ? JSON.parse(details.placement_stats)
                : details.placement_stats;
        } catch { /* ignore */ }
    }

    const galleryImages: string[] = Array.isArray(college.gallery_images) ? college.gallery_images : [];
    const allImages = [
        ...(college.image ? [college.image] : []),
        ...galleryImages,
    ];

    const visibility = college.visibility ?? (college.is_published ? "public" : "draft");

    const VisibilityBadge = () => {
        const map = {
            public: { label: "Public", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
            draft: { label: "Draft", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
            hidden: { label: "Hidden", color: "bg-slate-700 text-slate-400 border-slate-600" },
        };
        const v = map[visibility as keyof typeof map] ?? map.draft;
        return (
            <span className={`px-2.5 py-1 text-xs font-bold border rounded-lg flex items-center gap-1.5 ${v.color}`}>
                {visibility === "public" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {v.label}
            </span>
        );
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

            {/* Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Link href="/colleges" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Colleges
                </Link>
                <div className="flex items-center gap-3 flex-wrap">
                    <VisibilityBadge />
                    <Link href={`/colleges/${college.id}/edit`}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-red-900/20">
                        <Edit className="w-4 h-4" /> Edit College
                    </Link>
                    <CollegeActions
                        id={college.id}
                        visibility={visibility}
                    />
                </div>
            </div>

            {/* ── Hero / Profile Banner ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Cover image - full bleed */}
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
                    {college.image && (
                        <img src={college.image} alt={college.name} className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    {/* Image count badge */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs text-slate-300 font-semibold border border-slate-700">
                            <Images className="w-3.5 h-3.5" /> {allImages.length} images
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Logo / avatar */}
                        <div className="-mt-16 w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-2xl shrink-0">
                            {college.image ? (
                                <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <Building2 className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        {/* Name & badges */}
                        <div className="flex-1 pt-2">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                {college.type && (
                                    <span className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg">{college.type}</span>
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
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{college.name}</h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-emerald-400" />
                                    {college.location_city}{college.location_state ? `, ${college.location_state}` : ""}
                                </div>
                                {college.established_year && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-blue-400" /> Est. {college.established_year}
                                    </div>
                                )}
                                {college.website_url && (
                                    <a href={college.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        <Globe className="w-4 h-4 text-blue-400" /> Visit Website
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Image Gallery (if multiple) ── */}
            {allImages.length > 1 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Images className="w-4 h-4" /> Campus Gallery
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {allImages.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer"
                                className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 hover:opacity-90 transition-opacity group border border-slate-700">
                                <img src={url} alt={`Campus ${i + 1}`} className="w-full h-full object-cover" />
                                {i === 0 && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5" /> Cover
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ExternalLink className="w-5 h-5 text-white" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: DollarSign, label: "Annual Fees", value: college.fees, color: "text-red-400" },
                    { icon: TrendingUp, label: "Avg Package", value: college.avg_package, color: "text-emerald-400" },
                    { icon: BookOpen, label: "Exams", value: college.exams, color: "text-blue-400" },
                    { icon: ShieldCheck, label: "Established", value: college.established_year, color: "text-purple-400" },
                ].map((s) => (
                    <div key={s.label} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                            <s.icon className="w-3.5 h-3.5" /> {s.label}
                        </div>
                        <div className={`text-base font-bold ${s.color} truncate`} title={s.value || "N/A"}>
                            {s.value || <span className="text-slate-600 font-normal text-sm">Not set</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main 2-col layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left col */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Premium Locks Manager - Only visible to superadmins or mini-admins with premium_locks perm */}
                    {adminProfile && hasPermission(adminProfile.role, adminProfile.permissions || {}, "premium_locks") && (
                        <div className="mb-8">
                            <PremiumLockingManager
                                collegeId={college.id}
                                visibilityConfig={{
                                    visible_in_free: details?.visible_in_free || [],
                                    visible_in_signed_up: details?.visible_in_signed_up || [],
                                    visible_in_pro: details?.visible_in_pro || [],
                                    visible_in_premium: details?.visible_in_premium || [
                                        "placements", "cutoffs", "rankings", "reviews",
                                        "gallery", "courses", "contact"
                                    ]
                                }}
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-red-400" /> About this College
                        </h2>
                        {college.description ? (
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{college.description}</p>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <p className="text-slate-500 text-sm italic">No description added yet.</p>
                                <Link href={`/colleges/${college.id}/edit`} className="text-xs text-red-400 hover:text-red-300 font-semibold">+ Add description</Link>
                            </div>
                        )}
                    </div>

                    {/* Courses */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-red-400" /> Courses Offered
                        </h2>
                        {college.courses && college.courses.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {college.courses.map((course: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl">{course}</span>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <p className="text-slate-500 text-sm italic">No courses listed.</p>
                                <Link href={`/colleges/${college.id}/edit`} className="text-xs text-red-400 hover:text-red-300 font-semibold">+ Add courses</Link>
                            </div>
                        )}
                    </div>

                    {/* Cutoffs Table */}
                    {cutoffs && cutoffs.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-red-400" /> Cutoffs
                                </h2>
                                <Link href="/cutoffs" className="text-xs text-red-400 hover:text-red-300 font-semibold">Manage →</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800">
                                            <th className="pb-2 text-left text-xs font-bold text-slate-500 uppercase">Exam</th>
                                            <th className="pb-2 text-left text-xs font-bold text-slate-500 uppercase">Year</th>
                                            <th className="pb-2 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                                            <th className="pb-2 text-left text-xs font-bold text-slate-500 uppercase">Score</th>
                                            <th className="pb-2 text-left text-xs font-bold text-slate-500 uppercase">Rank</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {cutoffs.map((c: { exam_name: string; year: number; category: string; closing_score: number | null; closing_rank: number | null }, i: number) => (
                                            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="py-2.5"><span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold">{c.exam_name}</span></td>
                                                <td className="py-2.5 text-slate-400">{c.year}</td>
                                                <td className="py-2.5 text-slate-300">{c.category}</td>
                                                <td className="py-2.5 font-bold text-white">{c.closing_score ?? <span className="text-slate-600 font-normal">—</span>}</td>
                                                <td className="py-2.5 font-bold text-white">{c.closing_rank ? `#${c.closing_rank}` : <span className="text-slate-600 font-normal">—</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right col */}
                <div className="space-y-6">

                    {/* Placement */}
                    {(stats?.highest_package || stats?.placement_rate || college.highest_package || college.placement_rate) && (
                        <div className="bg-gradient-to-b from-emerald-600/10 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6">
                            <h2 className="text-base font-bold text-emerald-400 mb-5 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Placement Stats
                            </h2>
                            <div className="space-y-4">
                                {(stats?.highest_package || college.highest_package) && (
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Highest Package</div>
                                        <div className="text-2xl font-black text-white">{stats?.highest_package || college.highest_package}</div>
                                    </div>
                                )}
                                {(stats?.average_package || college.avg_package) && (
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Average Package</div>
                                        <div className="text-xl font-bold text-emerald-400">{stats?.average_package || college.avg_package}</div>
                                    </div>
                                )}
                                {(stats?.placement_rate || college.placement_rate) && (
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Placement Rate</div>
                                        <div className="text-xl font-bold text-emerald-400">{stats?.placement_rate || college.placement_rate}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rankings */}
                    {rankings && rankings.length > 0 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-400" /> Rankings
                                </h2>
                                <Link href="/rankings" className="text-xs text-red-400 hover:text-red-300 font-semibold">Manage →</Link>
                            </div>
                            <div className="space-y-2">
                                {rankings.map((r: { provider: string; year: number; rank: number; category?: string }, i: number) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                                        <div>
                                            <span className="text-xs font-bold text-amber-400">{r.provider}</span>
                                            <span className="text-xs text-slate-500 ml-1.5">{r.year}</span>
                                            {r.category && <div className="text-xs text-slate-600">{r.category}</div>}
                                        </div>
                                        <span className="text-lg font-black text-white">#{r.rank}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick actions */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link href={`/colleges/${college.id}/edit`}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl font-semibold text-sm transition-colors">
                                <Edit className="w-4 h-4" /> Edit College Info
                            </Link>
                            <Link href={`/colleges/${college.id}/courses`}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-sm transition-colors">
                                <GraduationCap className="w-4 h-4" /> Manage Courses
                            </Link>
                            <Link href={`/cutoffs?college=${college.id}`}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-sm transition-colors">
                                <BarChart2 className="w-4 h-4" /> Add Cutoffs
                            </Link>
                            <Link href={`/rankings?college=${college.id}`}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-sm transition-colors">
                                <Award className="w-4 h-4" /> Add Rankings
                            </Link>
                            <Link href={`/reviews?college=${encodeURIComponent(college.name)}`}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-sm transition-colors">
                                <Users className="w-4 h-4" /> View Reviews
                            </Link>
                        </div>
                    </div>

                    {/* System info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">System Info</h2>
                        <div className="space-y-2.5 text-xs">
                            <div>
                                <div className="text-slate-600 mb-0.5">College ID</div>
                                <code className="text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 break-all block">{college.id}</code>
                            </div>
                            <div>
                                <div className="text-slate-600 mb-0.5">Slug</div>
                                <code className="text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 break-all block">{college.slug}</code>
                            </div>
                            {college.created_at && (
                                <div>
                                    <div className="text-slate-600 mb-0.5">Created</div>
                                    <span className="text-slate-400">{new Date(college.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Q&A Section */}
            <AdminQASection collegeId={college.id} />
        </div>
    );
}
