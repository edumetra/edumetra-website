import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Admin Panel - College Discovery",
    description: "Manage colleges, cutoffs, and rankings",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-100`}>
                <div className="flex h-screen overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:block">
                        <div className="p-4">
                            <h1 className="text-xl font-bold">Admin Panel</h1>
                        </div>
                        <nav className="mt-4">
                            <Link href="/" className="block px-4 py-2 hover:bg-gray-800">
                                Dashboard
                            </Link>
                            <Link href="/users" className="block px-4 py-2 hover:bg-gray-800">
                                Users
                            </Link>
                            <Link href="/content" className="block px-4 py-2 hover:bg-gray-800">
                                Content
                            </Link>
                            <Link href="/reviews" className="block px-4 py-2 hover:bg-gray-800">
                                Reviews
                            </Link>
                            <Link href="/settings" className="block px-4 py-2 hover:bg-gray-800">
                                Settings
                            </Link>
                            <div className="border-t border-gray-700 my-4 pt-4">
                                <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-800 text-blue-400">
                                    Public Website ↗
                                </a>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
