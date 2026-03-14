import type { Category, PotluckProgress } from "@/types/types";
import { Group, Text, Badge, Stack, Progress, CheckIcon } from "@mantine/core";


/**
 * A React component that displays progress statistics for a specific category.
 * It includes a progress bar, status badge, and other relevant details.
 *
 * @param {Category} category - The category for which progress is being tracked.
 * @param {PotluckProgress} progress - The progress data for the category, including the number of required and completed items.
 *
 * @returns {JSX.Element | null} The rendered component if the category has required items; otherwise, `null`.
 *
 * @remarks
 * - If the `numRequired` property of `progress` is `0`, the component will not render.
 * - The progress percentage is calculated as `(numCompleted / numRequired) * 100`.
 * - Displays a "done" badge if the progress is 100%, otherwise an "in progress" badge.
 * - The progress bar color changes based on the completion status.
 */
export function CategoryProgressStats({ category, progress }: { category: Category, progress: PotluckProgress }) {

	// Do not render progress stats for categories that are not required
	// Otherwise you will display an Infinite number
	if (progress.numRequired == 0 ) return null
	
	const progressPercentage = Math.min(100, (progress.numCompleted / progress.numRequired) * 100)
	const numRequirementsLeft = Math.max(0, progress.numRequired - progress.numCompleted )


	function renderStatusPill() {
		if (progressPercentage < 100) {
			return (
				<Badge variant="light" color="yellow" size="sm" styles={{ label: { textTransform: "lowercase" } }}>
					in progress
				</Badge>
			)
		}
		return (
			<Badge variant="light" color="var(--success)" size="sm" styles={{ label: { textTransform: "lowercase" } }}>
				<Group gap={4}>
					<CheckIcon size={8} /> done
				</Group>
			</Badge>
		)
	}

	return (

		<Stack bg="var(--bg-app)" p={16} bdrs="lg" gap="sm">
			<Group justify="space-between">
				<Group gap={6}>
					<Text id='emoji' size="sm"></Text>
					<Text id='progressPercent' size="sm" fw="bold">{Number.isInteger(progressPercentage) ? progressPercentage : progressPercentage.toFixed(2)}%</Text>
					<Badge id='' variant="light" color="blue" size="sm" styles={{ label: { textTransform: "lowercase" } }}>{category}</Badge>
					{renderStatusPill()}
				</Group>

				<Text size="sm" c="var(--text-dark)">{numRequirementsLeft} left</Text>
			</Group>
			<Progress value={progressPercentage} color={progressPercentage < 100 ? 'yellow' : 'var(--success)'} styles={{ section: { borderRadius: "8px" } }} />
		</Stack>
	)
}