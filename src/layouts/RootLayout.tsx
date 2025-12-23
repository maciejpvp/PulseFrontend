import { Outlet } from "react-router";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export const RootLayout = () => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="h-[calc(100vh-4rem)]">
                <Navbar />
                <div className="flex flex-row h-[calc(100vh-4rem)] pt-2 gap-6">
                    <Sidebar />
                    <Outlet />
                </div>
            </div>
        </ThemeProvider>
    )
}