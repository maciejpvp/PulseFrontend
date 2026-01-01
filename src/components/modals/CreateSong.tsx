import { useState, useRef } from "react";
import { useCreateSong } from "@/graphql/mutations/useCreateSong";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Music, Loader2, FileAudio, Trash2 } from "lucide-react";

interface CreateSongProps {
    artistId?: string;
    albumId?: string;
    onClose: () => void;
}

interface SongItem {
    id: string;
    file: File;
    title: string;
    duration: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
}

export const CreateSong = ({ artistId: initialArtistId, albumId: initialAlbumId, onClose }: CreateSongProps) => {
    const { createSong, error: apiError } = useCreateSong();

    const [artistId, setArtistId] = useState(initialArtistId || "");
    const [albumId, setAlbumId] = useState(initialAlbumId || "");
    const [songs, setSongs] = useState<SongItem[]>([]);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            const newSongs: SongItem[] = await Promise.all(newFiles.map(async (file) => {
                const fileName = file.name;
                const lastDotIndex = fileName.lastIndexOf('.');
                const extractedTitle = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

                // Extract duration
                const duration = await new Promise<number>((resolve) => {
                    const audio = new Audio();
                    audio.src = URL.createObjectURL(file);
                    audio.onloadedmetadata = () => {
                        resolve(Math.round(audio.duration));
                        URL.revokeObjectURL(audio.src);
                    };
                    audio.onerror = () => {
                        resolve(0);
                    };
                });

                return {
                    id: Math.random().toString(36).substring(7),
                    file,
                    title: extractedTitle,
                    duration,
                    status: 'pending'
                };
            }));

            setSongs(prev => [...prev, ...newSongs]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveSong = (id: string) => {
        setSongs(prev => prev.filter(s => s.id !== id));
    };

    const handleUpdateTitle = (id: string, newTitle: string) => {
        setSongs(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    };

    const handleSubmit = async () => {
        if (songs.length === 0 || !artistId) return;

        for (let i = 0; i < songs.length; i++) {
            if (songs[i].status === 'completed') continue;

            setUploadingIndex(i);
            setSongs(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'uploading' } : s));

            try {
                await createSong({
                    songTitle: songs[i].title,
                    artistId: artistId,
                    albumId: albumId || undefined,
                    duration: songs[i].duration,
                    file: songs[i].file
                });

                setSongs(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s));
            } catch (err) {
                console.error(`Upload failed for ${songs[i].title}`, err);
                setSongs(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error' } : s));
                // We stop on first error to let user fix it or retry
                setUploadingIndex(null);
                return;
            }
        }

        setUploadingIndex(null);
        onClose();
    };

    const processedCount = songs.filter(s => s.status === 'completed').length;
    const isUploading = uploadingIndex !== null;

    return (
        <div className="flex flex-col gap-6 py-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="artist-id">Artist ID</Label>
                <Input
                    id="artist-id"
                    type="text"
                    placeholder="Enter artist ID..."
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                    className="bg-stone-900/50 border-stone-800"
                    disabled={isUploading}
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
                    disabled={isUploading}
                />
            </div>

            <div className="grid w-full items-center gap-1.5">
                <Label>Audio Files (MP3)</Label>
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer
                        w-full h-24
                        rounded-md border-2 border-dashed 
                        flex flex-col items-center justify-center gap-2
                        transition-all duration-200
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : 'border-stone-800 hover:border-stone-600 bg-stone-900/30 hover:bg-stone-900/50'}
                    `}
                >
                    <div className="p-2 rounded-full bg-stone-900/50 group-hover:scale-110 transition-transform">
                        <Music className="w-5 h-5 text-stone-400" />
                    </div>
                    <span className="text-xs text-stone-500 font-medium">Add MP3 Files</span>
                </div>
                <input
                    type="file"
                    multiple
                    accept="audio/mpeg"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {songs.length > 0 && (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {songs.map((song) => (
                        <div key={song.id} className="flex flex-col gap-2 p-3 rounded-lg bg-stone-900/40 border border-stone-800/50">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileAudio className={`w-4 h-4 shrink-0 ${song.status === 'completed' ? 'text-green-500' : song.status === 'error' ? 'text-destructive' : 'text-stone-400'}`} />
                                    <Input
                                        value={song.title}
                                        onChange={(e) => handleUpdateTitle(song.id, e.target.value)}
                                        className="h-8 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-stone-700 p-0 text-sm font-medium"
                                        placeholder="Song title"
                                        disabled={isUploading || song.status === 'completed'}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-stone-500 tabular-nums">
                                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                    </span>
                                    {!isUploading && song.status !== 'completed' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-stone-500 hover:text-destructive"
                                            onClick={() => handleRemoveSong(song.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                    {song.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                                    {song.status === 'completed' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                    {song.status === 'error' && <div className="w-2 h-2 rounded-full bg-destructive" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isUploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-stone-400">
                        <span>Uploading songs...</span>
                        <span>{processedCount} / {songs.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(processedCount / songs.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {(apiError || songs.some(s => s.status === 'error')) && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {apiError || "Some uploads failed. Please check the list and try again."}
                </div>
            )}

            <Button
                onClick={handleSubmit}
                disabled={isUploading || songs.length === 0 || !artistId || songs.every(s => s.status === 'completed')}
                className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98]"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading ({processedCount + 1}/{songs.length})...
                    </>
                ) : (
                    songs.length > 1 ? `Create ${songs.length} Songs` : "Create Song"
                )}
            </Button>
        </div>
    );
};
