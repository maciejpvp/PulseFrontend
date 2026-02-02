import { usePlayerStore } from "@/store/player.store";
import { useCloudStateStore } from "@/store/cloudstate.store";
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
    Disc,
    Monitor,
    Smartphone,
    HelpCircle,
    Laptop
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
    const devices = useCloudStateStore(store => store.devices);
    const { playSongMutation } = useSongPlay();
    const progressBarRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        useCloudStateStore.getState().fetchDevices();
    }, [])

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

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case "DESKTOP": return <Monitor className="w-4 h-4" />;
            case "MOBILE": return <Smartphone className="w-4 h-4" />;
            default: return <HelpCircle className="w-4 h-4" />;
        }
    };

    return createPortal(
        <div className={cn(
            "fixed z-50 group/player transition-all duration-300",
            // Mobile: Floating liquid glass
            "bottom-8 left-4 right-4 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 flex items-center justify-between shadow-2xl",
            // Desktop: Full width solid black
            "md:bottom-0 md:left-0 md:right-0 md:h-24 md:bg-black md:border-none md:rounded-none md:px-4"
        )}>
            {/* Progress Bar Hit Area */}
            <div
                className={cn(
                    "absolute left-0 right-0 cursor-pointer group z-10",
                    "top-0 h-1 md:top-[-10px] md:h-6"
                )}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    setProgress(percentage * duration);
                }}
            >
                {/* Visual Bar Container */}
                <div className={cn(
                    "absolute left-1 right-1 md:left-0 md:right-0 bg-white/10 transition-[height,top]",
                    "top-[0.4px] h-full rounded-t-xl md:rounded-none md:top-[10px] md:h-[2px] md:group-hover:h-1.5 md:group-hover:top-[8px]"
                )}>
                    <div
                        ref={progressBarRef}
                        className="h-full bg-green-500 origin-left will-change-transform rounded-t-xl md:rounded-none"
                        style={{ transform: `scaleX(${(progress / duration) || 0}) ` }}
                    />
                </div>
                {/* Knob - Only on Desktop */}
                <div
                    ref={knobRef}
                    className="absolute top-[11px] -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none hidden md:block"
                    style={{ left: `${(progress / duration) * 100}%` }}
                />
            </div>

            {/* Song Info */}
            <div className="flex items-center gap-3 md:gap-4 w-auto md:w-[30%] min-w-0">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-stone-800 rounded overflow-hidden flex items-center justify-center relative flex-shrink-0">
                    {currentSong.imageUrl ? (
                        <img src={currentSong.imageUrl} crossOrigin="anonymous" alt={currentSong.title} className="w-full h-full object-cover" />
                    ) : (
                        <Disc className="w-6 h-6 md:w-8 md:h-8 text-stone-600" />
                    )}
                    {isCrossfading && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-medium truncate text-sm md:text-base">{currentSong.title}</span>
                    <span className="text-stone-400 text-xs md:text-sm truncate">{currentSong.artist.name}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 md:flex-col md:gap-2 md:w-[40%] md:max-w-[600px] flex-shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={toggleShuffle}
                        className={cn(
                            "transition-colors hidden md:block",
                            isShuffled ? "text-green-500 hover:text-green-400" : "text-stone-400 hover:text-white"
                        )}
                    >
                        <Shuffle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => previousSong(playSongMutation)}
                        className="text-stone-400 hover:text-white transition-colors "
                    >
                        <SkipBack className="w-6 h-6 fill-current" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform shrink-0"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 md:w-6 md:h-6 text-black fill-current" />
                        ) : (
                            <Play className="w-5 h-5 md:w-6 md:h-6 text-black fill-current ml-0.5" />
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
                        className={cn(
                            "transition-colors hidden md:block",
                            repeatMode !== "none" ? "text-green-500 hover:text-green-400" : "text-stone-400 hover:text-white"
                        )}
                    >
                        {repeatMode === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-2 w-full justify-center">
                    <span className="text-[10px] text-stone-400">
                        {formatTime(Math.floor(progress))}
                    </span>
                    <span className="text-[10px] text-stone-600">/</span>
                    <span className="text-[10px] text-stone-400">
                        {formatTime(Math.floor(duration))}
                    </span>
                </div>
            </div>

            {/* Right Section: Devices & Volume */}
            <div className="flex items-center justify-end gap-1 md:gap-3 md:w-[30%] min-w-0">
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="text-stone-400 hover:text-white transition-colors p-2 shrink-0">
                            <Laptop className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 bg-stone-900 border-stone-800 text-white p-3 z-[60]" side="top" align="end">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold mb-1 text-stone-400 uppercase tracking-wider text-[10px]">Active Devices</h3>
                            {devices.length > 0 ? (
                                devices.map((device, index) => (
                                    <div key={device.deviceId} className={cn(
                                        "flex items-center gap-3 p-2 rounded-md transition-colors",
                                        index === 0 ? "text-green-500 bg-green-500/10" : "text-stone-300 hover:bg-white/5"
                                    )}>
                                        {getDeviceIcon(device.type)}
                                        <span className="text-xs font-medium truncate">{device.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-stone-500 py-2 italic">No devices found</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Volume - Desktop Only */}
                <div
                    className="hidden md:flex items-center gap-3"
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
            </div>
        </div>,
        document.getElementById("player-root")!
    );
};
