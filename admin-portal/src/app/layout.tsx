import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/Sidebar";
import { SecurityProvider } from "@/components/SecurityProvider";
import type { AdminPermissions } from "@/shared/permissions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Edumetra Admin Portal",
    description: "Manage colleges, cutoffs, and rankings",
    verification: {
        google: "Xy-T0I9WvHWOcUjGkrvU7uuGg-i_UXSOYcTYDZCkA3I",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    // If no authenticated user, render a bare shell — login/denied pages get no sidebar
    if (!user) {
        return (
            <html lang="en" className="dark">
                <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
                    {children}
                </body>
            </html>
        );
    }

    let userRole = "mini_admin";
    let permissions: AdminPermissions = {};

    const { data: adminProfile } = await supabase
        .from("admins")
        .select("role, permissions")
        .eq("id", user.id)
        .single() as { data: { role: string; permissions: AdminPermissions } | null };

    if (adminProfile) {
        userRole = adminProfile.role;
        permissions = adminProfile.permissions ?? {};
    }

    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
                <SecurityProvider>
                    <div className="flex h-screen overflow-hidden">
                        <Sidebar
                            userRole={userRole}
                            userEmail={user?.email}
                            permissions={permissions}
                        />
                        <main className="flex-1 overflow-y-auto bg-slate-950">
                            {children}
                        </main>
                    </div>
                </SecurityProvider>
            </body>
        </html>
    );
}
