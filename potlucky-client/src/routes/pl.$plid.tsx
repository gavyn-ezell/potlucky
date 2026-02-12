import { createFileRoute, redirect } from "@tanstack/react-router"
import { Container, Text, Stack, Group, CopyButton, Button, Flex, Modal, Grid, Card, RingProgress, Table, Tabs, Accordion, UnstyledButton, Avatar, Tooltip, Spoiler, Skeleton, LoadingOverlay, Transition, AvatarGroup, Image } from "@mantine/core"
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { IconCheck, IconUsers, IconTrash, IconArrowsDiagonalMinimize, IconEyeOff } from "@tabler/icons-react"
import { DishForm } from "@/components/DishForm"
import type { PotluckDataResponse } from "@/types/types"
import { useEffect, useMemo, useState } from "react"
import "../styles.css";
import { AttendeeForm } from "@/components/AttendeeForm"

/**
 * createFileRoute fetches the data from the API before the route 
 * component is rendered as a sanity check. If the request is not 
 * successful, the user is redirected back to the home page.
 */
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

/**
 * ExtractAttendees parses a list of potluck dishes and returns an array
 * of unique attendee names. If the potluck data is undefined, the method
 * returns an empty array.
 * @param data 
 */
function ExtractAttendees(data: PotluckDataResponse | undefined): string[] {
	var uniqueAttendees = new Set<string>();
	if (data == undefined) {
		return [];
	}

	var uniqueAttendees = new Set<string>();
	Object.values(data.dishes).forEach((dish) => {
		uniqueAttendees.add(dish.attendee);
	})

	return Array.from(uniqueAttendees);
}

/**
 * RouteComponent contains the user interface for displaying and mutating
 * potluck information. It uses a TanStack Query that automatically fetches the 
 * potluck data when the component is mounted. A caching mechanism is built-in
 * so that subsequent requests for the same data are pulled from a cache instead
 * of the API endpoint. If the route parameter changes, or the query key is invalidated,
 * or the cache becomes stale, the component will make a new request to the API.
 * @returns 
 */
