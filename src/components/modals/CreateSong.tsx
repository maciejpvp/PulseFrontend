import { useState, useRef } from "react";
import { useCreateSong } from "@/graphql/mutations/useCreateSong";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Music, Loader2, X, FileAudio } from "lucide-react";

interface CreateSongProps {
    artistId?: string;
    albumId?: string;
    onClose: () => void;
}

export const CreateSong = ({ artistId: initialArtistId, albumId: initialAlbumId, onClose }: CreateSongProps) => {
    const { createSong, isLoading, error } = useCreateSong();

    const [title, setTitle] = useState("");
    const [artistId, setArtistId] = useState(initialArtistId || "");
    const [albumId, setAlbumId] = useState(initialAlbumId || "");
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [duration, setDuration] = useState<number>(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Extract title from filename if not already set
            if (!title) {
                const fileName = file.name;
                const lastDotIndex = fileName.lastIndexOf('.');
                const extractedTitle = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
                setTitle(extractedTitle);
            }

            // Extract duration
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => {
                setDuration(Math.round(audio.duration));
                URL.revokeObjectURL(audio.src);
            };
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(undefined);
        setDuration(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        try {
            await createSong({
                songTitle: title,
                artistId: artistId,
                albumId: albumId || undefined,
                duration: duration,
                file: selectedFile
            });

            console.log("Song uploaded successfully");

            // Reset form
            setTitle("");
            setArtistId("");
            setAlbumId("");
            setSelectedFile(undefined);
            setDuration(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onClose();
            // Optional: navigate or show success message
            // navigate(`/artist/${artistId}`); 

        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <div className="flex flex-col gap-6 py-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="song-title">Song Title</Label>
                <Input
                    id="song-title"
                    type="text"
                    placeholder="Enter song title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-stone-900/50 border-stone-800"
                />
            </div>

            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="artist-id">Artist ID</Label>
                <Input
                    id="artist-id"
                    type="text"
                    placeholder="Enter artist ID..."
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                    className="bg-stone-900/50 border-stone-800"
                />
                <p className="text-[10px] text-stone-500 px-1">
                    You can find the Artist ID in the URL of the artist's page.
                </p>
            </div>

            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="album-id">Album ID (Optional)</Label>
                <Input
                    id="album-id"
                    type="text"
                    placeholder="Enter album ID..."
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                    className="bg-stone-900/50 border-stone-800"
                />
            </div>

            <div className="grid w-full items-center gap-1.5">
                <Label>Audio File (MP3)</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer
                        w-full h-32
                        rounded-md border-2 border-dashed 
                        flex flex-col items-center justify-center gap-2
                        transition-all duration-200
                        ${selectedFile ? 'border-green-500/50 bg-green-500/5' : 'border-stone-800 hover:border-stone-600 bg-stone-900/30 hover:bg-stone-900/50'}
                    `}
                >
                    {selectedFile ? (
                        <>
                            <FileAudio className="w-8 h-8 text-green-500" />
                            <div className="flex flex-col items-center">
                                <span className="text-sm text-stone-200 font-medium truncate max-w-[250px]">
                                    {selectedFile.name}
                                </span>
                                <span className="text-xs text-stone-500">
                                    {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-1 -right-1 rounded-full w-8 h-8 shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile();
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="p-3 rounded-full bg-stone-900/50 group-hover:scale-110 transition-transform">
                                <Music className="w-6 h-6 text-stone-400" />
                            </div>
                            <span className="text-sm text-stone-500 font-medium">Upload MP3</span>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    accept="audio/mpeg"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            )}

            <Button
                onClick={handleSubmit}
                disabled={isLoading || !title || !artistId || !selectedFile}
                className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading Song...
                    </>
                ) : (
                    "Create Song"
                )}
            </Button>
        </div>
    );
};
