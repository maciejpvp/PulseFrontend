import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"
import { entityTypes } from "@/constants/entityTypes"

type Props = {
    selectedType: string
    setSelectedType: (type: string) => void

}

export const EntityTypeSelect = ({ selectedType, setSelectedType }: Props) => {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {selectedType
                        ? entityTypes.find((entityType) => entityType.type === selectedType)?.name
                        : "Select entity type..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandList>
                        <CommandEmpty>No entity type found.</CommandEmpty>
                        <CommandGroup>
                            {entityTypes.map((entityType) => (
                                <CommandItem
                                    key={entityType.type}
                                    value={entityType.type}
                                    onSelect={(currentValue) => {
                                        setSelectedType(currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {entityType.name}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            selectedType === entityType.type ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
