import { type Dish } from "@/types/types"
import { Paper, Group, Stack, Text } from "@mantine/core"

export const CATEGORY_CONFIG: Record<string, { color: string; emoji: string }> = {
	main: { color: 'orange', emoji: '🍖' },
	side: { color: 'teal', emoji: '🍚' },
	dessert: { color: 'pink', emoji: '🍰' },
	drinks: { color: 'blue', emoji: '🥤' },
	other: { color: 'gray', emoji: '🍽️' }
}

/**
 * DishRow represents an entry in a dish table view. It displays a dish's 
 * name, attendee, and category. Dishes can be deleted only by the attendee
 * who create it.
 */
export function DishRow({ dish, attendee, dish_category }: Dish) {
	const config = CATEGORY_CONFIG[dish_category.toLowerCase()] || CATEGORY_CONFIG.other

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
						{dish_category} {config.emoji}
					</Text>
				</Paper>
			</Group>
		</Paper>
	)
}
