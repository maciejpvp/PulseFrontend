import { Input } from "@/components/ui/input";
import { Search, Loader2, X } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "@/graphql/queries/useSearch";
import { useNavigate } from "react-router";
import type { BookmarkItem } from "@/graphql/types";
import { cn } from "@/lib/utils";

type SearchType = "ARTIST" | "SONG" | "ALBUM" | "PLAYLIST";

type Props = {
    isExpanded: boolean;
    onToggle: (expanded: boolean) => void;
}

export const SearchBar = ({ isExpanded, onToggle }: Props) => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [type, setType] = useState<SearchType>("ARTIST");
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { data, isLoading } = useSearch(debouncedQuery, type);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
                if (window.innerWidth < 768) {
                    onToggle(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onToggle]);

    const handleSelectResult = (item: BookmarkItem) => {
        setShowResults(false);
        setQuery(""); // Optional: clear search after selection
        onToggle(false);

        switch (item.__typename) {
            case "ArtistPreview":
                navigate(`/artist/${item.id}`);
                break;
            case "AlbumPreview":
                navigate(`/album/${item.id}`);
                break;
            case "PlaylistPreview":
                navigate(`/playlist/${item.id}`);
                break;
            case "SongPreview":
                // For now, navigate to the artist page as we don't have a dedicated song page
                if (item.artistId) {
                    navigate(`/artist/${item.artistId}`);
                }
                break;
        }
    };

    return (
        <div
            ref={searchRef}
            className={cn(
                "relative group flex items-center gap-2 transition-all duration-300",
                isExpanded ? "flex-1" : "flex-initial"
            )}
        >
            {/* Mobile Search Icon (when collapsed) */}
            {!isExpanded && (
                <button
                    onClick={() => onToggle(true)}
                    className="p-2 hover:bg-white/10 rounded-full md:hidden"
                    aria-label="Open Search"
                >
                    <Search size={24} />
                </button>
            )}

            <div className={cn(
                "relative flex-1 items-center",
                isExpanded ? "flex" : "hidden md:flex"
            )}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />

                <div className="absolute left-10 top-1/2 -translate-y-1/2 z-20">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as SearchType)}
                        className="h-8 bg-transparent text-xs font-medium text-muted-foreground focus:outline-none cursor-pointer hover:text-foreground transition-colors uppercase"
                    >
                        <option value="ARTIST">Artist</option>
                        <option value="SONG">Song</option>
                        <option value="ALBUM">Album</option>
                        <option value="PLAYLIST">Playlist</option>
                    </select>
                </div>

                <Input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search..."
                    className={cn(
                        "h-12 w-full pl-32 pr-20 bg-secondary/50 border-transparent focus:border-primary/20 transition-all",
                        "md:w-96"
                    )}
                />

                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 hidden md:block">
                    <Kbd>Ctrl + K</Kbd>
                </div>

                {/* Mobile Close Button */}
                {isExpanded && (
                    <button
                        onClick={() => onToggle(false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full md:hidden"
                    >
                        <X size={20} />
                    </button>
                )}

                {isLoading && (
                    <div className={cn(
                        "absolute top-1/2 -translate-y-1/2",
                        isExpanded ? "right-12" : "right-12"
                    )}>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {showResults && (query.trim().length > 0 || data.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-md shadow-lg overflow-hidden z-50 min-h-[50px] max-h-[400px] overflow-y-auto">
                    {data.length > 0 ? (
                        <div className="py-1">
                            {data.map((item) => (
                                <button
                                    key={`${item.__typename}-${item.id}`}
                                    onClick={() => handleSelectResult(item)}
                                    className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground flex items-center gap-3 transition-colors"
                                >
                                    {(() => {
                                        const name = 'name' in item ? item.name : ('title' in item ? item.title : 'Result');
                                        const imageUrl = 'imageUrl' in item ? item.imageUrl : null;

                                        return (
                                            <>
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={name}
                                                        className="w-10 h-10 rounded object-cover bg-secondary"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                                                        <Search className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm">{name}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {item.__typename?.replace('Preview', '')}
                                                        {item.__typename === 'AlbumPreview' && 'artist' in item && item.artist && ` • ${item.artist.name}`}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </button>
                            ))}
                        </div>
                    ) : (
                        !isLoading && debouncedQuery && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No results found for "{debouncedQuery}"
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};
