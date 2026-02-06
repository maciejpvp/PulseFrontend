import { create } from "zustand";
import type { Song, MutationSongPlayArgs, ContextType } from "../graphql/types";
import { debouncedUpdateVolume } from "@/graphql/mutations/CloudStateMutations/updateVolume";

import { playSongMutation } from "@/graphql/mutations/useSongPlay";
import { useCloudStateStore } from "./cloudstate.store";
import { getDevicePingInput } from "@/lib/getDevicePingInput";

import { debouncedUpdateRepeatMode } from "@/graphql/mutations/CloudStateMutations/updateRepeatMode";
import { debouncedUpdateShuffleMode } from "@/graphql/mutations/CloudStateMutations/updateShuffleMode";
import { togglePlayAction } from "./player.actions";

export type PlayerStore = {
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
    togglePlay: (options?: { sendToCloud?: false, mode?: "ON" | "OFF" }) => Promise<void>;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    setDuration: (duration: number) => void;
    setQueue: (queue: Song[]) => void;
    toggleShuffle: () => void;
    toggleRepeat: (mode?: "none" | "all" | "one", sendToCloud?: boolean) => void;
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

    setCurrentSong: async (song) => {
        const { audio1, audio2, activeAudioIndex } = get();
        // Reset progress immediately so new song starts at 0, unless externally updated during async operations
        set({ progress: 0 });

        const activeAudio = activeAudioIndex === 0 ? audio1 : audio2;
        const inactiveAudio = activeAudioIndex === 0 ? audio2 : audio1;

        // 1. If no song is provided, clear everything and stop playback
        if (!song) {
            [activeAudio, inactiveAudio].forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.src = "";
                }
            });
            set({ currentSong: null, isPlaying: false, audio: null });
            return;
        }

        try {
            // 2. Stop current playback immediately for instant feedback
            if (activeAudio) {
                activeAudio.pause();
            }

            // 3. Fetch the audio URL from the mutation
            const url = await playSongMutation({
                input: {
                    songId: song.id,
                    artistId: song.artist.id,
                    contextId: song.id,
                    contextType: "SONG"
                }
            });

            if (url && activeAudio) {
                // 4. Force the new source and play
                activeAudio.src = url;
                activeAudio.load();

                // Apply any progress that might have been set while we were awaiting the mutation
                const { progress } = get();
                if (progress > 0) {
                    activeAudio.currentTime = progress;
                }

                // Update the global state immediately so PlayerBar appears
                set({
                    currentSong: song,
                    audio: activeAudio,
                    isPlaying: false
                });

                // Play returns a promise; we await it to handle potential autoplay blocks
                try {
                    await activeAudio.play();
                    set({ isPlaying: true });
                } catch (e) {
                    console.warn("Playback failed (likely due to autoplay policy):", e);
                    // Keep isPlaying as false, but component remains visible
                }
            }
        } catch (error) {
            console.error("Error setting new song:", error);
            // Even on error, we might want to keep the song set if possible, 
            // but the outer try-catch is mostly for the mutation which we already awaited.
            set({ isPlaying: false });
        }
    },

    togglePlay: async (options) => {
        await togglePlayAction(get, set, options);
    },

    setVolume: (volume) => {
        const { audio1, audio2 } = get();
        const { primeDeviceId } = useCloudStateStore.getState();
        const { deviceId: localDeviceId } = getDevicePingInput();
        const shouldPlay = primeDeviceId === localDeviceId;
        const effectiveVolume = shouldPlay ? volume : 0;

        if (audio1) audio1.volume = effectiveVolume;
        if (audio2) audio2.volume = effectiveVolume;
        set({ volume });

        // Debounce cloud state update
        debouncedUpdateVolume(volume)
    },

    setProgress: (progress) => {
        const { audio } = get();
        console.log("progress", progress);
        console.log("audio", audio);
        if (audio) {
            console.log("progress", progress);
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
            debouncedUpdateShuffleMode(false);
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
            debouncedUpdateShuffleMode(true);
        }
    },

    toggleRepeat: (mode, sendToCloud = true) => {
        console.log("TOGGLE REPEAT");
        if (mode === "none" || mode === "all" || mode === "one") {
            console.log("MODE", mode);
            set({ repeatMode: mode });
            if (sendToCloud) debouncedUpdateRepeatMode(mode);
            return;
        }

        const { repeatMode } = get();
        const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
        const currentIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        console.log("NEXT MODE", nextMode);
        if (sendToCloud) debouncedUpdateRepeatMode(nextMode);
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

        const { primeDeviceId } = useCloudStateStore.getState();
        const { deviceId: localDeviceId } = getDevicePingInput();
        const shouldPlay = primeDeviceId === localDeviceId;

        // Setup inactive audio
        inactiveAudio.src = nextSongData.url;
        inactiveAudio.volume = 0;
        if (shouldPlay) {
            inactiveAudio.play().catch(console.error);
        }

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

        if (shouldPlay) {
            for (let i = 1; i <= steps; i++) {
                await new Promise((resolve) => setTimeout(resolve, stepTime));
                inactiveAudio.volume = Math.min(volume, i * volumeStep);
                activeAudio.volume = Math.max(0, volume - i * volumeStep);
            }
        } else {
            // Even if we shouldn't play, we wait the duration to sync state
            // But volumes should stay 0
            inactiveAudio.volume = 0;
            activeAudio.volume = 0;
            await new Promise((resolve) => setTimeout(resolve, duration));
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
                const { primeDeviceId } = useCloudStateStore.getState();
                const { deviceId: localDeviceId } = getDevicePingInput();
                const shouldPlay = primeDeviceId === localDeviceId;

                if (shouldPlay) {
                    audio.play().catch(console.error);
                }
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

        const { primeDeviceId } = useCloudStateStore.getState();
        const { deviceId: localDeviceId } = getDevicePingInput();
        const shouldPlay = primeDeviceId === localDeviceId;

        activeAudio.volume = shouldPlay ? volume : 0;

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

        if (shouldPlay) {
            activeAudio.play().catch(console.error);
        }
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

// Subscribe to primeDeviceId changes to update volume immediately
useCloudStateStore.subscribe((state) => {
    const { deviceId } = getDevicePingInput();
    const shouldPlay = state.primeDeviceId === deviceId;
    const { audio1, audio2, volume } = usePlayerStore.getState();
    const effectiveVolume = shouldPlay ? volume : 0;

    if (audio1) audio1.volume = effectiveVolume;
    if (audio2) audio2.volume = effectiveVolume;
});
