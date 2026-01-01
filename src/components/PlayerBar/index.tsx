import { usePlayerStore } from "@/store/player.store";
import { createPortal } from "react-dom";
import { formatTime } from "@/lib/formatTime";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Repeat1,
    Shuffle,
    Disc
} from "lucide-react";
import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import { useEffect } from "react";

export const PlayerBar = () => {
    const {
        currentSong,
        isPlaying,
        togglePlay,
        progress,
        duration,
        setProgress,
        volume,
        setVolume,
        nextSong,
        previousSong,
        isShuffled,
        repeatMode,
        toggleShuffle,
        toggleRepeat,
        prepareNextSong,
        startCrossfade,
        nextSongData,
        isCrossfading
    } = usePlayerStore();
    const { playSongMutation } = useSongPlay();

    useEffect(() => {
        const audio = usePlayerStore.getState().audio;
        if (!audio) return;

        const handleEnded = () => {
            if (!isCrossfading) {
                nextSong(playSongMutation);
            }
        };

        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [nextSong, playSongMutation, isCrossfading]);

    useEffect(() => {
        if (isCrossfading || !duration || !currentSong) return;

        const remaining = duration - progress;

        // Prepare next song when 10 seconds remain
        if (remaining <= 20 && remaining > 5 && !nextSongData) {
            prepareNextSong(playSongMutation);
        }

        // Start crossfade when 5 seconds remain
        if (remaining <= 10 && remaining > 0 && nextSongData) {
            startCrossfade(playSongMutation);
        }
    }, [
        progress,
        duration,
        currentSong,
        nextSongData,
        isCrossfading,
        prepareNextSong,
        startCrossfade,
        playSongMutation
    ]);

    if (!currentSong) return null;

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProgress(Number(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
    };

    return createPortal(
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-white/10 px-4 flex items-center justify-between z-50">
            {/* Song Info */}
            <div className="flex items-center gap-4 w-[30%]">
                <div className="w-14 h-14 bg-stone-800 rounded overflow-hidden flex items-center justify-center relative flex-shrink-0">
                    {currentSong.imageUrl ? (
                        <img src={currentSong.imageUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                    ) : (
                        <Disc className="w-8 h-8 text-stone-600" />
                    )}
                    {isCrossfading && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-medium truncate">{currentSong.title}</span>
                    <span className="text-stone-400 text-sm truncate">{currentSong.artist.name}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-2 w-[40%] max-w-[600px]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleShuffle}
                        className={`transition-colors ${isShuffled ? "text-green-500 hover:text-green-400" : "text-stone-400 hover:text-white"}`}
                    >
                        <Shuffle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => previousSong(playSongMutation)}
                        className="text-stone-400 hover:text-white transition-colors"
                    >
                        <SkipBack className="w-6 h-6 fill-current" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-black fill-current" />
                        ) : (
                            <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                        )}
                    </button>
                    <button
                        onClick={() => nextSong(playSongMutation, true)}
                        className="text-stone-400 hover:text-white transition-colors"
                    >
                        <SkipForward className="w-6 h-6 fill-current" />
                    </button>
                    <button
                        onClick={toggleRepeat}
                        className={`transition-colors ${repeatMode !== "none" ? "text-green-500 hover:text-green-400" : "text-stone-400 hover:text-white"}`}
                    >
                        {repeatMode === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-stone-400 w-10 text-right">
                        {formatTime(Math.floor(progress))}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={progress}
                        onChange={handleProgressChange}
                        className="flex-1 h-1 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-green-500"
                    />
                    <span className="text-xs text-stone-400 w-10">
                        {formatTime(Math.floor(duration))}
                    </span>
                </div>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-end gap-3 w-[30%]">
                <button className="text-stone-400 hover:text-white transition-colors">
                    {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-green-500"
                />
            </div>
        </div>,
        document.getElementById("player-root")!
    );
};
