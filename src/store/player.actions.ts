import { useCloudStateStore } from "./cloudstate.store";
import { getDevicePingInput } from "@/lib/getDevicePingInput";
import { debouncedUpdateIsPlaying } from "@/graphql/mutations/CloudStateMutations/updateIsPlaying";
import { playSongMutation } from "@/graphql/mutations/useSongPlay";
import type { PlayerStore } from "./player.store";

type GetState = () => PlayerStore;
type SetState = (partial: PlayerStore | Partial<PlayerStore> | ((state: PlayerStore) => PlayerStore | Partial<PlayerStore>), replace?: false) => void;

interface ToggleOptions {
    sendToCloud?: boolean;
    mode?: "ON" | "OFF";
}

const FADE_DURATION = 200;
const FADE_STEPS = 10;
const STEP_TIME = FADE_DURATION / FADE_STEPS;

const fadeAudio = async (
    audio: HTMLAudioElement,
    startVol: number,
    endVol: number
) => {
    const volumeStep = (endVol - startVol) / FADE_STEPS;

    for (let i = 1; i <= FADE_STEPS; i++) {
        await new Promise((resolve) => setTimeout(resolve, STEP_TIME));
        const newVol = startVol + (volumeStep * i);
        // Ensure bounds
        audio.volume = Math.max(0, Math.min(1, newVol));
    }
    audio.volume = endVol;
};

const handleStop = async (
    get: GetState,
    set: SetState,
    audio: HTMLAudioElement,
    sendToCloud: boolean,
    shouldPlay: boolean
) => {
    const { volume, progress } = get();

    // Fade out if playing sound
    if (audio.volume > 0) {
        await fadeAudio(audio, audio.volume, 0);
    }

    audio.pause();
    set({ isPlaying: false });

    if (sendToCloud) {
        debouncedUpdateIsPlaying(false, progress);
    }

    // Restore volume for next time
    audio.volume = shouldPlay ? volume : 0;
};

const handleStart = async (
    get: GetState,
    set: SetState,
    audio: HTMLAudioElement,
    sendToCloud: boolean,
    shouldPlay: boolean
) => {
    const { volume, progress } = get();

    // Start silent
    audio.volume = 0;
    set({ isPlaying: true });

    if (sendToCloud) {
        debouncedUpdateIsPlaying(true, progress);
    }

    audio.play().catch(console.error);

    // Fade in if we should play sound
    if (shouldPlay) {
        await fadeAudio(audio, 0, volume);
    } else {
        audio.volume = 0;
    }
};

export const togglePlayAction = async (
    get: GetState,
    set: SetState,
    options?: ToggleOptions
) => {
    const { isPlaying, currentSong, playSong } = get();
    const sendToCloud = options?.sendToCloud ?? true;

    // Refresh audio reference
    let audio = get().audio;

    if (!currentSong) return;

    // Initialize audio if needed
    if (!audio?.src) {
        try {
            const url = await playSongMutation({
                input: {
                    songId: currentSong.id,
                    artistId: currentSong.artist.id,
                    contextId: currentSong.id, // Fallback context
                    contextType: "SONG"
                }
            });
            // We use the store's playSong to setup everything, 
            // but we need to pass basic context params. 
            // In the original code these were pulled from currentSong for contextId/Type if not present?
            // Actually original code used currentSong.id and "SONG" literal.
            playSong(currentSong, url, currentSong.id, "SONG", currentSong.id, []);
            audio = get().audio;
        } catch (e) {
            console.error("Failed to init audio in togglePlay:", e);
            return;
        }
    }

    if (!audio?.src) return;

    // Sync position
    // console.log("Progress:", progress);
    // updatePositionMs(progress);

    const { primeDeviceId } = useCloudStateStore.getState();
    const { deviceId: localDeviceId } = getDevicePingInput();
    const shouldPlay = primeDeviceId === localDeviceId;

    if (isPlaying) {
        await handleStop(get, set, audio, sendToCloud, shouldPlay);
    } else {
        await handleStart(get, set, audio, sendToCloud, shouldPlay);
    }
};
