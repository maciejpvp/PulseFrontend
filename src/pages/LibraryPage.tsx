import { CollectionView } from "@/components/CollectionView";
import { useBookmarks } from "@/graphql/queries/useBookmarks";
import { Loader2 } from "lucide-react";

export const LibraryPage = () => {
    const { bookmarks, isLoading, isError } = useBookmarks();

    console.log(bookmarks);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full text-stone-400">
                Something went wrong while loading your library.
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-4">Library</h1>

            {bookmarks.length === 0 ? (
                <div className="text-stone-400">
                    You haven't bookmarked anything yet.
                </div>
            ) : (
                <div className="flex flex-wrap gap-4">
                    {bookmarks.map((item) => {
                        console.log(item?.id);
                        if (item.__typename === "AlbumPreview") {
                            return (
                                <CollectionView
                                    key={item.id}
                                    type="album"
                                    album={item}
                                    artistId={item.artist.id}
                                />
                            );
                        }
                        if (item.__typename === "PlaylistPreview") {
                            return (
                                <CollectionView
                                    key={item.id}
                                    type="playlist"
                                    playlist={item}
                                />
                            );
                        }
                        if (item.__typename === "ArtistPreview") {
                            return (
                                <CollectionView
                                    key={item.id}
                                    type="artist"
                                    artist={item}
                                />
                            );
                        }
                        // if (item.__typename === "SongPreview") {
                        //     return (
                        //         <CollectionView
                        //             key={item.id}
                        //             type="song"
                        //             song={item}
                        //             artistId={item.artistId}
                        //         />
                        //     );
                        // }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
};