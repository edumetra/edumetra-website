export default function CollegeCardSkeleton() {
    return (
        <div className="flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-pulse mb-4 h-full md:h-[224px]">
            {/* Image Skeleton */}
            <div className="w-full md:w-64 h-48 md:h-auto shrink-0 bg-slate-800/80"></div>

            {/* Content Skeleton */}
            <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <div className="w-full">
                            <div className="flex gap-2 mb-3">
                                <div className="h-5 w-20 bg-slate-800/80 rounded"></div>
                                <div className="h-5 w-24 bg-slate-800/80 rounded"></div>
                            </div>
                            <div className="h-6 w-3/4 bg-slate-800/80 rounded mb-2"></div>
                        </div>
                        <div className="h-6 w-12 bg-slate-800/80 rounded-md"></div>
                    </div>

                    <div className="h-4 w-1/2 bg-slate-800/80 rounded mb-6"></div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 py-4 border-y border-slate-800/50">
                        <div>
                            <div className="h-3 w-16 bg-slate-800/80 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-slate-800/80 rounded"></div>
                        </div>
                        <div>
                            <div className="h-3 w-20 bg-slate-800/80 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-slate-800/80 rounded"></div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="h-3 w-24 bg-slate-800/80 rounded mb-2"></div>
                            <div className="h-4 w-20 bg-slate-800/80 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Actions Skeleton */}
                <div className="flex items-center gap-2 mt-auto">
                    <div className="h-10 flex-1 bg-slate-800/80 rounded-lg"></div>
                    <div className="h-10 w-24 bg-slate-800/80 rounded-lg"></div>
                    <div className="h-10 w-10 bg-slate-800/80 rounded-lg"></div>
                    <div className="h-10 w-10 bg-slate-800/80 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
}
