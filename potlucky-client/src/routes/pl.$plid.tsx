import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Container, Paper, Title, Text, Stack, Group, Badge, ThemeIcon, Loader, Center, useMantineTheme, alpha, ActionIcon, Tooltip, Modal, Button, TextInput, Select, Divider, ScrollArea, Menu } from '@mantine/core'
import { IconCalendar, IconClock, IconShare, IconCheck, IconPlus, IconDots, IconTrash } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
//TODO: REFACTOR AND BREAK INTO COMPONENTS. VIBECODED THIS PAGE MOSTLY
export const Route = createFileRoute('/pl/$plid')({
    beforeLoad: async ({ params }) => {
        const { plid } = params
        const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}`)
        if (!response.ok) {
            throw redirect({
                to: '/',
            })
        }
    },
    component: RouteComponent,
})

interface Dish {
    dishId: string
    attendee: string
    dish: string
    dish_category: 'main' | 'side' | 'dessert' | 'drinks' | 'other'
}

interface Potluck {
    potluckId: string
    name: string
    datetime: string
    timezone: string
    dishes: Record<string, Dish>
}

async function fetchPotluck(plid: string): Promise<Potluck> {
    const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}`)
    if (!response.ok) {
        throw new Error('Failed to fetch potluck')
    }
    return response.json()
}

function getCategoryColor(category: Dish['dish_category']) {
    switch (category) {
        case 'main': return 'blue'
        case 'side': return 'green'
        case 'dessert': return 'pink'
        case 'drinks': return 'cyan'
        case 'other': return 'gray'
        default: return 'gray'
    }
}

