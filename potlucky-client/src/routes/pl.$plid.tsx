import { createFileRoute, redirect } from "@tanstack/react-router"
import { Container, Text, Paper, Stack, Divider, Group, ThemeIcon, CopyButton, Button, Flex, Modal } from "@mantine/core"
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { IconCalendar, IconClock, IconShare, IconCheck, IconPlus } from "@tabler/icons-react"
import { DishForm } from "@/components/DishForm"
import { DishCard } from "@/components/DishCard"

export const Route = createFileRoute('/pl/$plid')({
    beforeLoad: async ({ params }) => {
        const { plid } = params
        const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}`)
        if (!response.ok) {
            console.log('not ok')
            throw redirect({
                to: '/',
            })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { plid } = Route.useParams()
    const [opened, { open, close }] = useDisclosure(false);

    const potluck = useQuery({
        queryKey: ['potluck', plid], queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}`)
            return await response.json()
        },
        retry: 3,
    })
    return (
        <Container py="4xl" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.4rem' }}>
            <Modal opened={opened} onClose={close} title="Add a Dish">
                {/* Modal content will go here */}
                {/* <Text>Form to add a dish will be here.</Text>
                 */}
                <DishForm plid={plid} closeModal={close} />
            </Modal>
            <CopyButton value={typeof window !== 'undefined' ? window.location.href : ''}>
                {({ copy }) => (
                    <Button
                        color="primaryColor"
                        onClick={() => {
                            copy()
                            notifications.show({
                                title: 'Link copied!',
                                message: 'Share this link with your friends to plan dishes!',
                                color: 'teal',
                                icon: <IconCheck size={16} />,
                            })
                        }}
                        leftSection={<IconShare size={16} />}
                    >
                        Share Potluck
                    </Button>
                )}
            </CopyButton>
            <Paper w="24rem">
                <Stack gap="xl" align="center">
                    <Text
                        size="2xl"
                        fw={600}
                        c="primaryColor"
                        ta="center"
                        style={{ lineHeight: 1.1 }}
                    >
                        {potluck.data?.name}
                    </Text>

                    <Divider w="100%" label={<IconCalendar size={16} />} labelPosition="center" />


                    <Flex
                        direction={{ base: 'column', xs: 'row' }}
                        gap={{ base: 'md', xs: 'xl' }}
                        justify="flex-start"
                        align={{ base: 'flex-start', xs: 'center' }}
                    >
                        <Group>
                            <ThemeIcon size="lg" variant="light" color="primaryColor" radius="md">
                                <IconCalendar size="1.2rem" />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Date</Text>
                                <Text fw={500}>{dayjs(potluck.data?.datetime).format('MMMM D, YYYY')}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" variant="light" color="primaryColor" radius="md">
                                <IconClock size="1.2rem" />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Time</Text>
                                <Text fw={500}>{dayjs(potluck.data?.datetime).format('h:mm A')}</Text>
                            </div>
                        </Group>
                    </Flex>

                    <>
                        <Divider w="100%" my="sm" label="Information" labelPosition="center" />
                        <Container size="sm" p={0}>
                            <Text ta="center" style={{ whiteSpace: 'pre-wrap' }}>
                                {potluck.data?.information || "No additional information"}
                            </Text>
                        </Container>
                    </>
                </Stack>
            </Paper>

            <Paper w="22rem">
                <Group justify="space-between" align="center">
                    <Text
                        size="2xl"
                        c="primaryColor"
                        ta="center"
                        style={{ lineHeight: 1.1 }}
                    >
                        Dishes
                    </Text>
                    <Button onClick={open} color="primaryColor" variant="light" size="xs">
                        <IconPlus size={14} />
                    </Button>

                </Group>
                <Divider w="100%" my="sm" labelPosition="center" />
                {Object.keys(potluck.data?.dishes || {}).length > 0 ? (
                    <Stack
                        gap="sm"
                        style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            paddingRight: '0.5rem',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                        }}
                    >
                        {Object.entries(potluck.data?.dishes || {})
                            .sort(([, a]: [string, any], [, b]: [string, any]) => {
                                const order = ['main', 'side', 'dessert', 'drinks', 'other']
                                const aIndex = order.indexOf(a.dish_category?.toLowerCase())
                                const bIndex = order.indexOf(b.dish_category?.toLowerCase())
                                return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
                            })
                            .map(([dishId, dishData]: [string, any]) => (
                                <DishCard
                                    key={dishId}
                                    dish={dishData.dish}
                                    attendee={dishData.attendee}
                                    category={dishData.dish_category}
                                />
                            ))}
                    </Stack>
                ) : (
                    <Text c="dimmed" fs="italic" ta="center" size="sm">No dishes added yet. Be the first!</Text>
                )}

            </Paper>
        </Container>
    )
}
