import type { Device } from "@/graphql/types";
import { useCloudStateStore } from "@/store/cloudstate.store";

export const onDevicePing = (device: Device) => {
    const currentDevices = useCloudStateStore.getState().devices;
    const deviceExists = currentDevices.some((d) => d.deviceId === device.deviceId);

    let newDevices;
    if (deviceExists) {
        newDevices = currentDevices.map((d) =>
            d.deviceId === device.deviceId ? { ...d, lastSeen: device.lastSeen } : d
        );
    } else {
        newDevices = [...currentDevices, device];
    }

    useCloudStateStore.getState().setDevices(newDevices);
};

