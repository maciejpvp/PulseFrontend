import { Outlet } from "react-router";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { PlayerBar } from "@/components/PlayerBar";

export const RootLayout = () => {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="h-screen flex flex-col overflow-hidden">
                <Navbar />
                <div className="flex flex-row flex-1 overflow-hidden pt-2 gap-6">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto pb-28">
                        <Outlet />
                    </main>
                </div>
                <PlayerBar />
            </div>
        </ThemeProvider>
    )
}