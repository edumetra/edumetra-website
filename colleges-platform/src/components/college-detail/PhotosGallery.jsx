import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export function PhotosGallery({ photos = [] }) {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    if (!photos || photos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <ImageOff className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No campus photos uploaded yet.</p>
            </div>
        );
    }

    const prev = () => setLightboxIndex(i => (i - 1 + photos.length) % photos.length);
    const next = () => setLightboxIndex(i => (i + 1) % photos.length);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((url, i) => (
                    <button
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className={`relative rounded-xl overflow-hidden group focus:outline-none 
                            ${i === 0 ? 'col-span-2 row-span-2 aspect-auto' : 'aspect-[4/3]'}
                        `}
                    >
                        <img src={url} alt={`Campus photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">View</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
                    <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <img
                        src={photos[lightboxIndex]}
                        alt="Campus"
                        className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                    <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 text-slate-400 text-sm">{lightboxIndex + 1} / {photos.length}</div>
                </div>
            )}
        </>
    );
}
