import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Container, Paper, Title, TextInput, Button, Stack, Text, Group, Select, Box } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { formOptions, useForm } from '@tanstack/react-form'
import { IconCalendar, IconSignature, IconWorld, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  component: MainPage,
})

interface PotluckFormEntry {
  name: string
  datetime: string
  timezone: string
}

const defaultPotluckFormEntry: PotluckFormEntry = {
  name: '',
  datetime: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}

const formSchema = z.object({
  name: z.string().min(4, 'Event name must have at least 4 characters').max(128, 'Event name must be at most 64 characters'),
  datetime: z.string().min(1, 'Date and time is required'),
  timezone: z.string().refine((val) => Intl.supportedValuesOf('timeZone').includes(val), 'Invalid timezone')
})

const formOpts = formOptions({
  defaultValues: defaultPotluckFormEntry,
  validators: {
    onBlur: formSchema
  },
})

function MainPage() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (values: PotluckFormEntry) => {
      try {
        const payload = {
          name: values.name,
          datetime: values.datetime ? dayjs(values.datetime).toISOString() : '',
          timezone: values.timezone,
        }

        //fake delay for testing
        await new Promise((resolve) => setTimeout(resolve, 5000))
        const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Failed to create potluck')
        }

        return response.json()

      }
      catch (error) {
        throw error
      }
    },
    onSuccess: (data) => {
      navigate({
        to: '/pl/$plid',
        params: {
          plid: data.potluckId,
        },
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
  
  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      mutation.mutateAsync(value)
    },
  })

  return (
    <Container style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid red' }}>
      
      <Paper>
          <header>
            <Text size="xl" ta="center" mb="lg" fw="bold" >
               Start planning your next potluck!
            </Text>
          </header>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <Stack>
              <form.Field
                name="name"
                children={(field) => {
                    return (
                  <TextInput
                    label="Event Name"
                    placeholder={field.state.meta.isTouched ? undefined : 'Board Game Night'}
                    leftSection={<IconSignature size={18} />}
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )
                 

                }}
              />

              

              {/* <form.Field
                name="datetime"
                children={(field) => {
                  return (<DateTimePicker
                    label="Date & Time"
                    leftSection={<IconCalendar size={18} />}
                    valueFormat="MM/DD/YYYY HH:mm A"
                    timePickerProps={{
                      withDropdown: true,
                      popoverProps: { withinPortal: false },
                      format: '12h',
                    }}
                    placeholder="Pick a date and time"
                    required
                    value={field.state.value && field.state.value !== '' ? new Date(field.state.value) : null}
                    onBlur={field.handleBlur}
                    onChange={(date) => field.handleChange(date ? dayjs(date).toISOString() : '')}
                  />)

                }}
              /> */}
              {/* <form.Field
                name="timezone"
              >
                {(field) => (
                  <Select
                    label="Timezone"
                    placeholder="Select your timezone"
                    leftSection={<IconWorld size={18} />}
                    required
                    data={Intl.supportedValuesOf('timeZone')}
                    searchable
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(val) => field.handleChange(val || '')}
                  />
                )}
              </form.Field> */}
              

              {/* <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Group justify="flex-end" mt="md">
                    <Button
                      type="submit"
                      size="md"
                      fullWidth
                      loading={isSubmitting}
                      disabled={!canSubmit}
                    >
                      Create
                    </Button>
                  </Group>
                )}
              </form.Subscribe> */}
            </Stack>
 
          </form>


      </Paper>
    </Container>
    // <Container strategy="grid" size={500} style={{ border: '1px solid red' }}>
    //   <Box bg="var(--mantine-color-indigo-light)" h={50}>
    //     Main content
    //   </Box>

    //   <Box data-breakout bg="var(--mantine-color-indigo-light)" mt="xs">
    //     <div>Breakout</div>

    //     <Box data-container bg="indigo" c="white" h={50}>
    //       <div>Container inside breakout</div>
    //     </Box>
    //   </Box>
    // </Container>
  )
}
