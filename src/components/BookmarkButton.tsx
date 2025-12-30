import { useBookmark } from '@/graphql/mutations/useBookmark';
import { Heart } from 'lucide-react';
import type { ContextType } from '@/graphql/types';
import { cn } from '@/lib/utils';
import { useOptimistic, useTransition, useState, useEffect } from 'react';

interface BookmarkButtonProps {
    itemId: string;
    itemType: ContextType;
    artistId?: string;
    className?: string;
    defaultState?: boolean;
}

export const BookmarkButton = ({ itemId, itemType, artistId, className, defaultState = false }: BookmarkButtonProps) => {
    const { addBookmark, removeBookmark } = useBookmark();
    const [isPending, startTransition] = useTransition();

    const [isBookmarked, setIsBookmarked] = useState(defaultState);

    useEffect(() => {
        setIsBookmarked(defaultState);
    }, [defaultState]);

    const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
        isBookmarked,
        (_, newState: boolean) => newState
    );

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPending) return;

        const nextState = !isBookmarked;

        startTransition(async () => {
            setOptimisticBookmarked(nextState);

            try {
                let success = false;
                if (isBookmarked) {
                    success = await removeBookmark([itemId]);
                } else {
                    success = await addBookmark([{ itemId, itemType, artistId }]);
                }

                if (!success) {
                    throw new Error("Mutation returned false");
                }

                setIsBookmarked(nextState);
            } catch (error) {
                console.error("Failed to toggle bookmark:", error);
                throw error;
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50",
                optimisticBookmarked ? "text-red-500" : "text-stone-400 hover:text-stone-200",
                className
            )}
            title={optimisticBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
            <Heart
                className={cn(
                    "w-6 h-6 transition-colors duration-200",
                    optimisticBookmarked && "fill-current"
                )}
            />
        </button>
    );
};