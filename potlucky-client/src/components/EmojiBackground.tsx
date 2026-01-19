import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode, CSSProperties } from 'react';

const GRID_SIZE = 1200;
const EMOJI_SIZE = 100;

const POTLUCK_EMOJIS = [
    '🥘', '🥗', '🥧', '🧁', '🍗', '🍷', '🥂', '🥟', '🥨', '🍪',
    '🥞', '🍳', '🌮', '🍣', '🍕', '🥙', '🥪', '🍱', '🍤', '🍲',
    '🍔', '🍟', '🌭', '🌯', '🫔', '🧆', '🍝', '🍜', '🍛', '🍱',
    '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🍦', '🍧', '🍨',
    '🍩', '🎂', '🍰', '🍫', '🍬', '🍭', '🍮', '🍯', '🥃', '🥤'
];

// Generate a repeatable pattern of emojis
const generateEmojiPattern = () => {
    const items: Array<{ emoji: string, x: number; y: number }> = [];
    const divisions = 4; // 4x4 grid for the base tile
    const cellSize = GRID_SIZE / divisions;

    for (let r = 0; r < divisions; r++) {
        for (let c = 0; c < divisions; c++) {
            let x = c * cellSize + (cellSize / 2);
            const y = r * cellSize + (cellSize / 2);

            // Stagger rows for a more organic feel
            if (r % 2 === 1) {
                x += cellSize / 2;
                if (x > GRID_SIZE) x -= GRID_SIZE;
            }

            const emoji = POTLUCK_EMOJIS[Math.floor(Math.random() * POTLUCK_EMOJIS.length)];
            items.push({ emoji, x, y });

            // Handle wrapping edges for seamless tiling
            const margin = EMOJI_SIZE;
            if (x > GRID_SIZE - margin) items.push({ emoji, x: x - GRID_SIZE, y });
            if (x < margin) items.push({ emoji, x: x + GRID_SIZE, y });
        }
    }
    return items;
};

const patternData = generateEmojiPattern();

const styles: Record<string, CSSProperties> = {
    fixedContainer: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1, // Behind everything
        backgroundColor: 'var(--mantine-color-body)',
    },
    backgroundLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundRepeat: 'repeat',
    },
    contentWrapper: {
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
    }
};

export function EmojiBackground({ children }: { children: ReactNode }) {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const displaySize = isMobile ? 500 : 800; // Scale the tile size based on screen width

    const svgItems = patternData.map((item, i) => (
        `<text 
      key="${i}" 
      x="${item.x}" 
      y="${item.y}" 
      font-size="${EMOJI_SIZE}" 
      opacity="0.08" 
      style="dominant-baseline: middle; text-anchor: middle;"
    >
      ${item.emoji}
    </text>`
    )).join('');

    const svg = `
    <svg width="${GRID_SIZE}" height="${GRID_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: system-ui, "Apple Color Emoji", "Segoe UI Emoji"; }
      </style>
      ${svgItems}
    </svg>
  `.trim().replace(/\s+/g, ' ');

    const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

    return (
        <Box>
            <div style={styles.fixedContainer}>
                <div
                    style={{
                        ...styles.backgroundLayer,
                        backgroundImage,
                        backgroundSize: `${displaySize}px ${displaySize}px`
                    }}
                />
            </div>
            <div style={styles.contentWrapper}>
                {children}
            </div>
        </Box>
    );
}
