import { CreateArtist } from "@/components/modals/CreateArtist";
import { CreateAlbum } from "@/components/modals/CreateAlbum";
import { CreatePlaylist } from "@/components/modals/CreatePlaylist";
import { CreateSong } from "@/components/modals/CreateSong";

export const entityTypes = [
    { type: "artist", name: "Artist", component: CreateArtist },
    { type: "album", name: "Album", component: CreateAlbum },
    { type: "playlist", name: "Playlist", component: CreatePlaylist },
    { type: "song", name: "Song", component: CreateSong },
]