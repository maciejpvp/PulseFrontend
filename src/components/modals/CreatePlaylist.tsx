import { useState, useRef, useEffect } from "react";
import { useCreatePlaylist } from "@/graphql/mutations/useCreatePlaylist";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router";

export const CreatePlaylist = () => {
    const { createPlaylist, isLoading, error } = useCreatePlaylist();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            if (previewUrl) URL.revokeObjectURL(previewUrl);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(undefined);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleSubmit = async () => {
        try {
            const playlist = await createPlaylist({
                name: name,
                file: selectedFile
            });

            console.log("Playlist Created successfully:", playlist);
            navigate(`/playlist/${playlist.id}`);

            // Reset form
            setName("");
            setSelectedFile(undefined);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <div className="flex flex-col gap-6 py-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                    id="playlist-name"
                    type="text"
                    placeholder="Enter playlist name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-stone-900/50 border-stone-800"
                />
            </div>

            <div className="grid w-full items-center gap-1.5">
                <Label>Playlist Cover (Optional)</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer
                        w-full aspect-square max-w-[200px] mx-auto
                        rounded-md border-2 border-dashed 
                        flex flex-col items-center justify-center gap-2
                        transition-all duration-200
                        ${previewUrl ? 'border-transparent' : 'border-stone-800 hover:border-stone-600 bg-stone-900/30 hover:bg-stone-900/50'}
                    `}
                >
                    {previewUrl ? (
                        <>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-md shadow-xl"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                <ImagePlus className="w-8 h-8 text-white" />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-1 -right-1 rounded-full w-8 h-8 shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage();
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="p-4 rounded-full bg-stone-900/50 group-hover:scale-110 transition-transform">
                                <ImagePlus className="w-8 h-8 text-stone-400" />
                            </div>
                            <span className="text-sm text-stone-500 font-medium">Upload Cover</span>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
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
                disabled={isLoading || !name}
                className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Playlist...
                    </>
                ) : (
                    "Create Playlist"
                )}
            </Button>
        </div>
    );
};
