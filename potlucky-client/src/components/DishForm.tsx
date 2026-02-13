import { useForm } from "@tanstack/react-form"
import { Stack, TextInput, Select, Group, Button } from "@mantine/core"
import { z } from 'zod'
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { IconCheck, IconX } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { Category, type Dish, type PotluckProgress } from "@/types/types"
import { getCategoryEmoji } from "@/utils"


const defaultDishFormEntry: Dish = {
	attendee: '',                   // The name of the person who added the dish
	dish: '',                       // The name of the dish
	dish_category: Category.Main   // The category of the dish
}

const formSchema = z.object({
	attendee: z.string().min(2, 'Attendee name must have at least 2 characters').max(32, 'Attendee name must be at most 32 characters'),
	dish: z.string().min(1, 'Dish name must not be empty').max(32, 'Dish name must be at most 32 characters'),
	dish_category: z.enum(Category)
})


/**
 * DishForm component allows users to add a new dish to a potluck event.
 * It provides a form with fields for attendee name, dish name, and dish category.
 * The form validates input fields and submits the data to the server.
 *
 * @param {string} plid - The unique identifier for the potluck event.
 * @param {Map<Category, PotluckProgress>} categoryProgress - A map containing the progress of each dish category in the potluck.
 * @param {() => void} closeModal - A function to close the modal after successful submission.
 *
 * @returns {JSX.Element} The rendered DishForm component.
 * ```
 */
export function DishForm({ plid, categoryProgress, closeModal, }: { plid: string, categoryProgress: Map<Category, PotluckProgress>, closeModal: () => void }) {
	const queryClient = useQueryClient()

	const [isFocused, setIsFocused] = useState<Record<keyof Dish, boolean>>({
		attendee: false,
		dish: false,
		dish_category: false,
	});
	

	const generateComboBoxLabels = () => {
		const labelsList =  Array<{value: string, label: string}>()
		categoryProgress.forEach((progress, category) => {
			const numRequirementsLeft = Math.max(0, progress.numRequired - progress.numCompleted )
			const labelMessage = `${category} ${getCategoryEmoji(category)} (${progress.numRequired > 0 ? numRequirementsLeft + " left" : "optional"})`

			const label = {
				value: 	category,
				label: 	labelMessage,
			}
			labelsList.push(label)
		})

		return labelsList
	}


	const form = useForm({
		defaultValues: defaultDishFormEntry,
		onSubmit: async ({ value }) => {
			mutation.mutateAsync(value)
		},
		validators: {
			onMount: formSchema,
			onBlur: formSchema,
			onChange: formSchema
		},
	})

	const mutation = useMutation({
		mutationFn: async (dish: Dish) => {
			try {
				const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}/dish`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(dish),
				})

				if (!response.ok) {
					throw new Error('Failed to add dish to potluck')
				}
				return response.json()
			}
			catch (error) {
				throw error
			}
		},
		onSuccess: async () => {
			// Invalidate the cache key to trigger a refetch 
			// of the potluck data in the RouteComponent
			await queryClient.invalidateQueries({ queryKey: ['potluck', plid] })
			closeModal()
			notifications.show({
				title: 'Success',
				message: 'Dish added successfully',
				color: 'green',
				icon: <IconCheck />
			})
		},
		onError: () => {
			notifications.show({
				title: 'Error',
				message: 'Something went wrong while creating your potluck. Please try again.',
				color: 'red',
				icon: <IconX />,
				position: 'top-center',
				autoClose: 10000,
			})
		}
	})
	return (
		<form onSubmit={(e) => {
			e.preventDefault()
			form.handleSubmit()
		}}>
			<Stack>
				<form.Field name="attendee">
					{(field) => {
						return (
							<TextInput
								value={field.state.value}
								label="Attendee"
								onFocus={() => setIsFocused({
									attendee: true,
									dish: false,
									dish_category: false,
								})}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={() => {
									setIsFocused({
										attendee: false,
										dish: false,
										dish_category: false,
									})
									field.handleBlur()
								}}
								error={!isFocused['attendee']
									&& field.state.meta.isDirty
									&& !field.state.meta.isValid
									? field.state.meta.errors[0]?.message
									: null}
								placeholder={field.state.meta.isTouched ? undefined : 'Who is bringing the dish?'}
							/>
						)
					}}
				</form.Field>
				<form.Field name="dish">
					{(field) => {
						return (
							<TextInput
								value={field.state.value}
								label="Dish"
								onFocus={() => setIsFocused({
									attendee: false,
									dish: true,
									dish_category: false,
								})}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={() => {
									setIsFocused({
										attendee: false,
										dish: false,
										dish_category: false,
									})
									field.handleBlur()
								}}
								error={!isFocused['dish']
									&& field.state.meta.isDirty
									&& !field.state.meta.isValid
									? field.state.meta.errors[0]?.message
									: null}
								placeholder={field.state.meta.isTouched ? undefined : 'What dish is being brought?'}
							/>
						)
					}}
				</form.Field>
				<form.Field name="dish_category">
					{(field) => {
						return (
							<Select
								value={field.state.value}
								label="Dish Category"
								placeholder="What dish category is this?"
								data={generateComboBoxLabels()}
								comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
								onChange={(value) => field.handleChange(value as Dish['dish_category'])}
								onFocus={() => setIsFocused({
									attendee: false,
									dish: false,
									dish_category: true,
								})}
								onBlur={() => {
									setIsFocused({
										attendee: false,
										dish: false,
										dish_category: false,
									})
									field.handleBlur()
								}}
							/>
						)
					}}
				</form.Field>
				<form.Subscribe
					selector={(state) => [state.canSubmit]}
				>
					{([canSubmit]) => (
						<Group justify="flex-end" mt="md">
							<Button
								type="submit"
								size="md"
								fullWidth
								loading={mutation.isPending}
								disabled={!canSubmit}
							>
								Create
							</Button>
						</Group>
					)}
				</form.Subscribe>
			</Stack>
		</form>
	)
}