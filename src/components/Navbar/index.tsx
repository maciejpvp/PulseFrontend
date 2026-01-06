import { useState } from "react"
import { Menu } from "lucide-react"
import { Logo } from "./Logo"
import { SearchBar } from "./SearchBar"
import { SettingsGear } from "./SettingsGear"
import { cn } from "@/lib/utils"

type Props = {
    onToggleSidebar: () => void;
}

export const Navbar = ({ onToggleSidebar }: Props) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    return (
        <div className="flex items-center p-2 justify-between gap-4 min-h-[64px]">
            <div className={cn(
                "flex items-center gap-2 transition-all duration-300",
                isSearchExpanded ? "hidden md:flex" : "flex"
            )}>
                <button
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-white/10 rounded-full md:hidden"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={24} />
                </button>
                <Logo />
            </div>
            <SearchBar isExpanded={isSearchExpanded} onToggle={(expanded) => setIsSearchExpanded(expanded)} />
            <div className={cn(
                "transition-all duration-300",
                isSearchExpanded ? "hidden md:block" : "block"
            )}>
                <SettingsGear />
            </div>
        </div>
    )
}