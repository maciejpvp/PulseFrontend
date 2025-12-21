import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

export const SearchBar = () => {
    return (
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

            <Input
                type="text"
                placeholder="What do you want to listen to?"
                className="h-12 w-72 pl-10 pr-20"
            />

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <Kbd>Ctrl + K</Kbd>
            </div>
        </div>
    );
};
