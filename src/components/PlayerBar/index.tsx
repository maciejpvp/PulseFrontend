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
import { useEffect, useRef } from "react";

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
    const progressBarRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        let animationFrameId: number;

        const updateProgress = () => {
            const audio = usePlayerStore.getState().audio;
            if (audio && progressBarRef.current && !isCrossfading) {
                const currentProgress = audio.currentTime;
                const currentDuration = audio.duration;
                if (currentDuration > 0) {
                    const percentage = (currentProgress / currentDuration) * 100;
                    progressBarRef.current.style.transform = `scaleX(${percentage / 100})`;
                    if (knobRef.current) {
                        knobRef.current.style.left = `${percentage}%`;
                    }
                }
            }
            animationFrameId = requestAnimationFrame(updateProgress);
        };

        if (isPlaying && !isCrossfading) {
            animationFrameId = requestAnimationFrame(updateProgress);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying, isCrossfading]);

    if (!currentSong) return null;

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
    };

    return createPortal(
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black px-4 flex items-center justify-between z-50 group/player">
            {/* Progress Bar Hit Area */}
            <div
                className="absolute top-[-10px] left-0 right-0 h-6 cursor-pointer group z-10"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    setProgress(percentage * duration);
                }}
            >
                {/* Visual Bar Container */}
                <div className="absolute top-[10px] left-0 right-0 h-[2px] bg-white/10 transition-[height,top] group-hover:h-1.5 group-hover:top-[8px]">
                    <div
                        ref={progressBarRef}
                        className="h-full bg-green-500 origin-left will-change-transform"
                        style={{ transform: `scaleX(${(progress / duration) || 0})` }}
                    />
                </div>
                {/* Knob */}
                <div
                    ref={knobRef}
                    className="absolute top-[11px] -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none"
                    style={{ left: `${(progress / duration) * 100}%` }}
                />
            </div>

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

                <div className="flex items-center gap-2 w-full justify-center">
                    <span className="text-[10px] text-stone-400">
                        {formatTime(Math.floor(progress))}
                    </span>
                    <span className="text-[10px] text-stone-600">/</span>
                    <span className="text-[10px] text-stone-400">
                        {formatTime(Math.floor(duration))}
                    </span>
                </div>
            </div>

            {/* Volume */}
            <div
                className="flex items-center justify-end gap-3 w-[30%]"
                onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.05 : 0.05;
                    const newVolume = Math.max(0, Math.min(1, volume + delta));
                    setVolume(newVolume);
                }}
            >
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
