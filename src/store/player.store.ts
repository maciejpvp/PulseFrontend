import { create } from "zustand";
import type { Song, MutationSongPlayArgs, ContextType } from "../graphql/types";

type PlayerStore = {
    currentSong: Song | null;
    isPlaying: boolean;
    volume: number;
    progress: number;
    duration: number;
    queue: Song[];
    audio: HTMLAudioElement | null;
    contextId: string | null;
    contextType: ContextType | null;

    setCurrentSong: (song: Song | null) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    setDuration: (duration: number) => void;
    setQueue: (queue: Song[]) => void;
    nextSong: (playMutation: (args: MutationSongPlayArgs) => Promise<string>) => Promise<void>;
    previousSong: (playMutation: (args: MutationSongPlayArgs) => Promise<string>) => Promise<void>;
    playSong: (song: Song, url: string, contextId: string, contextType: ContextType, queue?: Song[]) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    currentSong: null,
    isPlaying: false,
    volume: 0.5,
    progress: 0,
    duration: 0,
    queue: [],
    audio: typeof Audio !== "undefined" ? (() => {
        const a = new Audio();
        a.preload = "auto";
        return a;
    })() : null,
    contextId: null,
    contextType: null,

    setCurrentSong: (song) => {
        const { audio } = get();
        if (audio && song) {
            // In a real app, we'd fetch the signed URL here or have it in the song object
            // For now, let's assume we'll handle the source setting in playSong
            set({ currentSong: song });
        } else {
            set({ currentSong: null, isPlaying: false });
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        }
    },

    togglePlay: () => {
        const { audio, isPlaying, currentSong } = get();
        if (!audio || !currentSong) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(console.error);
        }
        set({ isPlaying: !isPlaying });
    },

    setVolume: (volume) => {
        const { audio } = get();
        if (audio) {
            audio.volume = volume;
        }
        set({ volume });
    },

    setProgress: (progress) => {
        const { audio } = get();
        if (audio) {
            audio.currentTime = progress;
        }
        set({ progress });
    },

    setDuration: (duration) => set({ duration }),

    setQueue: (queue) => set({ queue }),

    nextSong: async (playMutation) => {
        const { queue, currentSong, playSong, contextId, contextType } = get();
        if (queue.length === 0 || !currentSong || !contextId || !contextType) return;

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        const nextSong = queue[nextIndex];

        try {
            const url = await playMutation({
                input: {
                    songId: nextSong.id,
                    artistId: nextSong.artist.id,
                    contextId,
                    contextType
                }
            });
            playSong(nextSong, url, contextId, contextType);
        } catch (error) {
            console.error("Failed to play next song:", error);
        }
    },

    previousSong: async (playMutation) => {
        const { queue, currentSong, playSong, audio, contextId, contextType } = get();
        if (queue.length === 0 || !currentSong || !contextId || !contextType) return;

        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
        const prevSong = queue[prevIndex];

        try {
            const url = await playMutation({
                input: {
                    songId: prevSong.id,
                    artistId: prevSong.artist.id,
                    contextId,
                    contextType
                }
            });
            playSong(prevSong, url, contextId, contextType);
        } catch (error) {
            console.error("Failed to play previous song:", error);
        }
    },

    playSong: (song, url, contextId, contextType, queue) => {
        const { audio } = get();
        if (!audio) return;

        set({
            currentSong: song,
            isPlaying: true,
            contextId,
            contextType,
            queue: queue || get().queue
        });

        audio.src = url;
        audio.play().catch(console.error);
    },
}));

// Initialize audio listeners
if (typeof Audio !== "undefined") {
    const audio = usePlayerStore.getState().audio;
    if (audio) {
        audio.addEventListener("timeupdate", () => {
            usePlayerStore.setState({ progress: audio.currentTime });
        });
        audio.addEventListener("loadedmetadata", () => {
            usePlayerStore.setState({ duration: audio.duration });
        });
        audio.addEventListener("ended", () => {
            // We can't easily call nextSong here because it needs playMutation
            // We'll need to handle auto-next in a component or provide a way to get playMutation
        });
    }
}
