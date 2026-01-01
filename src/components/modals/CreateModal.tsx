import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from 'lucide-react'
import { EntityTypeSelect } from "./EntityTypeSelect"
import { useState } from "react"
import { entityTypes } from "@/constants/entityTypes"

type PageData = {
    defaultSelectedType: "album" | "song" | undefined;
    albumId?: string;
    artistId?: string;
}

export const CreateModal = () => {
    const [open, setOpen] = useState(false)
    const [pageData, setPageData] = useState<PageData>({
        defaultSelectedType: undefined,
        albumId: undefined,
        artistId: undefined
    })
    const [selectedType, setSelectedType] = useState(entityTypes[0].type)

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen) {
            const data = onWhatPage()
            setPageData(data)
            setSelectedType(data?.defaultSelectedType || entityTypes[0].type)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setSelectedType(entityTypes[0].type)
    }

    // Check on which path user is to determinate default selected type and pre-configure values

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full w-10 h-10 bg-stone-900"><Plus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create {entityTypes.find((type) => type.type === selectedType)?.name}</DialogTitle>
                </DialogHeader>
                <EntityTypeSelect selectedType={selectedType} setSelectedType={setSelectedType} />
                {(() => {
                    const TypeComponent = entityTypes.find((type) => type.type === selectedType)?.component;
                    return TypeComponent ? <TypeComponent onClose={handleClose} artistId={pageData?.artistId} albumId={pageData?.albumId} /> : null;
                })()}
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function onWhatPage(): PageData {
    const path = window.location.pathname

    if (path.startsWith("/album")) {
        const albumId = path.split("/")[3]
        const artistId = path.split("/")[2]
        return {
            defaultSelectedType: "song",
            albumId,
            artistId
        }
    }
    if (path.startsWith("/artist")) {
        const artistId = path.split("/")[2]
        return {
            defaultSelectedType: "album",
            artistId
        }
    }
    return {
        defaultSelectedType: undefined,
    }
}