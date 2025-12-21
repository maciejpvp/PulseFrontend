import { Book, HomeIcon } from "lucide-react"
import { NavbarItem } from "./NavbarItem"
import { useNavigate } from "react-router";

const ICON_SIZE = 28;

export const Sidebar = () => {
    const navigate = useNavigate();

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
        </div>
    )
}