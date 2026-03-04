"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Save, Plus, Trash2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

type CourseFees = {
    id?: string;
    course_id?: string;
    fee_type: string;
    amount: number;
    is_annual: boolean;
};

type CollegeCourse = {
    id?: string; // missing if new
    college_id: string;
    name: string;
    duration: string;
    eligibility_criteria?: string;
    fees_breakdown?: CourseFees[];
};

export default function CollegeCoursesManager() {
    const { id: collegeId } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [collegeName, setCollegeName] = useState("Loading...");
    const [courses, setCourses] = useState<CollegeCourse[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collegeId]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        const { data: collegeData, error: collegeErr } = await supabase
            .from("colleges")
            .select("name")
            .eq("id", collegeId as string)
            .single() as unknown as { data: { name: string } | null, error: any };

        if (collegeErr) {
            setError("Error loading college: " + collegeErr.message);
            setLoading(false);
            return;
        }
        setCollegeName(collegeData?.name || "Unknown College");

        // Fetch courses and their fees
        // Note: Using a standard query, but since course_fees_breakdown is referenced to course, we can join them or fetch sequentially.
        try {
            const { data: rawCourses, error: coursesErr } = await supabase
                .from("college_courses")
                .select("*")
                .eq("college_id", collegeId as string);

            const coursesData = rawCourses as unknown as CollegeCourse[] | null;

            if (coursesErr && coursesErr.code !== "PGRST116") { // Ignore if table doesn't exist yet for visual setup
                if (coursesErr.message.includes("does not exist")) {
                    setError("Database migration 13 not applied yet. Cannot load courses.");
                    setLoading(false);
                    return;
                }
                throw coursesErr;
            }

            if (coursesData && coursesData.length > 0) {
                const courseIds = coursesData.map(c => c.id).filter(Boolean) as string[];
                const { data: rawFees, error: feesErr } = await supabase
                    .from("course_fees_breakdown")
                    .select("*")
                    .in("course_id", courseIds);

                if (feesErr) throw feesErr;
                const feesData = rawFees as unknown as CourseFees[] | null;

                const mappedCourses = coursesData.map(c => ({
                    ...c,
                    fees_breakdown: feesData?.filter(f => f.course_id === c.id) || []
                }));
                setCourses(mappedCourses);
            } else {
                setCourses([]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load courses data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = () => {
        setCourses(prev => [
            ...prev,
            { college_id: collegeId as string, name: "", duration: "", fees_breakdown: [] }
        ]);
    };

    const handleUpdateCourse = (index: number, field: keyof CollegeCourse, value: any) => {
        const updated = [...courses];
        updated[index] = { ...updated[index], [field]: value };
        setCourses(updated);
    };

    const handleRemoveCourse = async (index: number) => {
        const course = courses[index];
        if (course.id) {
            if (!confirm("Are you sure? This will delete the course and all associated fee structures from the database.")) return;
            try {
                const { error } = await supabase.from("college_courses").delete().eq("id", course.id);
                if (error) throw error;
            } catch (err: any) {
                setError("Delete error: " + err.message);
                return;
            }
        }
        setCourses(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddFee = (courseIndex: number) => {
        const updated = [...courses];
        updated[courseIndex].fees_breakdown = [
            ...(updated[courseIndex].fees_breakdown || []),
            { fee_type: "", amount: 0, is_annual: true }
        ];
        setCourses(updated);
    };

    const handleUpdateFee = (courseIndex: number, feeIndex: number, field: keyof CourseFees, value: any) => {
        const updated = [...courses];
        if (updated[courseIndex].fees_breakdown) {
            updated[courseIndex].fees_breakdown[feeIndex] = {
                ...updated[courseIndex].fees_breakdown[feeIndex],
                [field]: value
            };
        }
        setCourses(updated);
    };

    const handleRemoveFee = async (courseIndex: number, feeIndex: number) => {
        const updated = [...courses];
        const fee = updated[courseIndex].fees_breakdown?.[feeIndex];

        if (fee?.id) {
            if (!confirm("Delete this fee breakdown?")) return;
            await supabase.from("course_fees_breakdown").delete().eq("id", fee.id);
        }

        updated[courseIndex].fees_breakdown = updated[courseIndex].fees_breakdown?.filter((_, i) => i !== feeIndex);
        setCourses(updated);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setError(null);
        try {
            for (const course of courses) {
                if (!course.name || !course.duration) {
                    throw new Error("All courses must have a name and duration.");
                }

                let savedCourseId = course.id;

                // Save or Update Course
                if (!savedCourseId) {
                    const { data, error } = await supabase
                        .from("college_courses")
                        .insert({
                            college_id: course.college_id,
                            name: course.name,
                            duration: course.duration,
                            eligibility_criteria: course.eligibility_criteria || null
                        } as never)
                        .select("id")
                        .single();
                    if (error) throw error;
                    savedCourseId = (data as any)?.id;
                } else {
                    const { error } = await supabase
                        .from("college_courses")
                        .update({
                            name: course.name,
                            duration: course.duration,
                            eligibility_criteria: course.eligibility_criteria || null
                        } as never)
                        .eq("id", savedCourseId);
                    if (error) throw error;
                }

                // Save or Update Fees breakdown
                if (course.fees_breakdown && course.fees_breakdown.length > 0) {
                    for (const fee of course.fees_breakdown) {
                        if (!fee.fee_type) throw new Error("Fee type is required for all breakdowns.");

                        if (!fee.id) {
                            const { error } = await supabase
                                .from("course_fees_breakdown")
                                .insert({
                                    course_id: savedCourseId,
                                    fee_type: fee.fee_type,
                                    amount: fee.amount,
                                    is_annual: fee.is_annual
                                } as never);
                            if (error) throw error;
                        } else {
                            const { error } = await supabase
                                .from("course_fees_breakdown")
                                .update({
                                    fee_type: fee.fee_type,
                                    amount: fee.amount,
                                    is_annual: fee.is_annual
                                } as never)
                                .eq("id", fee.id);
                            if (error) throw error;
                        }
                    }
                }
            }
            // Refresh to get new IDs
            await fetchData();
            alert("Courses and fees saved successfully!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-slate-400">Loading courses...</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/colleges/${collegeId}/edit`} className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Courses & Fees</h1>
                    <p className="text-slate-400 text-sm">Managing programs for <span className="text-white font-semibold">{collegeName}</span></p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>{error}</div>
                </div>
            )}

            <div className="space-y-6">
                {courses.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                        <p className="text-slate-400 mb-4">No courses configured for this college yet.</p>
                        <button
                            onClick={handleAddCourse}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                        >
                            Add First Course
                        </button>
                    </div>
                ) : (
                    courses.map((course, cIdx) => (
                        <div key={course.id || `new-${cIdx}`} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group">
                            <button
                                onClick={() => handleRemoveCourse(cIdx)}
                                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove Course"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pr-8">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Course Name</label>
                                    <input
                                        type="text"
                                        value={course.name}
                                        onChange={e => handleUpdateCourse(cIdx, "name", e.target.value)}
                                        placeholder="e.g., MBBS, B.Tech Computer Science"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Duration</label>
                                    <input
                                        type="text"
                                        value={course.duration}
                                        onChange={e => handleUpdateCourse(cIdx, "duration", e.target.value)}
                                        placeholder="e.g., 5.5 Years, 4 Years"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Eligibility Criteria</label>
                                    <textarea
                                        value={course.eligibility_criteria || ""}
                                        onChange={e => handleUpdateCourse(cIdx, "eligibility_criteria", e.target.value)}
                                        placeholder="e.g., 10+2 with PCB minimum 50%..."
                                        rows={2}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-slate-300">Fee Breakdown</h4>
                                    <button
                                        onClick={() => handleAddFee(cIdx)}
                                        className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add Fee Component
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {course.fees_breakdown?.length === 0 ? (
                                        <span className="text-xs text-slate-500 italic">No fee breakdown available.</span>
                                    ) : (
                                        course.fees_breakdown?.map((fee, fIdx) => (
                                            <div key={fee.id || `f-${fIdx}`} className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={fee.fee_type}
                                                    onChange={e => handleUpdateFee(cIdx, fIdx, "fee_type", e.target.value)}
                                                    placeholder="Fee Name (e.g. Tuition)"
                                                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none"
                                                />
                                                <div className="relative w-32 shrink-0">
                                                    <span className="absolute left-3 top-1.5 text-slate-500 text-sm">₹</span>
                                                    <input
                                                        type="number"
                                                        value={fee.amount}
                                                        onChange={e => handleUpdateFee(cIdx, fIdx, "amount", parseInt(e.target.value) || 0)}
                                                        className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1.5 text-sm text-white focus:outline-none"
                                                    />
                                                </div>
                                                <select
                                                    value={fee.is_annual ? "annual" : "onetime"}
                                                    onChange={e => handleUpdateFee(cIdx, fIdx, "is_annual", e.target.value === "annual")}
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-sm text-slate-300 focus:outline-none"
                                                >
                                                    <option value="annual">Per Year</option>
                                                    <option value="onetime">One-Time</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRemoveFee(cIdx, fIdx)}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {courses.length > 0 && (
                    <button
                        onClick={handleAddCourse}
                        className="w-full py-4 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl text-slate-400 hover:text-blue-400 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Add Another Course
                    </button>
                )}
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 flex justify-end gap-3 z-50">
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving Changes..." : "Save All Courses"}
                </button>
            </div>
        </div>
    );
}
