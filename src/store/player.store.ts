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
    audio1: HTMLAudioElement | null;
    audio2: HTMLAudioElement | null;
    activeAudioIndex: 0 | 1;
    nextSongData: { song: Song; url: string; contextId: string; contextType: ContextType } | null;
    isCrossfading: boolean;
    isShuffled: boolean;
    repeatMode: "none" | "all" | "one";
    originalQueue: Song[];
    contextId: string | null;
    contextType: ContextType | null;
    contextName: string | null;

    setCurrentSong: (song: Song | null) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    setDuration: (duration: number) => void;
    setQueue: (queue: Song[]) => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    prepareNextSong: (playMutation: (args: MutationSongPlayArgs) => Promise<string>) => Promise<void>;
    startCrossfade: (playMutation: (args: MutationSongPlayArgs) => Promise<string>) => Promise<void>;
    nextSong: (playMutation: (args: MutationSongPlayArgs) => Promise<string>, forceNext?: boolean) => Promise<void>;
    previousSong: (playMutation: (args: MutationSongPlayArgs) => Promise<string>) => Promise<void>;
    playSong: (song: Song, url: string, contextId: string, contextType: ContextType, contextName: string, queue?: Song[]) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    currentSong: null,
    isPlaying: false,
    volume: 0.5,
    progress: 0,
    duration: 0,
    queue: [],
    audio: null,
    audio1: typeof Audio !== "undefined" ? new Audio() : null,
    audio2: typeof Audio !== "undefined" ? new Audio() : null,
    activeAudioIndex: 0,
    nextSongData: null,
    isCrossfading: false,
    contextId: null,
    contextType: null,
    contextName: null,
    isShuffled: false,
    repeatMode: "none",
    originalQueue: [],

    setCurrentSong: (song) => {
        const { audio1, audio2, activeAudioIndex } = get();
        const activeAudio = activeAudioIndex === 0 ? audio1 : audio2;
        const inactiveAudio = activeAudioIndex === 0 ? audio2 : audio1;

        if (activeAudio && song) {
            set({ currentSong: song, audio: activeAudio });
        } else {
            set({ currentSong: null, isPlaying: false, audio: null });
            if (activeAudio) {
                activeAudio.pause();
                activeAudio.src = "";
            }
            if (inactiveAudio) {
                inactiveAudio.pause();
                inactiveAudio.src = "";
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
        const { audio1, audio2 } = get();
        if (audio1) audio1.volume = volume;
        if (audio2) audio2.volume = volume;
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

    setQueue: (queue) => set({ queue, originalQueue: queue }),

    toggleShuffle: () => {
        const { isShuffled, queue, currentSong, originalQueue } = get();
        if (isShuffled) {
            // Restore original queue
            set({ isShuffled: false, queue: originalQueue });
        } else {
            // Shuffle queue, but keep current song at the beginning if playing
            let newQueue = [...queue];
            if (currentSong) {
                const otherSongs = queue.filter((s) => s.id !== currentSong.id);
                const shuffled = [...otherSongs].sort(() => Math.random() - 0.5);
                newQueue = [currentSong, ...shuffled];
            } else {
                newQueue = [...queue].sort(() => Math.random() - 0.5);
            }
            set({ isShuffled: true, queue: newQueue });
        }
    },

    toggleRepeat: () => {
        const { repeatMode } = get();
        const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
        const currentIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        set({ repeatMode: nextMode });
    },

    prepareNextSong: async (playMutation) => {
        const { queue, currentSong, contextId, contextType, repeatMode } = get();
        if (queue.length === 0 || !currentSong || !contextId || !contextType) return;

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        let nextIndex = (currentIndex + 1) % queue.length;

        if (repeatMode === "one") {
            nextIndex = currentIndex;
        } else if (repeatMode === "none" && currentIndex === queue.length - 1) {
            return;
        }

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
            set({ nextSongData: { song: nextSong, url, contextId, contextType } });
        } catch (error) {
            console.error("Failed to prepare next song:", error);
        }
    },

    startCrossfade: async (playMutation) => {
        const {
            nextSongData,
            audio1,
            audio2,
            activeAudioIndex,
            volume,
            prepareNextSong,
            isCrossfading
        } = get();

        if (!nextSongData || !audio1 || !audio2 || isCrossfading) return;

        const activeAudio = activeAudioIndex === 0 ? audio1 : audio2;
        const inactiveAudio = activeAudioIndex === 0 ? audio2 : audio1;
        const newActiveIndex = activeAudioIndex === 0 ? 1 : 0;

        set({ isCrossfading: true });

        // Setup inactive audio
        inactiveAudio.src = nextSongData.url;
        inactiveAudio.volume = 0;
        inactiveAudio.play().catch(console.error);

        // Update UI immediately
        set({
            currentSong: nextSongData.song,
            activeAudioIndex: newActiveIndex,
            audio: inactiveAudio,
            nextSongData: null
        });

        // Crossfade
        const duration = 5000; // 5 seconds
        const steps = 50;
        const stepTime = duration / steps;
        const volumeStep = volume / steps;

        for (let i = 1; i <= steps; i++) {
            await new Promise((resolve) => setTimeout(resolve, stepTime));
            inactiveAudio.volume = Math.min(volume, i * volumeStep);
            activeAudio.volume = Math.max(0, volume - i * volumeStep);
        }

        activeAudio.pause();
        activeAudio.src = "";
        set({ isCrossfading: false });

        // Prepare next song for the next transition
        prepareNextSong(playMutation);
    },

    nextSong: async (playMutation, forceNext = false) => {
        const { queue, currentSong, playSong, contextId, contextType, contextName, repeatMode, nextSongData, startCrossfade } = get();
        if (queue.length === 0 || !currentSong || !contextId || !contextType) return;

        if (nextSongData && !forceNext) {
            await startCrossfade(playMutation);
            return;
        }

        if (repeatMode === "one" && !forceNext) {
            const { audio } = get();
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(console.error);
                return;
            }
        }

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        const isLastSong = currentIndex === queue.length - 1;

        if (isLastSong && repeatMode === "none" && !forceNext) {
            set({ isPlaying: false });
            return;
        }

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
            playSong(nextSong, url, contextId, contextType, contextName!);
        } catch (error) {
            console.error("Failed to play next song:", error);
        }
    },

    previousSong: async (playMutation) => {
        const { queue, currentSong, playSong, audio, contextId, contextType, contextName } = get();
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
            playSong(prevSong, url, contextId, contextType, contextName!);
        } catch (error) {
            console.error("Failed to play previous song:", error);
        }
    },

    playSong: (song, url, contextId, contextType, contextName, queue) => {
        const { audio1, audio2, activeAudioIndex, volume } = get();
        if (!audio1 || !audio2) return;

        const activeAudio = activeAudioIndex === 0 ? audio1 : audio2;
        const inactiveAudio = activeAudioIndex === 0 ? audio2 : audio1;

        // Reset both
        activeAudio.pause();
        activeAudio.src = url;
        activeAudio.volume = volume;

        inactiveAudio.pause();
        inactiveAudio.src = "";

        set({
            currentSong: song,
            isPlaying: true,
            contextId,
            contextType,
            contextName,
            queue: queue || get().queue,
            originalQueue: queue || get().originalQueue,
            audio: activeAudio,
            nextSongData: null
        });

        activeAudio.play().catch(console.error);
    },
}));

// Initialize audio listeners
if (typeof Audio !== "undefined") {
    const { audio1, audio2 } = usePlayerStore.getState();
    [audio1, audio2].forEach((audio, index) => {
        if (!audio) return;
        audio.addEventListener("timeupdate", () => {
            const { activeAudioIndex } = usePlayerStore.getState();
            if (activeAudioIndex === index) {
                usePlayerStore.setState({ progress: audio.currentTime });
            }
        });
        audio.addEventListener("loadedmetadata", () => {
            const { activeAudioIndex } = usePlayerStore.getState();
            if (activeAudioIndex === index) {
                usePlayerStore.setState({ duration: audio.duration });
            }
        });
    });
}
