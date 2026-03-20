import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { GraduationCap, Lock, Mail, AlertCircle } from "lucide-react";

export default async function Login({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; error?: string; reason?: string; redirected?: string }>;
}) {
    // Next.js 15: searchParams is a Promise — must be awaited
    const params = await searchParams;

    // If already logged in and an admin, redirect to dashboard
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: admin } = await supabase.from("admins").select("id").eq("id", user.id).single();
        if (admin) redirect("/");
    }

    const signIn = async (formData: FormData) => {
        "use server";
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return redirect("/login?message=Invalid email or password. Please try again.");
        }

        // Verify the user is an admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: admin } = await supabase.from("admins").select("id").eq("id", user.id).single();
            if (!admin) {
                await supabase.auth.signOut();
                return redirect("/login?message=You do not have admin access to this portal.");
            }
        }

        return redirect("/");
    };



    // Build contextual banner message
    let bannerMessage: string | null = null;
    if (params.message) bannerMessage = params.message;
    else if (params.reason === "session_expired") bannerMessage = "Your session expired. Please sign in again.";
    else if (params.reason === "inactive") bannerMessage = "You were logged out due to inactivity.";
    else if (params.redirected) bannerMessage = "Please sign in to access the admin portal.";
    else if (params.error === "not_admin") bannerMessage = "Your account does not have admin access.";

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/3 w-[400px] h-[300px] bg-red-800/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-white shadow-2xl shadow-red-900/40 mb-4 overflow-hidden">
                        <img src="/logo.jpeg" alt="Edumetra Logo" className="h-12 w-auto object-contain" />
                    </div>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Admin Portal — Authorised Access Only</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-1">Sign in</h2>
                    <p className="text-slate-500 text-sm mb-6">Enter your admin credentials to continue.</p>

                    {/* Error / Info banner */}
                    {bannerMessage && (
                        <div className="flex items-start gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{bannerMessage}</span>
                        </div>
                    )}

                    <form action={signIn} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    required
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full py-3 mt-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-900/30"
                        >
                            Sign In
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-700 mt-6">
                    Restricted to authorised administrators only.
                </p>
            </div>
        </div>
    );
}
