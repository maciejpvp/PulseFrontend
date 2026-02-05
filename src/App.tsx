import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { useEffect, useMemo } from "react";

import { RootLayout } from "./layouts/RootLayout";
import { AuthLayout } from "./layouts/AuthLayout";

import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { ArtistPage } from "./pages/ArtistPage";
import { AlbumPage } from "./pages/AlbumPage";
import Login from "./pages/Login";

import { useAuthStore } from "./store/auth.store";
import "./amplify";
import { PlaylistPage } from "./pages/PlaylistPage";
import type { CloudState, Device } from "./graphql/types";
import { useOnDevicePing } from "./graphql/subscriptions/onDevicePing";
import { useCloudStateStore } from "./store/cloudstate.store";
import { useDeviceHeartbeat } from "./hooks/useDeviceHeartbeat";
import { fetchCloudState } from "./graphql/queries/fetchCloudstate";
import { usePlayerStore } from "./store/player.store";
import { useOnCloudstateUpdate } from "./graphql/subscriptions/onCloudstate";
import { getSong } from "./graphql/queries/useSong";


const publicRoutes = [
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "artist/:artistId", element: <ArtistPage /> },
            { path: "album/:artistId/:albumId", element: <AlbumPage /> },
            { path: "playlist/:playlistId", element: <PlaylistPage /> },
        ],
    },
];

const protectedRoutes = [
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: "library", element: <LibraryPage /> },
        ],
    },
];

const anonymousOnlyRoutes = [
    {
        path: "/login",
        element: <AuthLayout />,
        children: [{ index: true, element: <Login /> }],
    },
];

export const App = () => {
    useDeviceHeartbeat();
    const { isLoggedIn, checkAuth } = useAuthStore();

    const onDevicePing = (device: Device) => {
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

    useOnDevicePing({
        onData: onDevicePing,
        enabled: isLoggedIn,
    });

    const onClouseState = async (data: CloudState) => {
        console.log("onClouseState", data);
        const playerStore = usePlayerStore.getState();
        const cloudStateStore = useCloudStateStore.getState();

        if (data.volume) {
            if (data.volume === playerStore.volume) return;
            const volume = Math.min(data.volume / 100, 1);
            playerStore.setVolume(volume);
        }

        if (data.primeDeviceId) {
            if (data.primeDeviceId === cloudStateStore.primeDeviceId) return;
            cloudStateStore.setPrimeDeviceId(data.primeDeviceId);
        }

        if (data.trackId && data.trackArtistId) {
            if (data.trackId === playerStore.currentSong?.id && data.trackArtistId === playerStore.currentSong?.artist.id) return;
            console.log("SONG HERE");
            const song = await getSong(data.trackId, data.trackArtistId);
            if (!song) return;
            playerStore.setCurrentSong(song);
            playerStore.setDuration(song.duration);
        }

        if (data.isPlaying !== null) {
            if (data.isPlaying !== playerStore.isPlaying) {
                playerStore.togglePlay({ sendToCloud: false });
            }
        }

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

            // Check if its a valid number
            // if (corrected < 0 || corrected > playerStore.duration) {
            //     console.log("Invalid number");
            //     return;
            // };

            playerStore.setProgress(corrected);
        }

    }

    useOnCloudstateUpdate({
        onData: onClouseState,
        enabled: isLoggedIn,
    });

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);


    // Get Cloud State
    useEffect(() => {
        if (!isLoggedIn) return;
        (async () => {
            const cloudState = await fetchCloudState();

            if (!cloudState) return;

            onClouseState(cloudState);
        })()
    }, [isLoggedIn])

    const router = useMemo(
        () =>
            createBrowserRouter([
                ...publicRoutes,
                ...(isLoggedIn ? protectedRoutes : anonymousOnlyRoutes),

                isLoggedIn
                    ? { path: "/login", element: <Navigate to="/" replace /> }
                    : { path: "*", element: <Navigate to="/login" replace /> },
            ]),
        [isLoggedIn]
    );

    if (isLoggedIn === undefined) {
        return <div>Loading...</div>;
    }

    return <RouterProvider router={router} />;
};
