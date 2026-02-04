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
            const volume = Math.min(data.volume / 100, 1);
            playerStore.setVolume(volume);
        }

        if (data.primeDeviceId) {
            cloudStateStore.setPrimeDeviceId(data.primeDeviceId);
        }

        if (data.trackId && data.trackArtistId) {
            const song = await getSong(data.trackId, data.trackArtistId);
            if (!song) return;
            playerStore.setCurrentSong(song);
        }

        if (data.isPlaying !== null) {
            if (data.isPlaying !== playerStore.isPlaying) {
                playerStore.togglePlay({ sendToCloud: false });
            }
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
