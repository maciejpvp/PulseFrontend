import type { CloudState } from "@/graphql/types";
import { usePlayerStore } from "@/store/player.store";
import { useCloudStateStore } from "@/store/cloudstate.store";
import { getSong } from "@/graphql/queries/useSong";

const handleVolume = (data: CloudState, playerStore: ReturnType<typeof usePlayerStore.getState>) => {
    if (data.volume) {
        if (data.volume === playerStore.volume) return;
        const volume = Math.min(data.volume / 100, 1);
        playerStore.setVolume(volume);
    }
};

const handlePrimeDeviceId = (data: CloudState, cloudStateStore: ReturnType<typeof useCloudStateStore.getState>) => {
    if (data.primeDeviceId) {
        if (data.primeDeviceId === cloudStateStore.primeDeviceId) return;
        cloudStateStore.setPrimeDeviceId(data.primeDeviceId);
    }
};

const handleTrackChange = async (data: CloudState, playerStore: ReturnType<typeof usePlayerStore.getState>) => {
    if (data.trackId && data.trackArtistId) {
        if (data.trackId === playerStore.currentSong?.id && data.trackArtistId === playerStore.currentSong?.artist.id) return;
        console.log("SONG HERE");
        const song = await getSong(data.trackId, data.trackArtistId);
        if (!song) return;
        playerStore.setCurrentSong(song);
        playerStore.setDuration(song.duration);
    }
};

const handleIsPlaying = (data: CloudState, playerStore: ReturnType<typeof usePlayerStore.getState>) => {
    if (data.isPlaying !== null) {
        if (data.isPlaying !== playerStore.isPlaying) {
            playerStore.togglePlay({ sendToCloud: false });
        }
    }
};

const handlePosition = (data: CloudState, playerStore: ReturnType<typeof usePlayerStore.getState>) => {
    if (data.positionMs != null && data.positionUpdatedAt) {
        if (data.isPlaying === false) {
            playerStore.setProgress(Number(data.positionMs));
            return;
        }

        const positionMs = Number(data.positionMs) * 1000;
        const updatedAt = Number(data.positionUpdatedAt);
        const now = Date.now();

        const isPlaying = data.isPlaying ?? playerStore.isPlaying;
        const diffMs = isPlaying ? Math.max(0, now - updatedAt) : 0; // avoid negative time travel

        const correctedPositionMs: number = positionMs + diffMs;
        const corrected = correctedPositionMs / 1000;

        playerStore.setProgress(corrected);
    }
};

const handleShuffleMode = (data: CloudState, playerStore: ReturnType<typeof usePlayerStore.getState>) => {
    if (data.shuffleMode) {
        const mode = data.shuffleMode === "ON" ? true : false;
        console.log("SHUFFLE MODE", mode);

        if (mode !== playerStore.isShuffled) {
            playerStore.toggleShuffle();
        }
    }
};

const handleRepeatMode = (data: CloudState, playerStore: ReturnType<typeof usePlayerStore.getState>) => {
    console.log("REPEAT MODE", data.repeatMode);
    if (data.repeatMode) {
        const repeatMode: "none" | "all" | "one" = data.repeatMode as "none" | "all" | "one";
        console.log("REPEAT MODE", repeatMode);
        playerStore.toggleRepeat(repeatMode, false);
    }
};

export const onCloudState = async (data: CloudState) => {
    console.log("onCloudState", data);
    const playerStore = usePlayerStore.getState();
    const cloudStateStore = useCloudStateStore.getState();

    handleVolume(data, playerStore);
    handlePrimeDeviceId(data, cloudStateStore);
    await handleTrackChange(data, playerStore);
    handleIsPlaying(data, playerStore);
    handlePosition(data, playerStore);
    handleShuffleMode(data, playerStore);
    handleRepeatMode(data, playerStore);
};
