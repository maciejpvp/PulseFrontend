import { create } from "zustand";
import type { Device } from "../graphql/types";

type StateStore = {
    devices: Device[];
    setDevices: (devices: Device[]) => void;
}

export const usePlayerStore = create<StateStore>((set) => ({
    devices: [],
    setDevices: (devices: Device[]) => set({ devices }),
}));