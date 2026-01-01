import { usePlayerStore } from "@/store/player.store";
import { useImageColor } from "@/hooks/useImageColor";
import { Music, X } from "lucide-react";

export const NowPlayingView = ({ onClose }: { onClose: () => void }) => {
    const { currentSong, contextName } = usePlayerStore();
    const color = useImageColor(currentSong?.imageUrl);

    if (!currentSong) return null;

    const originText = contextName || "NOW PLAYING";

    return (
        <div className="w-[350px] h-full flex flex-col bg-[#121212] rounded-lg overflow-hidden relative border border-white/5">
            {/* Gradient Background */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    background: `linear-gradient(to bottom, ${color}, transparent 70%)`
                }}
            />

            {/* Header */}
            <div className="p-4 flex items-center justify-between z-10">
                <p className="text-[13px] font-bold text-white uppercase tracking-tight">
                    {originText}
                </p>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-stone-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Album Image */}
            <div className="px-4 pb-4 z-10">
                <div className="aspect-square w-full rounded-lg overflow-hidden shadow-2xl bg-stone-900 flex items-center justify-center">
                    {currentSong.imageUrl ? (
                        <img
                            src={currentSong.imageUrl}
                            alt={currentSong.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Music className="w-1/3 h-1/3 text-stone-700" />
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="px-4 z-10 space-y-1">
                <h2 className="text-2xl font-bold truncate hover:underline cursor-pointer">
                    {currentSong.title}
                </h2>
                <p className="text-stone-400 hover:text-white hover:underline cursor-pointer transition-colors text-base">
                    {currentSong.artist.name}
                </p>
            </div>
        </div>
    );
};