import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Edumetra Admin Portal",
    description: "Manage colleges, cutoffs, and rankings",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
                <div className="flex h-screen overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col">
                        <div className="p-6 border-b border-slate-800">
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-300">
                                Edumetra
                            </h1>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Admin Portal</p>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-4">
                            <Link href="/" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500">
                                Dashboard
                            </Link>
                            <Link href="/users" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500 text-slate-400">
                                Users
                            </Link>
                            {/* 
                            <Link href="/content" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500 text-slate-400">
                                Content
                            </Link>
                            */}
                            <Link href="/reviews" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500 text-slate-400">
                                Reviews
                            </Link>
                            <Link href="/articles" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500 text-slate-400">
                                Articles
                            </Link>
                            <Link href="/moderation" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500 text-slate-400">
                                Moderation
                            </Link>
                            <Link href="/analytics" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500 text-slate-400">
                                Analytics
                            </Link>
                            {/* 
                            <Link href="/settings" className="block px-6 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors border-l-2 border-transparent hover:border-red-500 text-slate-400">
                                Settings
                            </Link>
                            */}
                        </nav>
                        <div className="p-4 border-t border-slate-800">
                            <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700">
                                Public Website ↗
                            </a>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto bg-slate-950">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
