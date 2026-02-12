import { useForm } from "@tanstack/react-form"
import { Stack, TextInput, Select, Group, Button, Text } from "@mantine/core"
import { z } from 'zod'


const defaultAttendeeFormEntry = {
	attendee: '',                   
}

const formSchema = z.object({
	attendee: z.string().min(2, 'Attendee name must have at least 2 characters').max(32, 'Attendee name must be at most 32 characters'),
})

/**
 * AttendeeForm contains the HTML form used to create a new attendee with a name.
 * Once submitted, the component will invalidate the TanStack query keys to refresh the potluck
 * data in the application UI and display appropriate success/error messages.
 * 
 * @param plid the UUID of the potluck event
 */
export function AttendeeForm({ closeModal, setCurrentAttendee }: { closeModal: () => void, setCurrentAttendee: React.Dispatch<React.SetStateAction<string | null>> }) {
	const form = useForm({
		defaultValues: defaultAttendeeFormEntry,
		onSubmit: ({ value }) => {
            setCurrentAttendee(value.attendee)
            closeModal()
		},
		validators: {
			onMount: formSchema,
			onChange: formSchema
		},
	})

	return (
		<form onSubmit={(e) => {
			e.preventDefault()
			form.handleSubmit()
		}}>
			<Stack>
                <Text c="dimmed" size="sm">
                    Sign in with your name to join the potluck
                </Text>
				<form.Field name="attendee">
					{(field) => {
						return (
							<TextInput
								value={field.state.value}
                                autoComplete="off"
								label="Attendee"
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								error={
									field.state.meta.isBlurred &&
									field.state.meta.errors.length > 0
										? field.state.meta.errors[0]?.message
										: null}
								placeholder={field.state.meta.isTouched ? undefined : 'Who is bringing the dish?'}
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
								disabled={!canSubmit}
							>
								Sign In
							</Button>
						</Group>
					)}
				</form.Subscribe>
			</Stack>
		</form>
	)
}