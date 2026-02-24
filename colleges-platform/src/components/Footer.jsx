export default function Footer() {
    return (
        <footer className="bg-slate-900/30 border-t border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-slate-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} College Explorer. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
