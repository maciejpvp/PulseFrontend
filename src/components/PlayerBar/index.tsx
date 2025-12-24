import { usePlayerStore } from "@/store/player.store";
import { formatTime } from "@/lib/formatTime";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Shuffle,
    Disc
} from "lucide-react";
import { useSongPlay } from "@/graphql/mutations/useSongPlay";

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
        previousSong
    } = usePlayerStore();
    const { playSongMutation } = useSongPlay();

    if (!currentSong) return null;

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProgress(Number(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-white/10 px-4 flex items-center justify-between z-50">
            {/* Song Info */}
            <div className="flex items-center gap-4 w-[30%]">
                <div className="w-14 h-14 bg-stone-800 rounded overflow-hidden flex items-center justify-center">
                    <Disc className="w-8 h-8 text-stone-600" />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-medium truncate">{currentSong.title}</span>
                    <span className="text-stone-400 text-sm truncate">{currentSong.artist.name}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-2 w-[40%] max-w-[600px]">
                <div className="flex items-center gap-6">
                    <button className="text-stone-400 hover:text-white transition-colors">
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
                        onClick={() => nextSong(playSongMutation)}
                        className="text-stone-400 hover:text-white transition-colors"
                    >
                        <SkipForward className="w-6 h-6 fill-current" />
                    </button>
                    <button className="text-stone-400 hover:text-white transition-colors">
                        <Repeat className="w-5 h-5" />
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
        </div>
    );
};
