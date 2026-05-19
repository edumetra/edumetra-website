import { AlertCircle } from 'lucide-react';

export function FetchErrorBanner({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div className="flex-1">
                <p className="font-semibold text-red-200">Could not load data</p>
                <p className="mt-1 text-red-300/90">{message}</p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/10"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}
