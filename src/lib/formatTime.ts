export const formatTime = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${minutes}:${formattedSeconds}`;
}