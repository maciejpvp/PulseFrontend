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

export const CreateModal = () => {
    const [selectedType, setSelectedType] = useState(entityTypes[0].type)

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full w-10 h-10"><Plus /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create {entityTypes.find((type) => type.type === selectedType)?.name}</DialogTitle>
                </DialogHeader>
                <EntityTypeSelect selectedType={selectedType} setSelectedType={setSelectedType} />
                {entityTypes.find((type) => type.type === selectedType)?.component}
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
