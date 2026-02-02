export type DeviceType = 'DESKTOP' | 'MOBILE';

export interface DevicePingInput {
    deviceId: string;
    name: string;
    type: DeviceType;
}

export const getDevicePingInput = (): DevicePingInput => {
    const STORAGE_KEY = 'app_device_id';

    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        // Generates a 6-character short ID like "Arch14"
        id = Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem(STORAGE_KEY, id);
    }

    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua) || window.innerWidth <= 768;

    return {
        deviceId: id,
        name: /iPhone/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : "Web Desktop",
        type: isMobile ? 'MOBILE' : 'DESKTOP'
    };
};