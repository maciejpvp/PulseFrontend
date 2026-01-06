import { useParams } from "react-router";
import { useArtist } from "../graphql/queries/useArtist";
import { ArtistPic } from "@/components/Artist/ArtistPic";
import { CollectionView } from "@/components/CollectionView";
import { ErrorPage } from "./Error";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useImageColor } from "@/hooks/useImageColor";

export const ArtistPage = () => {
    const { artistId } = useParams<{ artistId: string }>();
    const { artist, isLoading, isError } = useArtist(artistId ?? "");
    const mainColor = useImageColor(artist?.imageUrl);

    if (isLoading) return <div className="p-8 text-stone-400">Loading...</div>;
    if (isError || !artist) return <ErrorPage />;

    const albums = (artist.albums?.edges || []).map((edge) => edge.node);

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
                    <ArtistPic
                        key={artistId}
                        url={artist.imageUrl}
                        size={64}
                        className="w-32 h-32 md:w-64 md:h-64 shadow-lg"
                    />
                    <div className="flex flex-col pb-2 w-full md:w-auto">
                        <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-stone-400 mb-2 md:mb-0">Artist</span>
                        <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight mb-4 md:mb-0">{artist.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-2 md:mt-4">
                            <BookmarkButton itemId={artist.id} itemType="ARTIST" artistId={artist.id} defaultState={artist.isBookmarked} />
                            <span className="text-stone-400 font-medium text-sm md:text-base">{albums.length} {albums.length === 1 ? "album" : "albums"}</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-8 pb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Albums</h2>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        {albums.map((album) => (
                            <CollectionView key={album.id} type="album" album={album} artistId={artist.id} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
