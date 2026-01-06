import { useNavigate, useParams } from "react-router";
import { useAlbum } from "../graphql/queries/useAlbum";
import { Clock, User, Play, Check } from "lucide-react";
import { formatTime } from "@/lib/formatTime";
import { ErrorPage } from "./Error";
import { usePlayerStore } from "@/store/player.store";
import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import type { Song } from "../graphql/types";
import { AlbumCover } from "../components/Album/AlbumCover";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useImageColor } from "@/hooks/useImageColor";
import { ArtistPic } from "@/components/Artist/ArtistPic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlaylist } from "@/graphql/mutations/usePlaylist";


export const AlbumPage = () => {
    const navigate = useNavigate();
    const { albumId, artistId } = useParams<{ albumId: string; artistId: string }>();
    const { album, isLoading, isError } = useAlbum(albumId ?? "", artistId ?? "");
    const playSong = usePlayerStore((state) => state.playSong);
    const currentSong = usePlayerStore((state) => state.currentSong);
    const { playSongMutation } = useSongPlay();
    const mainColor = useImageColor(album?.imageUrl);
    const { addSong, isAdding } = usePlaylist();

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(new Set());
    const [targetPlaylistId, setTargetPlaylistId] = useState("");

    if (isLoading) return <div className="p-8 text-stone-400">Loading...</div>;
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
            setIsEditMode(false);
            setSelectedSongIds(new Set());
            setTargetPlaylistId("");
            // Optionally add a toast notification here
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
                <div className="flex items-end gap-8 p-8">
                    <AlbumCover key={albumId} imageUrl={album.imageUrl} />

                    <div className="flex flex-col pb-2 w-full">
                        <div className="flex justify-between items-start w-full">
                            <div>
                                <span className="text-sm font-medium uppercase tracking-wider text-stone-400">Album</span>
                                <h1 className="text-6xl font-black text-white tracking-tight">{album.name}</h1>
                            </div>
                            <Button
                                variant={isEditMode ? "secondary" : "ghost"}
                                onClick={() => setIsEditMode(!isEditMode)}
                            >
                                {isEditMode ? "Done" : "Edit"}
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-stone-300 font-medium ml-2 mt-2">
                            <div className="w-6 h-6 bg-stone-700 rounded-full flex items-center justify-center">
                                {album.artist.imageUrl ? <ArtistPic url={album.artist.imageUrl} size={6} /> : <User size={16} />}
                            </div>
                            <span className="hover:underline cursor-pointer" onClick={handleNavigateToArtist}>{album.artist.name}</span>
                            <span className="text-stone-500">•</span>
                            <span className="text-stone-400">{songs.length} songs</span>
                            <BookmarkButton defaultState={album.isBookmarked} itemId={album.id} artistId={album.artist.id} itemType="ALBUM" />
                        </div>
                        {isEditMode && (
                            <div className="flex items-center gap-4 mt-4 bg-black/20 p-4 rounded-lg backdrop-blur-sm">
                                <Input
                                    placeholder="Playlist ID"
                                    value={targetPlaylistId}
                                    onChange={(e) => setTargetPlaylistId(e.target.value)}
                                    className="w-64"
                                />
                                <Button
                                    onClick={handleAddToPlaylist}
                                    disabled={!targetPlaylistId || selectedSongIds.size === 0 || isAdding}
                                >
                                    {isAdding ? "Adding..." : `Add ${selectedSongIds.size} Songs to Playlist`}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 pb-8">
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

