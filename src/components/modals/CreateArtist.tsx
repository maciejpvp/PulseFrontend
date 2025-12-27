import { useState, useRef } from "react";
import { useCreateArtist } from "@/graphql/mutations/useCreateArtist";

export const CreateArtist = () => {
    const { createArtist, isLoading, error } = useCreateArtist();

    // 1. State for the name and the selected file
    const [name, setName] = useState("Chivas");
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

    // 2. Optional: Ref to clear the input after success
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        try {
            const artist = await createArtist({
                name: name,
                file: selectedFile
            });

            console.log("Artist Created successfully:", artist);
            alert("Artist created!");

            // Reset form
            setSelectedFile(undefined);
            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (err) {
            // Error is already handled inside the hook, but you can catch it here too
            console.error("Upload failed", err);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <label>
                Artist Name:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>

            <label>
                Profile Picture (Optional):
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </label>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button
                onClick={handleSubmit}
                disabled={isLoading || !name}
            >
                {isLoading ? "Creating..." : "Create Artist"}
            </button>
        </div>
    );
};