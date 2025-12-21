type Props = {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

export const NavbarItem = ({ label, icon, onClick }: Props) => {
    return (
        <button onClick={onClick} className="flex items-center gap-2 p-2 pl-4 hover:bg-sidebar-accent rounded-xs cursor-pointer">
            {icon}
            <p>{label}</p>
        </button>
    )
}