function RouteComponent() {
    const { plid } = Route.useParams()
    const theme = useMantineTheme()
    const [modalOpened, setModalOpened] = useState(false)
    const [dishName, setDishName] = useState('')
    const [attendeeName, setAttendeeName] = useState('')
    const [dishCategory, setDishCategory] = useState<string | null>('main')

    const { data, isLoading, error } = useQuery({
        queryKey: ['potluck', plid],
        queryFn: () => fetchPotluck(plid),
    })

    const handleAddDish = async () => {
        if (!dishName || !attendeeName || !dishCategory) {
            notifications.show({
                title: 'Missing information',
                message: 'Please fill in all fields',
                color: 'red',
                position: 'top-center',
                autoClose: 3000,
            })
            return
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}/dish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dish: dishName,
                    attendee: attendeeName,
                    dish_category: dishCategory,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to add dish')
            }

            notifications.show({
                title: 'Dish added!',
                message: `${dishName} has been added to the potluck`,
                color: 'green',
                icon: <IconCheck size={18} />,
                position: 'top-center',
                autoClose: 3000,
            })

            // Reset form and close modal
            setDishName('')
            setAttendeeName('')
            setDishCategory('main')
            setModalOpened(false)

            // Refresh the data
            window.location.reload()
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to add dish. Please try again.',
                color: 'red',
                position: 'top-center',
                autoClose: 3000,
            })
        }
    }

    const handleDeleteDish = async (dishId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}/dish/${dishId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete dish')
            }

            notifications.show({
                title: 'Dish removed!',
                message: 'The dish has been removed from the potluck',
                color: 'green',
                icon: <IconCheck size={18} />,
                position: 'top-center',
                autoClose: 3000,
            })

            // Refresh the data
            window.location.reload()
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete dish. Please try again.',
                color: 'red',
                position: 'top-center',
                autoClose: 3000,
            })
        }
    }

    if (isLoading) {
        return (
            <Container size="sm" py="2xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size="xl" />
            </Container>
        )
    }

    if (error || !data) {
        return (
            <Container size="sm" py="2xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <Paper
                    p="xl"
                    radius="lg"
                    withBorder
                    style={{
                        width: '100%',
                        backdropFilter: 'blur(8px)',
                        backgroundColor: alpha(theme.white, 0.05),
                        borderColor: alpha(theme.white, 0.1)
                    }}
                >
                    <Text c="red" ta="center">Error loading potluck details.</Text>
                </Paper>
            </Container>
        )
    }

    const formattedDate = data.datetime
        ? dayjs(data.datetime).tz(data.timezone).format('dddd, MMMM Do YYYY')
        : 'Date not set'

    const formattedTime = data.datetime
        ? dayjs(data.datetime).tz(data.timezone).format('h:mm A')
        : ''

    const categoryOrder: Dish['dish_category'][] = ['main', 'side', 'dessert', 'drinks', 'other']

    const dishesList: Dish[] = data.dishes
        ? Object.entries(data.dishes)
            .map(([dishId, dish]) => ({ ...dish, dishId }))
            .sort((a, b) => {
                const aIndex = categoryOrder.indexOf(a.dish_category)
                const bIndex = categoryOrder.indexOf(b.dish_category)
                return aIndex - bIndex
            })
        : []

    return (
        <Container size="md" py="2xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Stack gap="md" style={{ width: '100%' }}>
                <Group justify="center" gap="xs">
                    <Text size="sm" fw={600}>Share this potluck with your friends</Text>
                    <Tooltip label="Share link" position="bottom">
                        <ActionIcon
                            variant="filled"
                            color="blue"
                            size="sm"
                            onClick={async () => {
                                const url = window.location.href

                                try {
                                    // Try native share first (mobile)
                                    if (navigator.share) {
                                        await navigator.share({
                                            title: data.name,
                                            text: `Join my potluck: ${data.name}`,
                                            url: url
                                        })
                                    } else {
                                        // Fallback to clipboard (desktop)
                                        await navigator.clipboard.writeText(url)
                                        notifications.show({
                                            title: 'Link copied!',
                                            message: 'The potluck link has been copied to your clipboard',
                                            color: 'green',
                                            icon: <IconCheck size={18} />,
                                            position: 'top-center',
                                            autoClose: 3000,
                                        })
                                    }
                                } catch (error) {
                                    // Handle errors (user cancelled share, etc.)
                                    console.error('Share failed:', error)
                                }
                            }}
                        >
                            <IconShare size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                <Paper
                    p="xl"
                    radius="lg"
                    withBorder
                    style={{
                        width: '100%',
                        backdropFilter: 'blur(8px)',
                        backgroundColor: alpha(theme.white, 0.08),
                        borderColor: alpha(theme.white, 0.12),
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Stack gap="lg" style={{ flex: 1, minHeight: 0 }}>
                        <header>
                            <Title order={1} size="h2" mb="lg" ta="center">{data.name}</Title>

                            <Center>
                                <Paper
                                    p="xs"
                                    px="lg"
                                    radius="md"
                                    withBorder
                                    style={{
                                        backgroundColor: alpha(theme.white, 0.05),
                                        borderColor: alpha(theme.white, 0.1)
                                    }}
                                >
                                    <Group gap="xl" justify="center">
                                        <Group gap="xs" align="center" wrap="nowrap">
                                            <ThemeIcon color="blue" variant="light" size="md" radius="xl">
                                                <IconCalendar size={16} />
                                            </ThemeIcon>
                                            <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>{formattedDate}</Text>
                                        </Group>

                                        <Group gap="xs" align="center" wrap="nowrap">
                                            <ThemeIcon color="orange" variant="light" size="md" radius="xl">
                                                <IconClock size={16} />
                                            </ThemeIcon>
                                            <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                                                {formattedTime} <Text span size="xs" c="dimmed">({data.timezone})</Text>
                                            </Text>
                                        </Group>
                                    </Group>
                                </Paper>
                            </Center>
                        </header>

                        <Divider
                            my="md"
                            size="sm"
                            style={{
                                borderColor: alpha(theme.white, 0.15)
                            }}
                        />

                        <Paper
                            p="lg"
                            radius="md"
                            style={{
                                backgroundColor: alpha(theme.white, 0.02),
                                border: `1px solid ${alpha(theme.white, 0.08)}`,
                                maxHeight: '500px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <Group justify="space-between" align="center" mb="lg">
                                <Title order={2} size="h3">Dishes</Title>
                                <ActionIcon
                                    variant="filled"
                                    color="blue"
                                    size="lg"
                                    onClick={() => setModalOpened(true)}
                                >
                                    <IconPlus size={20} />
                                </ActionIcon>
                            </Group>

                            <Modal
                                opened={modalOpened}
                                onClose={() => setModalOpened(false)}
                                title="Add a Dish"
                                centered
                            >
                                <Stack gap="md">
                                    <TextInput
                                        label="Dish Name"
                                        placeholder="e.g., Mac and Cheese"
                                        value={dishName}
                                        onChange={(e) => setDishName(e.target.value)}
                                        required
                                    />
                                    <TextInput
                                        label="Guest Name"
                                        placeholder="e.g., John"
                                        value={attendeeName}
                                        onChange={(e) => setAttendeeName(e.target.value)}
                                        required
                                    />
                                    <Select
                                        label="Category"
                                        placeholder="Select category"
                                        value={dishCategory}
                                        onChange={setDishCategory}
                                        data={[
                                            { value: 'main', label: 'Main' },
                                            { value: 'side', label: 'Side' },
                                            { value: 'dessert', label: 'Dessert' },
                                            { value: 'drinks', label: 'Drinks' },
                                            { value: 'other', label: 'Other' },
                                        ]}
                                        required
                                    />
                                    <Group justify="flex-end" mt="md">
                                        <Button variant="subtle" onClick={() => setModalOpened(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddDish}>
                                            Add Dish
                                        </Button>
                                    </Group>
                                </Stack>
                            </Modal>

                            {dishesList.length === 0 ? (
                                <Text c="dimmed" ta="center" fs="italic" size="sm">No dishes have been added yet.</Text>
                            ) : (
                                <ScrollArea h={350} type="auto">
                                    <Stack gap="md" pr="sm">
                                        {dishesList.map((dish) => (
                                            <Paper
                                                key={dish.dishId}
                                                p="md"
                                                radius="md"
                                                style={{
                                                    backgroundColor: alpha(theme.white, 0.08)
                                                }}
                                            >
                                                <Group justify="space-between" align="center" wrap="nowrap">
                                                    <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
                                                        <Badge
                                                            color={getCategoryColor(dish.dish_category)}
                                                            variant="light"
                                                            size="lg"
                                                            style={{ minWidth: '80px', textAlign: 'center' }}
                                                        >
                                                            {dish.dish_category}
                                                        </Badge>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <Text fw={500} size="sm">{dish.dish}</Text>
                                                            <Text size="xs" c="dimmed">Brought by {dish.attendee}</Text>
                                                        </div>
                                                    </Group>
                                                    <Menu position="bottom-end" shadow="md">
                                                        <Menu.Target>
                                                            <ActionIcon
                                                                variant="subtle"
                                                                color="gray"
                                                                size="sm"
                                                            >
                                                                <IconDots size={16} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                color="red"
                                                                leftSection={<IconTrash size={14} />}
                                                                onClick={() => handleDeleteDish(dish.dishId)}
                                                            >
                                                                Delete
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </ScrollArea>
                            )}
                        </Paper>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    )
}
