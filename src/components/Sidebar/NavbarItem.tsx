import { Link } from "react-router";

type Props = {
    label: string;
    subLabel?: string;
    icon?: React.ReactNode;
    imageUrl?: string;
    onClick?: () => void;
    to?: string;
}

export const NavbarItem = ({ label, subLabel, icon, imageUrl, onClick, to }: Props) => {
    const content = (
        <>
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center overflow-hidden rounded-sm group-hover:bg-stone-700 transition-colors">
                {imageUrl ? (
                    <img src={imageUrl} crossOrigin="anonymous" alt={label} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-stone-400 group-hover:text-stone-200 transition-colors">
                        {icon}
                    </div>
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium truncate text-stone-300 group-hover:text-white transition-colors">{label}</p>
                {subLabel && <p className="text-xs text-stone-500 truncate group-hover:text-stone-400 transition-colors">{subLabel}</p>}
            </div>
        </>
    );

    const className = "flex items-center gap-3 p-2 pl-4 hover:bg-sidebar-accent rounded-md cursor-pointer w-full text-left transition-colors group";

    if (to) {
        return (
            <Link to={to} onClick={onClick} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={className}>
            {content}
        </button>
    )
}