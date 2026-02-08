import { motion, AnimatePresence } from "framer-motion";
import { X, Mic2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { createPortal } from "react-dom";

interface LyricsViewProps {
    isOpen: boolean;
    onClose: () => void;
    lyrics: string;
    songTitle: string;
    artistName: string;
    imageUrl: string | null;
}

export const LyricsView = ({
    isOpen,
    onClose,
    lyrics,
    songTitle,
    artistName,
    imageUrl
}: LyricsViewProps) => {
    const [bgColor, setBgColor] = useState("#121212");

    useEffect(() => {
        if (imageUrl) {
            const fac = new FastAverageColor();
            fac.getColorAsync(imageUrl, { crossOrigin: 'anonymous' })
                .then(color => {
                    setBgColor(color.hex);
                })
                .catch(e => {
                    console.error("Failed to get average color", e);
                    setBgColor("#1B1B1B");
                });
        }
    }, [imageUrl]);

    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
                    style={{
                        background: `linear-gradient(to bottom, ${bgColor} 0%, #000000 100%)`
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 md:p-10 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded shadow-2xl overflow-hidden bg-stone-800">
                                {imageUrl ? (
                                    <img src={imageUrl} alt={songTitle} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                    <Mic2 className="w-full h-full p-3 text-stone-600" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-white font-bold text-lg md:text-2xl line-clamp-1">{songTitle}</h2>
                                <p className="text-white/70 text-sm md:text-lg">{artistName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-md"
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                    </div>

                    {/* Lyrics Scrollable Area */}
                    <div className="flex-1 overflow-y-auto px-6 md:px-20 py-10 custom-scrollbar scroll-smooth">
                        <div className="w-min whitespace-pre text-pretty mx-auto pb-40">
                            {lyrics.split('\n').map((line, index) => (
                                <p
                                    key={index}
                                    className="text-white text-xl md:text-xl lg:text-2xl font-black mb-6 md:mb-10 leading-tight transition-all duration-300 opacity-80 hover:opacity-100 hover:scale-[1.02] origin-left cursor-default select-none group/line"
                                    style={{
                                        textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {line.split(' ').map((word, wordIndex) => (
                                        <span
                                            key={wordIndex}
                                            className="inline-block transition-transform duration-200 hover:-translate-y-[2px] hover:text-white"
                                        >
                                            {word}{wordIndex !== line.split(' ').length - 1 ? '\u00A0' : ''}
                                        </span>
                                    )) || '\u00A0'}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Fade Mask */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
