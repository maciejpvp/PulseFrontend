import { cva } from "class-variance-authority";

export const containerVariants = cva(
    "group cursor-pointer transition-all",
    {
        variants: {
            viewType: {
                Box: "w-full flex flex-row items-center gap-3 p-2 hover:bg-white/5 rounded-md md:flex-col md:p-0 md:hover:bg-transparent md:rounded-none bg-stone-900 md:bg-transparent",
                List: "w-full flex flex-row items-center gap-3 p-2 hover:bg-white/5 rounded-md bg-stone-800 md:bg-transparent"
            },
            size: {
                sm: "",
                md: "",
                lg: ""
            }
        },
        compoundVariants: [
            {
                viewType: "Box",
                size: "sm",
                className: "md:w-32"
            },
            {
                viewType: "Box",
                size: "md",
                className: "md:w-40"
            },
            {
                viewType: "Box",
                size: "lg",
                className: "md:w-48"
            }
        ],
        defaultVariants: {
            viewType: "Box",
            size: "md"
        }
    }
);

export const imageContainerVariants = cva(
    "bg-stone-800 rounded-md flex items-center justify-center group-hover:bg-stone-700 transition-colors overflow-hidden shrink-0",
    {
        variants: {
            viewType: {
                Box: "w-12 h-12 md:mb-3",
                List: "w-12 h-12"
            },
            size: {
                sm: "",
                md: "",
                lg: ""
            }
        },
        compoundVariants: [
            {
                viewType: "Box",
                size: "sm",
                className: "md:w-32 md:h-32"
            },
            {
                viewType: "Box",
                size: "md",
                className: "md:w-40 md:h-40"
            },
            {
                viewType: "Box",
                size: "lg",
                className: "md:w-48 md:h-48"
            }
        ]
    }
);

export const iconVariants = cva(
    "text-stone-600 group-hover:text-stone-500 transition-colors",
    {
        variants: {
            viewType: {
                Box: "w-6 h-6",
                List: "w-6 h-6"
            },
            size: {
                sm: "",
                md: "",
                lg: ""
            }
        },
        compoundVariants: [
            {
                viewType: "Box",
                size: "sm",
                className: "md:w-16 md:h-16"
            },
            {
                viewType: "Box",
                size: "md",
                className: "md:w-20 md:h-20"
            },
            {
                viewType: "Box",
                size: "lg",
                className: "md:w-24 md:h-24"
            }
        ]
    }
);

export const textVariants = cva(
    "font-medium text-stone-200 truncate group-hover:text-white transition-colors",
    {
        variants: {
            viewType: {
                Box: "text-sm md:w-full",
                List: "text-sm flex-1"
            },
            size: {
                sm: "md:text-sm",
                md: "md:text-base",
                lg: "md:text-lg"
            }
        }
    }
);
