import { createFileRoute } from '@tanstack/react-router'
import { Container, Paper, Title, TextInput, Button, Stack, Text, Group, Select } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { IconCalendar, IconSignature, IconWorld } from '@tabler/icons-react'

export const Route = createFileRoute('/')({
  component: MainPage,
})

function MainPage() {
  const timezones = Intl.supportedValuesOf('timeZone');

  const form = useForm({
    initialValues: {
      eventName: '',
      dateTime: null as Date | null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },

    validate: {
      eventName: (value) => (value.length < 2 ? 'Event name must have at least 2 characters' : null),
      dateTime: (value) => (!value ? 'Please select a date and time' : null),
      timezone: (value) => (!value ? 'Please select a timezone' : null),
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    console.log('Creating potluck:', values)
    alert(`Success! Potluck "${values.eventName}" created for ${values.dateTime?.toLocaleString()} (${values.timezone})`)
  }

  return (
    <Container size="sm" py="2xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper p={50} radius="lg" withBorder style={{ width: '100%', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <Stack gap="lg">
          <header>
            <Title order={1} size="h2" mb="xs" ta="center">
              Potlucky
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="lg">
              Start planning your next potluck
            </Text>
          </header>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Event Name"
                placeholder='NBA Finals Watch Party'
                required
                leftSection={<IconSignature size={18} />}
                {...form.getInputProps('eventName')}
              />

              <DateTimePicker
                label="Date & Time"
                placeholder="Pick date and time"
                required
                leftSection={<IconCalendar size={18} />}
                {...form.getInputProps('dateTime')}
                clearable
                valueFormat="MM-DD-YYYY HH:mm"
              />

              <Select
                label="Timezone"
                placeholder="Select timezone"
                required
                leftSection={<IconWorld size={18} />}
                data={timezones}
                searchable
                {...form.getInputProps('timezone')}
              />

              <Group justify="flex-end" mt="md">
                <Button type="submit" size="md" fullWidth>
                  Create
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}
