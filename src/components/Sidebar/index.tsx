import { Book, Disc, HomeIcon, User } from "lucide-react"
import { NavbarItem } from "./NavbarItem"
import { useNavigate } from "react-router";
import { useBookmarks } from "@/graphql/queries/useBookmarks";

const ICON_SIZE = 28;

export const Sidebar = () => {
    const navigate = useNavigate();
    const { bookmarks = [] } = useBookmarks();

    const items = [
        {
            label: "Home",
            icon: <HomeIcon size={ICON_SIZE} />,
            onClick: () => navigate("/")
        },
        {
            label: "Your Library",
            icon: <Book size={ICON_SIZE} />,
            onClick: () => navigate("/library")
        }
    ]

    return (
        <div style={{
            color: "var(--sidebar-primary-foreground)"
        }} className="w-64">
            <ul className="flex flex-col gap-1">
                {items.map((item) => (
                    <NavbarItem key={item.label} label={item.label} icon={item.icon} onClick={item.onClick} />
                ))}
            </ul>
            <ul className="flex flex-col gap-1 mt-4">
                {bookmarks.map((item) => {
                    if (item.__typename === "AlbumPreview") {
                        return (
                            <NavbarItem
                                key={item.id}
                                label={item.name}
                                subLabel="Album"
                                imageUrl={item.imageUrl || undefined}
                                icon={<Disc size={20} />}
                                onClick={() => navigate(`/album/${item.artist.id}/${item.id}`)}
                            />
                        );
                    }
                    if (item.__typename === "PlaylistPreview") {
                        return (
                            <NavbarItem
                                key={item.id}
                                label={item.name}
                                subLabel="Playlist"
                                imageUrl={item.imageUrl || undefined}
                                icon={<Disc size={20} />}
                                onClick={() => navigate(`/playlist/${item.id}`)}
                            />
                        );
                    }
                    if (item.__typename === "ArtistPreview") {
                        return (
                            <NavbarItem
                                key={item.id}
                                label={item.name}
                                subLabel="Artist"
                                imageUrl={item.imageUrl || undefined}
                                icon={<User size={20} />}
                                onClick={() => navigate(`/artist/${item.id}`)}
                            />
                        );
                    }
                    return null;
                })}
            </ul>
        </div>
    )
}