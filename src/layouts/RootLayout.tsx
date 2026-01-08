import { Outlet } from "react-router";
import { useState, useEffect } from "react";

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { PlayerBar } from "@/components/PlayerBar";
import { CreateModal } from "@/components/modals/CreateModal";
import { NowPlayingView } from "@/components/NowPlayingView";
import { usePlayerStore } from "@/store/player.store";
import { Toaster } from "sonner";

export const RootLayout = () => {
    const { currentSong } = usePlayerStore();
    const [isNowPlayingVisible, setIsNowPlayingVisible] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Reset visibility when song changes
    useEffect(() => {
        if (currentSong) {
            const timer = setTimeout(() => {
                setIsNowPlayingVisible(true);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [currentSong?.id, currentSong]);

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="h-screen flex flex-col overflow-hidden bg-black text-white">
                <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex flex-row flex-1 overflow-hidden pt-2 gap-2 px-2 relative">
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    <main className="flex-1 overflow-y-auto pb-28 rounded-lg bg-[#121212]">
                        <Outlet />
                    </main>
                    {currentSong && isNowPlayingVisible && (
                        <NowPlayingView
                            key={currentSong.id}
                            onClose={() => setIsNowPlayingVisible(false)}
                        />
                    )}
                </div>
                <div className="fixed bottom-4 right-4 z-100">
                    <CreateModal />
                </div>
                <PlayerBar />
                <Toaster position="bottom-right" theme="dark" />
            </div>
        </ThemeProvider>
    )
}