import { cn } from "@/lib/utils";

type Props = {
    size?: number; // height in rem
};

export const Logo = ({ size = 3 }: Props) => {
    return (
        <img
            src="/Logo.png"
            alt="Pulse Logo"
            className={cn("w-auto")}
            style={{ height: `${size}rem` }}
        />
    );
};