function RouteComponent() {
	const [currentAttendee, setCurrentAttendee] = useState<string | null>(null);
	const [attendeesExpanded, setAttendeesExpanded] = useState<boolean>(false);
	const [viewableAttendees, setViewableAttendees] = useState<string[]>([]);
	const { plid } = Route.useParams()
	const [opened, { open, close }] = useDisclosure(false);
	const [activeTab, setActiveTab] = useState<string | null>('1');

	// TanStack Query to get potluck data
	const { isLoading, data: potluck } = useQuery({
		queryKey: ['potluck', plid], queryFn: async (): Promise<PotluckDataResponse> => {
			const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}`)
			return await response.json()
		},
		retry: 3,
	})


	// Get all unique attendees
	const attendeeNames = useMemo(()=>ExtractAttendees(potluck), [potluck]);
	useEffect(() => {
		setViewableAttendees(attendeeNames.slice(0, 8));
	}, [attendeeNames]);

	function showMoreAttendees() {
		setAttendeesExpanded(true);
		setViewableAttendees(attendeeNames);
	}

	function showLessAttendees() {
		setAttendeesExpanded(false);
		setViewableAttendees(attendeeNames.slice(0, 8));
	}

	return (
		<>
			<LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
			<Transition
				mounted={!isLoading}
				transition="fade"
				duration={400}
				timingFunction="ease"
			>
				{(transitionStyle) => (
					<>
						<Container size="xxl" mt={80}>

							<Modal opened={opened} padding={0} onClose={close} title={<Text size="lg" fw="bold">{currentAttendee ? 'Add a dish' : 'Sign In'}</Text>} bg="var(--bg-primary)">
							{currentAttendee && (
								<>
								<Group justify="center" w="100%">
									<AvatarGroup>
										<Avatar size="lg" style={{ justifyContent: "center", alignItems: "center" }}><Image alt="rice emoji" src="/public/rice.png" fit="cover" w="60%" /></Avatar>
										<Avatar size="lg" style={{ justifyContent: "center", alignItems: "center", zIndex: 100 }}><Image alt="meat emoji" src="/public/meat.png" fit="cover" w="60%" /></Avatar>
										<Avatar size="lg" style={{ justifyContent: "center", alignItems: "center"}}><Image alt="cake emoji" src="/public/cake.png" fit="cover" w="60%" /></Avatar>
									</AvatarGroup>
								</Group>
								<DishForm plid={plid} closeModal={close} attendee={currentAttendee} />
								</>
							)}
							{!currentAttendee && (
								<AttendeeForm closeModal={close} setCurrentAttendee={setCurrentAttendee} />
							)}
							
							</Modal>
							

							<Grid
								justify="center"    // Centers the grid horizontally
								gutter="lg"         // Adds spacing between grid columns
								style={{ width: "100%", margin: "auto" }} // Ensures the grid spans the full width 
							>
								<Grid.Col span={3}>
									<Stack>
										<Card withBorder>
											<Card.Section inheritPadding py="md" style={transitionStyle}>
												<Text fw="bold" size="xl">{potluck?.name}</Text>
												<Group justify="space-between" style={transitionStyle}>
													<Text size="xs" c="var(--orange-primary)">
														{dayjs(potluck?.datetime).format('MMM D, YYYY')} |  {dayjs(potluck?.datetime).format('h:mm A')}
													</Text>
												</Group>

											</Card.Section>

											<Spoiler maxHeight={72} showLabel={<Text mt="sm" size="sm">view more</Text>} hideLabel={<Text mt="sm" size="sm">hide</Text>} style={transitionStyle}>
												<Text mt="sm" c="dimmed" size="sm">{potluck?.information}</Text>
											</Spoiler>
										</Card>

										<Accordion variant="filled" radius="md" bd="2px solid var(--border-primary)" bdrs="md">
											<Accordion.Item value="photos" style={transitionStyle}>
												<Accordion.Control
													icon={<IconUsers size={22} stroke={1.5} color="var(--mantine-color-dimmed)" />}
												>
													{attendeeNames.length} people joined this event
												</Accordion.Control>
												<Accordion.Panel>
													<Group>
														<>
															{
																viewableAttendees.map((name) => (
																	<Tooltip
																		withArrow
																		label={name}
																		bg="var(--bg-primary)"
																		color="var(--text-light)"
																	>
																		<Avatar key={name} name={name} color="initials" allowedInitialsColors={['blue', 'red', 'orange']} />
																	</Tooltip>
																))}

															{ // Toggle expanded or minmized view of attendees
																attendeesExpanded ? 
																	<UnstyledButton onClick={showLessAttendees}>
																		<Avatar>
																		<IconEyeOff size={16}/>

																		</Avatar>
																	</UnstyledButton>
																:
																	<Tooltip
																		withArrow
																		label={attendeeNames.slice(8, -1).join(", ")}
																		bg="var(--bg-primary)"
																		color="var(--text-light)"
																	>
																		<UnstyledButton onClick={(showMoreAttendees)}>
																			<Avatar>+{attendeeNames.slice(8, -1).length}</Avatar>
																		</UnstyledButton>
																	</Tooltip>
															}
														
														</>
													</Group>
												</Accordion.Panel>
											</Accordion.Item>
										</Accordion>
									</Stack>
								</Grid.Col>

								<Grid.Col span={5}>
									<Stack>
										<Group align="center" justify="space-between">
											<Tabs variant="pills" defaultValue="1" value={activeTab} onChange={setActiveTab} py={3} px="sm">
												<Tabs.List justify="space-between">
													<Tabs.Tab value="1" color="var(--bg-input-dark)" >
														Main
													</Tabs.Tab>
													<Tabs.Tab value="2" color="var(--bg-input-dark)">
														Sides
													</Tabs.Tab>
													<Tabs.Tab value="3" color="var(--bg-input-dark)">
														Drinks
													</Tabs.Tab>
													<Tabs.Tab value="4" color="var(--bg-input-dark)">
														Desserts
													</Tabs.Tab>
													<Tabs.Tab value="5" color="var(--bg-input-dark)">
														Other
													</Tabs.Tab>
												</Tabs.List>
											</Tabs>

											<Group>
												<CopyButton value={typeof window !== 'undefined' ? window.location.href : ''}>
													{({ copy }) => (
														<Button
															color="primaryColor"
															onClick={() => {
																copy()
																notifications.show({
																	radius: "md",
																	color: "var(--success",
																	title: 'Link copied!',
																	message: 'Share this link with your friends to plan dishes!',
																	icon: <IconCheck size={16} />,
																})
															}}
														>
															Share
														</Button>
													)}
												</CopyButton>
												<Button onClick={open} color="var(--bg-input-dark)" bd="2px solid var(--border-primary)">Add a Dish</Button>
												{currentAttendee && <Text c="dimmed">as {currentAttendee}</Text>}
											</Group>
										</Group>

										<Card withBorder radius="md" p={0}>
											<Table striped style={transitionStyle}>
												<Table.Thead>
													<Table.Tr>
														<Table.Th style={{ textAlign: "left" }}>Name</Table.Th>
														<Table.Th style={{ textAlign: "center" }}>Item</Table.Th>
														<Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
													</Table.Tr>
												</Table.Thead>
												<Table.Tbody>
													{Object.keys(potluck?.dishes || {}).length > 0 ? (
														Object.entries(potluck?.dishes || {})
															.sort(([, a], [, b]) => {
																const order = ['main', 'side', 'dessert', 'drinks', 'other'];
																const aIndex = order.indexOf(String(a.dish_category).toLowerCase());
																const bIndex = order.indexOf(String(b.dish_category)?.toLowerCase());
																return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
															})
															// Map a list of [key, value] pairs. Each key encodes a 
															// dish's unique uuid. The value is the Dish data itself.
															.map(([dishId, dish]) => (
																<Table.Tr key={dishId}>
																	<Table.Td style={{ textAlign: "left", width: "33.33%" }} c="dimmed">{dish.attendee}</Table.Td>
																	<Table.Td style={{ textAlign: "center", width: "33.33%" }} c="dimmed">{dish.dish}</Table.Td>
																	<Table.Td style={{ textAlign: "right", width: "33.33%" }} c="dimmed">
																		<UnstyledButton>
																			<IconTrash size={16} />
																		</UnstyledButton>
																	</Table.Td>
																</Table.Tr>
															))
													) : (
														<Table.Tr>
															<Table.Td colSpan={3}>
																<Text c="dimmed" fs="italic" ta="center" size="sm">
																	No dishes added yet. Be the first!
																</Text>
															</Table.Td>
														</Table.Tr>
													)}
												</Table.Tbody>
											</Table>
										</Card>
										<Flex justify="end"><Text>x main items</Text></Flex>
									</Stack>
								</Grid.Col>

								<Grid.Col span={3}>
									<Card withBorder>
										<Card.Section withBorder inheritPadding py="md">
											<Group justify="space-between">
												<Text fw="bold" size="xl">Checklist</Text>
												<Button color="var(--bg-input-dark)">view</Button>
											</Group>
										</Card.Section>

										<Text mt="sm" c="dimmed" size="sm">
											To help keep track of what else needs to be brought, use this checklist as a reference.
										</Text>

										<Card.Section inheritPadding mt="xl" pb="md" style={transitionStyle}>
											<Flex align="end" justify="space-between">
												<Stack gap={0}>
													<Flex align="end">
														<Text size="xl" fw="bolder">6</Text>
														<Text c="dimmed">/12</Text>
													</Flex>
													<Text>completed</Text>
												</Stack>

												<RingProgress
													roundCaps
													size={96}
													thickness={10}
													transitionDuration={250}
													sections={[{ value: 50, color: "primaryColor" }]}>
												</RingProgress>
											</Flex>
										</Card.Section>
									</Card>
								</Grid.Col>
							</Grid>
						</Container>
					</>
				)}
			</Transition>
		</>
	)
}