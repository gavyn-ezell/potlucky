import { Box, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode } from 'react';

const GRID_SIZE = 1200;
const EMOJI_SIZE = 100;

const POTLUCK_EMOJIS = [
    '🥘', '🥗', '🥧', '🧁', '🍗', '🍷', '🥂', '🥟', '🥨', '🍪',
    '🥞', '🍳', '🌮', '🍣', '🍕', '🥙', '🥪', '🍱', '🍤', '🍲',
    '🍔', '🍟', '🌭', '🌯', '🫔', '🧆', '🍝', '🍜', '🍛', '🍱',
    '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🍦', '🍧', '🍨',
    '🍩', '🎂', '🍰', '🍫', '🍬', '🍭', '🍮', '🍯', '🥃', '🥤'
];

const generateEmojiPattern = () => {
    const items: Array<{ emoji: string, x: number; y: number }> = [];
    const divisions = 4;
    const cellSize = GRID_SIZE / divisions;

    for (let r = 0; r < divisions; r++) {
        for (let c = 0; c < divisions; c++) {
            let x = c * cellSize + (cellSize / 2);
            const y = r * cellSize + (cellSize / 2);

            if (r % 2 === 1) {
                x += cellSize / 2;
                if (x > GRID_SIZE) x -= GRID_SIZE;
            }

            const emoji = POTLUCK_EMOJIS[Math.floor(Math.random() * POTLUCK_EMOJIS.length)];
            items.push({ emoji, x, y });

            const margin = EMOJI_SIZE;
            if (x > GRID_SIZE - margin) items.push({ emoji, x: x - GRID_SIZE, y });
            if (x < margin) items.push({ emoji, x: x + GRID_SIZE, y });
        }
    }
    return items;
};

const patternData = generateEmojiPattern();

const svgItems = patternData.map((item) =>
    `<text x="${item.x}" y="${item.y}" font-size="${EMOJI_SIZE}" opacity="0.08" style="dominant-baseline: middle; text-anchor: middle;">${item.emoji}</text>`
).join('');

const svg = `<svg width="${GRID_SIZE}" height="${GRID_SIZE}" xmlns="http://www.w3.org/2000/svg"><style>text { font-family: system-ui, "Apple Color Emoji", "Segoe UI Emoji"; }</style>${svgItems}</svg>`.replace(/\s+/g, ' ');

const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export function EmojiBackground({ children }: { children: ReactNode }) {
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    const tileSize = isMobile ? 800 : 1200;

    return (
        <>
            <Box
                pos="fixed"
                top={0}
                left={0}
                w="100%"
                h="100%"
                style={{
                    backgroundImage,
                    backgroundColor: "var(--bg-app)",
                    backgroundRepeat: 'repeat',
                    backgroundSize: `${tileSize}px ${tileSize}px`,
                    backgroundPosition: '0 0',
                    zIndex: -1,
                    pointerEvents: 'none',
                }}
            />
            <Box pos="relative" style={{ minHeight: '100vh' }}>
                {children}
            </Box>
        </>
    );
}