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
import { useOnDevicePing } from "./graphql/subscriptions/onDevicePing";
import { useDeviceHeartbeat } from "./hooks/useDeviceHeartbeat";
import { fetchCloudState } from "./graphql/queries/fetchCloudstate";
import { useOnCloudstateUpdate } from "./graphql/subscriptions/onCloudstate";
import { onCloudState } from "./lib/onCloudState";
import { onDevicePing } from "./lib/onDevicePing";


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

    useOnDevicePing({
        onData: onDevicePing,
        enabled: isLoggedIn,
    });


    useOnCloudstateUpdate({
        onData: onCloudState,
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

            onCloudState(cloudState);
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
