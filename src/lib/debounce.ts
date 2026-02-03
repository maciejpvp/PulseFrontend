/**
 * Debounce utility.
 * @param fn The function to debounce.
 * @param delay Delay in milliseconds.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => void>(
    fn: T,
    delay: number
) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const debounced = (...args: Parameters<T>) => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = undefined;
        }, delay);
    };

    debounced.cancel = () => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }
    };

    return debounced;
};