import { Book, Disc, HomeIcon, User, X } from "lucide-react"
import { NavbarItem } from "./NavbarItem"
import { useNavigate } from "react-router";
import { useBookmarks } from "@/graphql/queries/useBookmarks";
import { cn } from "@/lib/utils";

const ICON_SIZE = 28;

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: Props) => {
    const navigate = useNavigate();
    const { bookmarks = [] } = useBookmarks();

    const items = [
        {
            label: "Home",
            icon: <HomeIcon size={ICON_SIZE} />,
            onClick: () => {
                navigate("/");
                onClose();
            }
        },
        {
            label: "Your Library",
            icon: <Book size={ICON_SIZE} />,
            onClick: () => {
                navigate("/library");
                onClose();
            }
        }
    ]

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <div
                style={{
                    color: "var(--sidebar-primary-foreground)"
                }}
                className={cn(
                    "w-64 flex flex-col transition-transform duration-300 ease-in-out z-50",
                    "fixed inset-y-0 left-0 bg-black md:relative md:translate-x-0 md:bg-transparent",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-4 md:hidden">
                    <span className="font-bold text-xl">Menu</span>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <ul className="flex flex-col gap-1 px-2 md:px-0">
                    {items.map((item) => (
                        <NavbarItem key={item.label} label={item.label} icon={item.icon} onClick={item.onClick} />
                    ))}
                </ul>
                <ul className="flex flex-col gap-1 mt-4 px-2 md:px-0 overflow-y-auto">
                    {bookmarks.map((item) => {
                        const handleClick = (path: string) => {
                            navigate(path);
                            onClose();
                        };

                        if (item.__typename === "AlbumPreview") {
                            return (
                                <NavbarItem
                                    key={item.id}
                                    label={item.name}
                                    subLabel="Album"
                                    imageUrl={item.imageUrl || undefined}
                                    icon={<Disc size={20} />}
                                    onClick={() => handleClick(`/album/${item.artist.id}/${item.id}`)}
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
                                    onClick={() => handleClick(`/playlist/${item.id}`)}
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
                                    onClick={() => handleClick(`/artist/${item.id}`)}
                                />
                            );
                        }
                        return null;
                    })}
                </ul>
            </div>
        </>
    )
}