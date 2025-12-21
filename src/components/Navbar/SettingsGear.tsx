import { Settings } from "lucide-react";

export const SettingsGear = () => {
    const size = 26;
    return (
        <div className="p-2">
            <Settings style={{ height: `${size}px`, width: `${size}px` }} />
        </div>
    )
}