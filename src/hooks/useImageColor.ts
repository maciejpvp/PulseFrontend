import { useState, useEffect } from 'react';
import { FastAverageColor } from 'fast-average-color';

export const useImageColor = (imageUrl: string | null | undefined) => {
    const [color, setColor] = useState<string>('rgba(0, 0, 0, 0)');

    useEffect(() => {
        (async () => {
            if (!imageUrl) {
                setColor('rgba(0, 0, 0, 0)');
                return;
            }

            const fac = new FastAverageColor();
            fac.getColorAsync(imageUrl, { crossOrigin: 'anonymous' })
                .then((res) => {
                    setColor(res.rgba);
                })
                .catch((err) => {
                    console.error('Error extracting color:', err);
                    setColor('rgba(0, 0, 0, 0)');
                });
        })();
    }, [imageUrl]);

    return color;
};
