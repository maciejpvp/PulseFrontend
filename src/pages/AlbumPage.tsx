import { useNavigate, useParams } from "react-router";
import { useAlbum } from "../graphql/queries/useAlbum";
import { Clock, User, Play, Check, ListChecks, X } from "lucide-react";
import { formatTime } from "@/lib/formatTime";
import { ErrorPage } from "./Error";
import { usePlayerStore } from "@/store/player.store";
import type { Song } from "../graphql/types";
import { AlbumCover } from "../components/Album/AlbumCover";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useImageColor } from "@/hooks/useImageColor";
import { ArtistPic } from "@/components/Artist/ArtistPic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlaylist } from "@/graphql/mutations/usePlaylist";
import { AlbumSkeleton } from "@/components/skeletons/AlbumSkeleton";
import { toast } from "sonner";
import { playSongMutation } from "@/graphql/mutations/useSongPlay";


export const AlbumPage = () => {
    const navigate = useNavigate();
    const { albumId, artistId } = useParams<{ albumId: string; artistId: string }>();
    const { album, isLoading, isError } = useAlbum(albumId ?? "", artistId ?? "");
    const playSong = usePlayerStore((state) => state.playSong);
    const currentSong = usePlayerStore((state) => state.currentSong);
    const mainColor = useImageColor(album?.imageUrl);
    const { addSong, isAdding } = usePlaylist();

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
    const [targetPlaylistId, setTargetPlaylistId] = useState("");

    useEffect(() => {
        (async () => {
            if (!isEditMode) {
                setSelectedSongIds(new Set());
                setTargetPlaylistId("");
            }
        })();
    }, [isEditMode])

    if (isLoading) return (
        <div className="w-full h-full overflow-y-auto relative custom-scrollbar">
            <AlbumSkeleton />
        </div>
    );
    if (isError || !album) return <ErrorPage />;

    const songs = album.songs.edges.map((edge) => ({
        ...edge.node,
        artist: album.artist
    }));

    const handleNavigateToArtist = () => {
        navigate(`/artist/${artistId}`);
    }

    const handlePlaySong = async (song: Song) => {
        if (isEditMode) {
            toggleSongSelection(song.id);
            return;
        }

        console.log(song);
        try {
            // Instant ui response for user seeing effect immediately
            playSong(song, "", album.id, "ALBUM", album.name, songs);

            const url = await playSongMutation({
                input: {
                    songId: song.id,
                    artistId: album.artist.id,
                    contextId: album.id,
                    contextType: "ALBUM"
                }
            });
            playSong(song, url, album.id, "ALBUM", album.name, songs);
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

    const handleAddToPlaylist = async () => {
        if (!targetPlaylistId || selectedSongIds.size === 0) return;

        const songsToAdd = Array.from(selectedSongIds).map(id => ({
            id,
            artistId: album.artist.id
        }));

        const success = await addSong({
            playlistId: targetPlaylistId,
            songs: songsToAdd
        });

        if (success) {
            toast.success("Songs added to playlist", {
                action: {
                    label: "View Playlist",
                    onClick: () => navigate(`/playlist/${targetPlaylistId}`)
                }
            });
            setIsEditMode(false);
            setSelectedSongIds(new Set());
            setTargetPlaylistId("");
        }
    };

    console.log(album);


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
                        key={albumId}
                        imageUrl={album.imageUrl}
                        className="w-48 h-48 md:w-64 md:h-64 shadow-lg"
                    />

                    <div className="flex flex-col pb-2 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start w-full gap-4 md:gap-0">
                            <div>
                                <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-stone-400 mb-2 md:mb-0">Album</span>
                                <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight mb-2 md:mb-0">{album.name}</h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-stone-300 font-medium mt-2">
                            <div className="flex items-center gap-2 hover:underline cursor-pointer" onClick={handleNavigateToArtist}>
                                <div className="w-6 h-6 bg-stone-700 rounded-full flex items-center justify-center overflow-hidden">
                                    {album.artist.imageUrl ? <ArtistPic url={album.artist.imageUrl} size={6} /> : <User size={16} />}
                                </div>
                                <span>{album.artist.name}</span>
                            </div>
                            <span className="text-stone-500">•</span>
                            <span className="text-stone-400 text-sm md:text-base">{songs.length} {songs.length === 1 ? "song" : "songs"}</span>
                            <div className="flex items-center gap-2 ml-2">
                                <BookmarkButton defaultState={album.isBookmarked} itemId={album.id} artistId={album.artist.id} itemType="ALBUM" />
                                <Button
                                    variant={isEditMode ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    className={`h-8 px-3 gap-2 rounded-full ${isEditMode ? "bg-white text-black hover:bg-stone-200" : "text-stone-400 hover:text-white hover:bg-white/10"}`}
                                >
                                    <ListChecks size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{isEditMode ? "Done" : "Edit"}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {isEditMode && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl">
                        <div className="bg-stone-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-3 flex-1 w-full">
                                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                    {selectedSongIds.size} Selected
                                </div>
                                <Input
                                    placeholder="Enter Playlist ID..."
                                    value={targetPlaylistId}
                                    onChange={(e) => setTargetPlaylistId(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:border-primary/50 h-10"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Button
                                    onClick={handleAddToPlaylist}
                                    disabled={!targetPlaylistId || selectedSongIds.size === 0 || isAdding}
                                    className="flex-1 md:flex-none h-10 px-6 rounded-xl font-bold"
                                >
                                    {isAdding ? "Adding..." : "Add to Playlist"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setSelectedSongIds(new Set());
                                    }}
                                    className="h-10 w-10 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>
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
                        {songs.map((song, index) => (
                            <div
                                key={song.id}
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
                                        {album.artist.name}
                                    </span>
                                </div>
                                <span className="text-stone-500 text-sm font-medium tabular-nums">
                                    {song.duration ? formatTime(song.duration) : "--:--"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
