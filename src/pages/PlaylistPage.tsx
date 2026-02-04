import { useParams } from "react-router";
import { usePlaylist as usePlaylistQuery } from "../graphql/queries/usePlaylist";
import { usePlaylist as usePlaylistMutation } from '../graphql/mutations/usePlaylist'
import { Clock, Play, Check, ListChecks, Trash } from "lucide-react";
import { ErrorPage } from "./Error";
import { usePlayerStore } from "@/store/player.store";
import type { PlaylistRemoveSongInput, Song } from "../graphql/types";
import { AlbumCover } from "@/components/Album/AlbumCover";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useImageColor } from "@/hooks/useImageColor";
import { PlaylistSkeleton } from "@/components/skeletons/PlaylistSkeleton";
import { useState, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/formatTime";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { playSongMutation } from "@/graphql/mutations/useSongPlay";

export const PlaylistPage = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const { playlist, isLoading, isError, refetch } = usePlaylistQuery(playlistId ?? "");
    const { removeSong } = usePlaylistMutation();
    const playSong = usePlayerStore((state) => state.playSong);
    const currentSong = usePlayerStore((state) => state.currentSong);
    const mainColor = useImageColor(playlist?.imageUrl);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
    const [, startTransition] = useTransition();

    const songs = playlist?.songs.edges.map((edge) => edge.node) ?? [];

    const [optimisticSongs, removeOptimisticSongs] = useOptimistic(
        songs,
        (state, songIdsToRemove: string[]) => state.filter(song => !songIdsToRemove.includes(song.id))
    );

    const handleRemoveSongsFromPlaylist = async () => {
        if (selectedSongIds.size === 0) return;

        const songIdsToRemove = Array.from(selectedSongIds);

        const promise = new Promise((resolve, reject) => {
            startTransition(async () => {
                removeOptimisticSongs(songIdsToRemove);
                try {
                    const input: PlaylistRemoveSongInput = {
                        playlistId: playlistId ?? "",
                        songsIds: songIdsToRemove
                    }
                    const success = await removeSong(input);
                    if (success) {
                        await refetch();
                        setIsEditMode(false);
                        setSelectedSongIds(new Set());
                        resolve(true);
                    } else {
                        reject(new Error("Failed to remove songs"));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        toast.promise(promise, {
            loading: 'Removing songs from playlist...',
            success: 'Songs removed successfully',
            error: 'Failed to remove songs',
        });
    };

    const toggleEditMode = () => {
        setIsEditMode((prev) => {
            if (prev) {
                setSelectedSongIds(new Set());
            }
            return !prev;
        });
    };

    if (isLoading) return (
        <div className="w-full h-full overflow-y-auto relative custom-scrollbar">
            <PlaylistSkeleton />
        </div>
    );
    if (isError || !playlist) return <ErrorPage />;

    const handlePlaySong = async (song: Song) => {
        if (isEditMode) {
            toggleSongSelection(song.id);
            return;
        }

        try {
            // Instant ui response for user seeing effect immediately
            playSong(song, "", playlist.id, "PLAYLIST", playlist.name, songs);

            const url = await playSongMutation({
                input: {
                    songId: song.id,
                    artistId: song.artist.id,
                    contextId: playlist.id,
                    contextType: "PLAYLIST"
                }
            });
            playSong(song, url, playlist.id, "PLAYLIST", playlist.name, songs);
        } catch (error) {
            console.error("Failed to play song:", error);
        }
    };

    const toggleSongSelection = (songId: string) => {
        const newSelected = new Set(selectedSongIds);
        if (newSelected.has(songId)) {
            newSelected.delete(songId);
        } else {
            newSelected.add(songId);
        }
        setSelectedSongIds(newSelected);
    };

    return (
        <div className="w-full h-full overflow-y-auto relative custom-scrollbar">
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(to bottom, ${mainColor}, transparent 50%)`,
                    zIndex: 0
                }}
            />
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 p-4 md:p-8 text-center md:text-left">
                    <AlbumCover
                        imageUrl={playlist.imageUrl}
                        className="w-48 h-48 md:w-64 md:h-64 shadow-lg"
                    />

                    <div className="flex flex-col pb-2 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start w-full gap-4 md:gap-0">
                            <div>
                                <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-stone-400 mb-2 md:mb-0">Playlist</span>
                                <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight mb-2 md:mb-0">{playlist.name}</h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-stone-300 font-medium mt-2">
                            <span className="text-stone-400 text-sm md:text-base">{optimisticSongs.length} {optimisticSongs.length === 1 ? "song" : "songs"}</span>
                            <div className="flex items-center gap-2 ml-2">
                                <BookmarkButton
                                    defaultState={playlist.isBookmarked}
                                    itemId={playlist.id}
                                    itemType="PLAYLIST"
                                    className="bg-stone-800/50 hover:bg-stone-800"
                                />
                                <Button
                                    variant={isEditMode ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={toggleEditMode}
                                    className={`h-8 px-3 gap-2 rounded-full ${isEditMode ? "bg-white text-black hover:bg-stone-200" : "text-stone-400 hover:text-white hover:bg-white/10"}`}
                                >
                                    <ListChecks size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{isEditMode ? "Done" : "Edit"}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Edit */}
                {isEditMode && (
                    <div className="fixed bottom-24 left-1/2 flex flex-col justify-center items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleRemoveSongsFromPlaylist}
                            className="
                                h-12 w-12 rounded-full
                                bg-white/5
                                text-stone-400
                                shadow-[0_4px_12px_rgba(0,0,0,0.35)]
                                transition-all duration-250 ease-out
                                hover:bg-white/10
                                hover:text-white
                                hover:shadow-[0_10px_30px_rgba(0,0,0,0.45)]
                                hover:-translate-y-1
                                active:translate-y-0
                                active:shadow-[0_3px_8px_rgba(0,0,0,0.4)]
                            "
                        >
                            <Trash size={20} />
                        </Button>
                    </div>
                )}

                <div className="px-4 md:px-8 pb-8">
                    <div className={`grid ${isEditMode ? "grid-cols-[40px_16px_1fr_auto]" : "grid-cols-[16px_1fr_auto]"} gap-4 px-4 py-2 border-b border-stone-800 text-stone-400 text-sm uppercase tracking-wider mb-4`}>
                        {isEditMode && <span></span>}
                        <span>#</span>
                        <span>Title</span>
                        <Clock className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col">
                        <AnimatePresence initial={false}>
                            {optimisticSongs.map((song, index) => (
                                <motion.div
                                    key={song.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => handlePlaySong(song)}
                                    className={`grid ${isEditMode ? "grid-cols-[40px_16px_1fr_auto]" : "grid-cols-[16px_1fr_auto]"} gap-4 px-4 py-3 hover:bg-white/5 rounded-md group transition-colors items-center cursor-pointer ${song.id === currentSong?.id ? "bg-gradient-to-t from-green-500/20 from-0% to-60% to-transparent" : ""
                                        } ${selectedSongIds.has(song.id) ? "bg-white/10" : ""}`}
                                >
                                    {isEditMode && (
                                        <div className="flex items-center justify-center" onClick={(e) => { e.stopPropagation(); toggleSongSelection(song.id); }}>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedSongIds.has(song.id) ? "bg-primary border-primary text-primary-foreground" : "border-stone-600 hover:border-stone-400"}`}>
                                                {selectedSongIds.has(song.id) && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center">
                                        <span className="text-stone-500 group-hover:hidden text-sm font-medium tabular-nums">
                                            {index + 1}
                                        </span>
                                        <Play className="w-4 h-4 text-white hidden group-hover:block" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-base group-hover:text-white transition-colors">{song.title}</span>
                                        <span className="text-stone-500 text-sm group-hover:text-stone-400 transition-colors">
                                            {song.artist.name}
                                        </span>
                                    </div>
                                    <span className="text-stone-500 text-sm font-medium tabular-nums">
                                        {song.duration ? formatTime(song.duration) : "--:--"}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};


