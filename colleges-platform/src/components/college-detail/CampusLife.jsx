
/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

export const CampusLife = () => {
    // Placeholder images - in real app would come from props/DB
    const images = [
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800"
    ];

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-400" />
                Campus Life
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-64 md:h-80">
                {images.map((src, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className={`relative rounded-2xl overflow-hidden group cursor-pointer ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}
                    >
                        <img
                            src={src}
                            alt="Campus Life"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
