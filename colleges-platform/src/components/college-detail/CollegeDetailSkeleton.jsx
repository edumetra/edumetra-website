export default function CollegeDetailSkeleton() {
    return (
        <div className="min-h-screen bg-slate-950 w-full text-slate-200">
            {/* Hero Skeleton */}
            <div className="h-[70vh] min-h-[500px] w-full bg-slate-900 animate-pulse relative">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/20" />
                <div className="absolute bottom-32 left-4 sm:left-8 md:left-20 lg:left-32 w-[80%] md:w-[60%] space-y-6 z-10">
                    <div className="flex gap-3">
                        <div className="h-6 w-20 bg-slate-800 rounded-lg" />
                        <div className="h-6 w-24 bg-slate-800 rounded-lg" />
                    </div>
                    <div className="h-14 md:h-20 w-[90%] md:w-full bg-slate-800 rounded-2xl" />
                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="h-5 w-32 bg-slate-800 rounded-md" />
                        <div className="h-5 w-24 bg-slate-800 rounded-md" />
                        <div className="h-5 w-28 bg-slate-800 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Quick Stats Overlap Skeleton */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 mb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-[104px] bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl animate-pulse flex flex-col justify-center p-5 space-y-2">
                             <div className="h-4 w-1/2 bg-slate-800 rounded-md" />
                             <div className="h-6 w-3/4 bg-slate-700 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Body Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
                    <div className="lg:col-span-3 space-y-20">
                        {/* Section Skeletons */}
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-slate-800 rounded-full animate-pulse" />
                                    <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-slate-800/60 rounded-sm animate-pulse" />
                                    <div className="h-4 w-[95%] bg-slate-800/60 rounded-sm animate-pulse" />
                                    <div className="h-4 w-[85%] bg-slate-800/60 rounded-sm animate-pulse" />
                                </div>
                                <div className="h-64 w-full bg-slate-900 border border-slate-800 rounded-2xl animate-pulse mt-6" />
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="h-[400px] bg-slate-900 border border-slate-800 rounded-2xl animate-pulse sticky top-24 p-6 flex flex-col gap-4">
                            <div className="h-4 w-32 bg-slate-800 rounded-md mb-2" />
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-10 w-full bg-slate-800/50 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
