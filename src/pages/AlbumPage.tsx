import { useNavigate, useParams } from "react-router";
import { useAlbum } from "../graphql/queries/useAlbum";
import { Clock, User, Play } from "lucide-react";
import { formatTime } from "@/lib/formatTime";
import { ErrorPage } from "./Error";
import { usePlayerStore } from "@/store/player.store";
import { useSongPlay } from "@/graphql/mutations/useSongPlay";
import type { Song } from "../graphql/types";
import { AlbumCover } from "../components/Album/AlbumCover";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useImageColor } from "@/hooks/useImageColor";


export const AlbumPage = () => {
    const navigate = useNavigate();
    const { albumId, artistId } = useParams<{ albumId: string; artistId: string }>();
    const { album, isLoading, isError } = useAlbum(albumId ?? "", artistId ?? "");
    const playSong = usePlayerStore((state) => state.playSong);
    const { playSongMutation } = useSongPlay();
    const mainColor = useImageColor(album?.imageUrl);


    if (isLoading) return <div className="p-8 text-stone-400">Loading...</div>;
    if (isError || !album) return <ErrorPage />;

    const songs = album.songs.edges.map((edge) => edge.node);

    const handleNavigateToArtist = () => {
        navigate(`/artist/${artistId}`);
    }

    const handlePlaySong = async (song: Song) => {
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
            playSong(song, url, album.id, "ALBUM", songs);
        } catch (error) {
            console.error("Failed to play song:", error);
        }
    };

    console.log(album);

    return (
        <div className="w-full h-full overflow-y-auto relative">
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

                    <div className="flex flex-col pb-2">
                        <span className="text-sm font-medium uppercase tracking-wider text-stone-400">Album</span>
                        <h1 className="text-6xl font-black text-white tracking-tight">{album.name}</h1>
                        <div className="flex items-center gap-2 text-stone-300 font-medium ml-2">
                            <div className="w-6 h-6 bg-stone-700 rounded-full flex items-center justify-center">
                                <User size={16} />
                            </div>
                            <span className="hover:underline cursor-pointer" onClick={handleNavigateToArtist}>{album.artist.name}</span>
                            <span className="text-stone-500">•</span>
                            <span className="text-stone-400">{songs.length} songs</span>
                            <BookmarkButton defaultState={album.isBookmarked} itemId={album.id} artistId={album.artist.id} itemType="ALBUM" />
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 border-b border-stone-800 text-stone-400 text-sm uppercase tracking-wider mb-4">
                        <span>#</span>
                        <span>Title</span>
                        <Clock className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col">
                        {songs.map((song, index) => (
                            <div
                                key={song.id}
                                onClick={() => handlePlaySong(song)}
                                className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-3 hover:bg-white/5 rounded-md group transition-colors items-center cursor-pointer"
                            >
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

