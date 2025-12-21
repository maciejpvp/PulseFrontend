import { Logo } from "./Logo"
import { SearchBar } from "./SearchBar"
import { SettingsGear } from "./SettingsGear"

export const Navbar = () => {
    return (
        <div className="flex items-center p-2 justify-between">
            <Logo />
            <SearchBar />
            <SettingsGear />
        </div>
    )
}