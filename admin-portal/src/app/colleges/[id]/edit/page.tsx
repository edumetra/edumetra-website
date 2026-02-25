"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui";
import { ArrowLeft, Building2, MapPin, GraduationCap, DollarSign, BookOpen, Globe, FileText, Image as ImageIcon } from "lucide-react";

export default function EditCollegePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        location_city: "",
        location_state: "",
        type: "Private",
        visibility: "draft",
        rank: "",
        rating: "",
        fees: "",
        avg_package: "",
        exams: "",
        courses: "",
        image: "",
        description: "",
        established_year: "",
        website_url: "",
        highest_package: "",
        placement_rate: "",
    });

    useEffect(() => {
        const fetchCollege = async () => {
            const { data, error } = await supabase
                .schema("public")
                .from("colleges")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setError("Failed to fetch college");
                setLoading(false);
                return;
            }

            const { data: detailsData } = await supabase
                .schema("public")
                .from("college_details")
                .select("*")
                .eq("college_id", id)
                .single();

            let placementStats: any = {};
            if (detailsData?.placement_stats) {
                try {
                    placementStats = JSON.parse(detailsData.placement_stats);
                } catch { }
            }

            if (data) {
                setFormData({
                    name: data.name,
                    location_city: data.location_city,
                    location_state: data.location_state,
                    type: data.type,
                    visibility: data.visibility ?? (data.is_published ? "public" : "draft"),
                    rank: data.rank.toString(),
                    rating: data.rating?.toString() || "",
                    fees: data.fees,
                    avg_package: data.avg_package,
                    exams: data.exams,
                    courses: Array.isArray(data.courses) ? data.courses.join(", ") : data.courses,
                    image: data.image || "",
                    description: data.description || "",
                    established_year: data.established_year?.toString() || "",
                    website_url: data.website_url || "",
                    highest_package: placementStats.highest_package || "",
                    placement_rate: placementStats.placement_rate || ""
                });
            }
            setLoading(false);
        };

        fetchCollege();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const coursesArray = formData.courses.split(",").map(c => c.trim()).filter(Boolean);
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

            const { error: updateError } = await supabase
                .schema("public")
                .from("colleges")
                .update({
                    name: formData.name,
                    slug: slug,
                    location_city: formData.location_city,
                    location_state: formData.location_state,
                    type: formData.type,
                    visibility: formData.visibility,
                    rank: parseInt(formData.rank) || 0,
                    rating: parseFloat(formData.rating) || 0,
                    fees: formData.fees,
                    avg_package: formData.avg_package,
                    exams: formData.exams,
                    courses: coursesArray,
                    image: formData.image,
                    description: formData.description,
                    established_year: parseInt(formData.established_year) || null,
                    website_url: formData.website_url,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            const placementStats = {
                highest_package: formData.highest_package,
                placement_rate: formData.placement_rate,
                average_package: formData.avg_package
            };

            const { error: detailsError } = await supabase
                .schema("public")
                .from("college_details")
                .upsert({
                    college_id: id,
                    placement_stats: JSON.stringify(placementStats),
                }, { onConflict: 'college_id' });

            if (detailsError) {
                console.error("Failed to update details:", detailsError);
            }

            router.push("/");
            router.refresh();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
    );

    const inputClasses = "w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 hover:border-slate-700 font-medium text-slate-200 placeholder:text-slate-500";
    const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1";
    const sectionClasses = "bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm";

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit College</h1>
                        <p className="text-slate-400 mt-2">Update institution details and placement statistics.</p>
                    </div>
                    <Link href="/" className="group flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors bg-slate-800 border border-slate-700 px-5 py-2.5 rounded-full shadow-sm">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Cancel
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Visibility selector at top */}
                <div className="mb-6 p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Visibility Status</label>
                    <div className="flex gap-3 flex-wrap">
                        {(["public", "draft", "hidden"] as const).map(v => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => setFormData({ ...formData, visibility: v })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${formData.visibility === v
                                        ? v === "public" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                            : v === "hidden" ? "bg-slate-700 border-slate-600 text-slate-300"
                                                : "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                        : "bg-slate-800/50 border-slate-700 text-slate-500 hover:text-slate-300"
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${v === "public" ? "bg-emerald-400" : v === "hidden" ? "bg-slate-500" : "bg-amber-400"
                                    }`} />
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {formData.visibility === "public" ? "✓ Visible to all users on the Colleges Platform" :
                            formData.visibility === "draft" ? "Saved privately. Not visible to public users." :
                                "Hidden from the platform but kept in the system."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <section className={sectionClasses}>
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>College Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Indian Institute of Technology, Bombay"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Type</label>
                                <div className="relative">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className={`${inputClasses} appearance-none cursor-pointer`}
                                    >
                                        <option value="Private">Private Institution</option>
                                        <option value="Public/Government">Public / Government</option>
                                        <option value="Deemed">Deemed University</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Established Year</label>
                                <input
                                    type="number"
                                    name="established_year"
                                    placeholder="e.g. 1958"
                                    value={formData.established_year}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Website URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="url"
                                        name="website_url"
                                        placeholder="https://www.iitb.ac.in"
                                        value={formData.website_url}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-12`}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Location & Ranking */}
                    <section className={sectionClasses}>
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Location & Ranking</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClasses}>City</label>
                                <input
                                    type="text"
                                    name="location_city"
                                    required
                                    placeholder="e.g. Mumbai"
                                    value={formData.location_city}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>State</label>
                                <input
                                    type="text"
                                    name="location_state"
                                    required
                                    placeholder="e.g. Maharashtra"
                                    value={formData.location_state}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Rank (Number)</label>
                                <input
                                    type="number"
                                    name="rank"
                                    placeholder="Featured Rank"
                                    value={formData.rank}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Rating (0-5)</label>
                                <input
                                    type="number"
                                    name="rating"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="4.5"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Academics & Placement */}
                    <section className={sectionClasses}>
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Academics & Placement</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClasses}>Annual Fees</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="fees"
                                        placeholder="e.g. ₹2.5 Lakhs/yr"
                                        value={formData.fees}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-10`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Exams Accepted</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        name="exams"
                                        placeholder="JEE Main, GATE, CAT"
                                        value={formData.exams}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-10`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Average Package</label>
                                <input
                                    type="text"
                                    name="avg_package"
                                    placeholder="e.g. ₹15 LPA"
                                    value={formData.avg_package}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Highest Package</label>
                                <input
                                    type="text"
                                    name="highest_package"
                                    placeholder="e.g. ₹55 LPA"
                                    value={formData.highest_package}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Placement Rate</label>
                                <input
                                    type="text"
                                    name="placement_rate"
                                    placeholder="e.g. 92%"
                                    value={formData.placement_rate}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Details */}
                    <section className={sectionClasses}>
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Description & Media</h2>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className={labelClasses}>About College</label>
                                <textarea
                                    name="description"
                                    rows={5}
                                    placeholder="Write a compelling description..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Courses Offered (Comma separated)</label>
                                <textarea
                                    name="courses"
                                    rows={3}
                                    placeholder="B.Tech Computer Science, MBA Finance, B.Arch..."
                                    value={formData.courses}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Main Image URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="url"
                                        name="image"
                                        placeholder="https://example.com/campus.jpg"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className={`${inputClasses} pl-12`}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="sticky bottom-0 bg-slate-900/80 backdrop-blur-xl p-4 border-t border-slate-800 -mx-4 sm:-mx-0 flex justify-end gap-3 z-10 rounded-t-xl sm:rounded-none">
                        <Link href="/" className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            Cancel
                        </Link>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] border-0"
                        >
                            {saving ? "Saving..." : "Update College"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
