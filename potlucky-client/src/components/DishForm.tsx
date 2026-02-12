import { useForm } from "@tanstack/react-form"
import { Stack, TextInput, Select, Group, Button } from "@mantine/core"
import { z } from 'zod'
import { useQueryClient } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { IconCheck, IconX } from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { Category, type Dish, type DishEntry } from "@/types/types"

const defaultDishFormEntry: Dish = {
	dish: '',                       // The name of the dish
	dish_category: Category.Main   // The category of the dish
}

const formSchema = z.object({
	dish: z.string().min(1, 'Dish name must not be empty').max(32, 'Dish name must be at most 32 characters'),
	dish_category: z.enum(Category)
})

/**
 * DishForm contains the HTML form used to create a new dish with a dish name, attendee, and category.
 * Once submitted, the component will invalidate the TanStack query keys to refresh the potluck
 * data in the application UI and display appropriate success/error messages.
 * 
 * @param plid the UUID of the potluck event
 */
export function DishForm({ plid, closeModal, attendee }: { plid: string, closeModal: () => void, attendee: string }) {
	const queryClient = useQueryClient()

	const form = useForm({
		defaultValues: defaultDishFormEntry,
		onSubmit: async ({ value }) => {
			mutation.mutateAsync({ ...value, attendee })
		},
		validators: {
			onMount: formSchema,
			onChange: formSchema
		},
	})

	const mutation = useMutation({
		mutationFn: async (dish: DishEntry) => {
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
				{/* <form.Field name="attendee">
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
				</form.Field> */}
				<form.Field name="dish">
					{(field) => {
						return (
							<TextInput
								value={field.state.value}
								label="Dish"
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								error={field.state.meta.isDirty
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
								data={[
									{ value: Category.Main, label: 'Main 🍖' },
									{ value: Category.Side, label: 'Side 🍚' },
									{ value: Category.Dessert, label: 'Dessert 🍰' },
									{ value: Category.Drinks, label: 'Drinks 🥤' },
									{ value: Category.Other, label: 'Other 🍽️' },
								]}
								onChange={(value) => field.handleChange(value as Dish['dish_category'])}
								onBlur={field.handleBlur}
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