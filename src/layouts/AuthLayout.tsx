import { ThemeProvider } from "@/components/theme-provider";
import { Outlet } from "react-router";

export const AuthLayout = () => {


    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="h-[calc(100vh-4rem)]">
                <Outlet />
            </div>
        </ThemeProvider>
    )
}