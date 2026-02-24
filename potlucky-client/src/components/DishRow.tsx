import { type DishEntry } from "@/types/types"
import { Paper, Group, Stack, Text } from "@mantine/core"

export const CATEGORY_CONFIG: Record<string, { color: string; emoji: string }> = {
	main: { color: 'orange', emoji: '🍖' },
	side: { color: 'teal', emoji: '🍚' },
	dessert: { color: 'pink', emoji: '🍰' },
	drinks: { color: 'blue', emoji: '🥤' },
	other: { color: 'gray', emoji: '🍽️' }
}

/**
 * A functional component that renders a row displaying information about a dish,
 * including its name, the attendee who brought it, and its category with a corresponding
 * color-coded label and emoji.
 *
 * @param {string} dish - The name of the dish.
 * @param {string} attendee - The name of the attendee who brought the dish.
 * @param {string} dish_category - The category of the dish, used to determine the label's color and emoji.
 */
export function DishRow({ dish, dish_category, attendee }: DishEntry) {
	const config = CATEGORY_CONFIG[dish_category.toLowerCase()] || CATEGORY_CONFIG.other

	return (
		<Paper
			p="md"
			radius="md"
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
						{dish_category} {config.emoji}
					</Text>
				</Paper>
			</Group>
		</Paper>
	)
}
