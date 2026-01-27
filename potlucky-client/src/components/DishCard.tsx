import { Paper, Group, Stack, Text } from "@mantine/core"

interface DishCardProps {
    dish: string
    attendee: string
    category: string
}

const CATEGORY_CONFIG: Record<string, { color: string; emoji: string }> = {
    main: { color: 'orange', emoji: '🍖' },
    side: { color: 'teal', emoji: '🍚' },
    dessert: { color: 'pink', emoji: '🍰' },
    drinks: { color: 'blue', emoji: '🥤' },
    other: { color: 'gray', emoji: '🍽️' }
}

export function DishCard({ dish, attendee, category }: DishCardProps) {
    const config = CATEGORY_CONFIG[category.toLowerCase()] || CATEGORY_CONFIG.other

    return (
        <Paper
            p="md"
            radius="md"
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        fw={600}
                        size="lg"
                    >
                        {dish}
                    </Text>
                    <Text size="sm" c="dimmed">
                        brought by <b>{attendee}</b>
                    </Text>
                </Stack>
                <Paper
                    px="xs"
                    py="xs"
                    radius="md"
                    style={{
                        background: `var(--mantine-color-${config.color}-light)`,
                        border: `1px solid var(--mantine-color-${config.color}-light-color)`,
                        flexShrink: 0
                    }}
                >
                    <Text
                        size="xs"
                        fw={600}
                        tt="uppercase"
                        c={config.color}
                    >
                        {category} {config.emoji}
                    </Text>
                </Paper>
            </Group>
        </Paper>
    )
}
