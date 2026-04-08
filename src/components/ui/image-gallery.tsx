import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';

const GALLERY_IMAGES = [
    { src: '/imagensferros/ferroscilindercloseup.jpeg', alt: 'Corte de Ferros', span: 'col-span-1 row-span-1' },
    { src: '/imagensferros/ferrosinventory.jpeg', alt: 'Inventário de Ferros', span: 'col-span-2 row-span-2' },
    { src: '/imagensferros/machinerycloseup.jpeg', alt: 'Maquinaria de Precisão', span: 'col-span-1 row-span-1' },
    { src: '/imagensferros/ferrospiledup.jpeg', alt: 'Stock de Barras', span: 'col-span-1 row-span-2' },
    { src: '/imagensferros/maquinadeferros.jpeg', alt: 'Máquina de Corte', span: 'col-span-1 row-span-1' },
    { src: '/imagensferros/ferrosroda.jpeg', alt: 'Bobines de Ferro', span: 'col-span-2 row-span-1' },
    { src: '/imagensferros/workplace.jpeg', alt: 'Zona de Trabalho', span: 'col-span-1 row-span-1' },
    { src: '/imagensferros/companyfromoutsideview.jpeg', alt: 'Exterior das Instalações', span: 'col-span-1 row-span-1' },
    { src: '/imagensferros/workplace2.jpeg', alt: 'Armazém e Operações', span: 'col-span-1 row-span-1' },
    { src: '/imagensferros/workplaceniceshot.jpeg', alt: 'Vista Geral do Armazém', span: 'col-span-1 row-span-1' },
    { src: '/imagensferros/transportemelhorfoto.jpeg', alt: 'Transporte e Logística', span: 'col-span-1 row-span-1' },
];

export function ImageGallery() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                {GALLERY_IMAGES.map((img, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`relative group overflow-hidden rounded-2xl cursor-pointer bg-slate-100 ${img.span}`}
                        onClick={() => setSelectedImage(img.src)}
                    >
                        <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-jrs-black/0 group-hover:bg-jrs-black/40 transition-colors duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                <Maximize2 className="h-6 w-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-jrs-black/95 backdrop-blur-sm p-4 md:p-8"
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            src={selectedImage}
                            alt="Fullscreen view"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
