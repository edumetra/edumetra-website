import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                    Find Your Perfect{' '}
                    <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 bg-clip-text text-transparent">
                        College
                    </span>
                </h1>

                <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
                    Explore thousands of colleges, compare programs, and make informed decisions about your future.
                </p>

                <Link
                    to="/colleges"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                >
                    <Search className="w-5 h-5" />
                    Explore Colleges
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
