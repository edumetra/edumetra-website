import Link from "next/link";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <ShieldOff className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8">
                    You don't have permission to access this section. Contact your superadmin to request access.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl font-semibold transition-colors border border-slate-700"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
