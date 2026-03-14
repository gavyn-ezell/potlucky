import { createFileRoute, redirect } from "@tanstack/react-router"
import { Container, Text, Stack, Group, CopyButton, Button, Flex, Modal, Grid, Card, RingProgress, Table, Accordion, UnstyledButton, Avatar, Tooltip, Spoiler, LoadingOverlay, Transition, AvatarGroup, Image, ActionIcon, Center, Menu, Combobox, InputBase, useCombobox, Box } from "@mantine/core"
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { IconCheck, IconUsers, IconTrash, IconEyeOff, IconX, IconShare } from "@tabler/icons-react"
import { DishForm } from "@/components/DishForm"
import { Category, type PotluckDataResponse, type PotluckProgress } from "@/types/types"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import "../styles.css";
import { CategoryProgressStats } from "@/components/CategoryProgressStats"
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
 * Extracts a list of unique attendees from the provided potluck data.
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
 * Builds a progress map for each category in a potluck event.
 */
function BuildCategoryProgress(potluck?: PotluckDataResponse): Map<Category, PotluckProgress> {
	const progressMap = new Map<Category, PotluckProgress>();
	if (!potluck || !potluck.requirements) return progressMap;

	(Object.values(Category) as Category[]).forEach(c => progressMap.set(c, { numRequired: 0, numCompleted: 0 }));

	(Object.entries(potluck.requirements) as [Category, number][]).forEach(([category, numRequired]) => {
		progressMap.set(category, { numRequired, numCompleted: 0 });
	});

	Object.values(potluck.dishes || {}).forEach(dish => {
		const prog = progressMap.get(dish.dish_category);
		const req = potluck.requirements[dish.dish_category as keyof typeof potluck.requirements];
		if (prog !== undefined && typeof req === 'number') {
			progressMap.set(dish.dish_category, { ...prog, numCompleted: Math.min(prog.numRequired, prog.numCompleted + 1) });
		}
	});

	return progressMap;
}

/**
 * Mobile-responsive potluck page.
 * Desktop: 3-column grid (info+attendees | dishes table | dish goals)
 * Mobile:  single-column stack (info → table → dish goals)
 */
function RouteComponent() {
	const { plid } = Route.useParams()
	const queryClient = useQueryClient()

	const [addDishModalOpened, addDishModalHandlers] = useDisclosure(false);
	const [viewProgressModalOpened, viewProgressModalHandlers] = useDisclosure(false);
	const [attendeesModalOpened, attendeesModalHandlers] = useDisclosure(false);

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const [activeTab, setActiveTab] = useState<Category | "all">("all");
	const [currentAttendee, setCurrentAttendee] = useState<string | null>(null);
	const [attendeesExpanded, setAttendeesExpanded] = useState<boolean>(false);
	const [viewableAttendees, setViewableAttendees] = useState<string[]>([]);
	const [navbarPortal, setNavbarPortal] = useState<HTMLElement | null>(null);

	const { isLoading, data: potluck } = useQuery({
		queryKey: ['potluck', plid], queryFn: async (): Promise<PotluckDataResponse> => {
			const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}`)
			return await response.json()
		},
		retry: 3,
	})

	const deleteDishMutation = useMutation({
		mutationFn: async (dishId: string) => {
			const response = await fetch(`${import.meta.env.VITE_POTLUCKY_API_URL}/potluck/${plid}/dish/${dishId}`, {
				method: 'DELETE',
			})
			if (!response.ok) {
				throw Error('Failed to delete dish!')
			}
			return await response.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['potluck', plid] })
		},
		onError: () => {
			notifications.show({
				radius: "md",
				color: "var(--error",
				title: 'Error',
				message: 'Failed to delete dish!',
				icon: <IconX size={16} />,
			})
		}
	})

	const attendeeNames = useMemo(() => ExtractAttendees(potluck), [potluck]);
	const categoryProgress = useMemo(() => BuildCategoryProgress(potluck), [potluck]);

	var totalProgress = useMemo(() => {
		if (categoryProgress) {
			var totalProgress: PotluckProgress = { numCompleted: 0, numRequired: 0 }
			categoryProgress.forEach((categoryProgress, _) => {
				totalProgress.numRequired += categoryProgress.numRequired
				totalProgress.numCompleted += categoryProgress.numCompleted
			})
			return totalProgress
		}
	}, [categoryProgress])

	useEffect(() => {
		setViewableAttendees(attendeeNames.slice(0, 8));
	}, [attendeeNames]);

	useEffect(() => {
		const el = document.getElementById('navbar-right-portal');
		if (el) setNavbarPortal(el);
	}, []);

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
					<Center>
						<Container size="xxl" mt={100} px={{ base: "sm", sm: "md", md: "xl" }}>

							{categoryProgress &&
								<>
									{/* ── Shared Modals ── */}
									<Modal size="md" opened={viewProgressModalOpened} padding={0} onClose={viewProgressModalHandlers.close} title={<Text size="lg" fw="bold">Dish Goals</Text>} styles={{ header: { position: 'static' } }}>
										<Stack justify="center" w="100%">
											{Array.from(categoryProgress).map(([category, progress]) => (
												<CategoryProgressStats key={category} category={category} progress={progress} />
											))}
										</Stack>
									</Modal>

									<Modal opened={addDishModalOpened} padding={0} onClose={addDishModalHandlers.close} title={<Text size="lg" fw="bold">Add a Dish</Text>} bg="var(--bg-primary)">
										{currentAttendee && (
											<>
												<Group justify="center" w="100%">
													<AvatarGroup>
														<Avatar size="lg" style={{ justifyContent: "center", alignItems: "center" }}><Image alt="rice emoji" src="/rice.png" fit="cover" w="60%" /></Avatar>
														<Avatar size="lg" style={{ justifyContent: "center", alignItems: "center", zIndex: 100 }}><Image alt="meat emoji" src="/meat.png" fit="cover" w="60%" /></Avatar>
														<Avatar size="lg" style={{ justifyContent: "center", alignItems: "center" }}><Image alt="cake emoji" src="/cake.png" fit="cover" w="60%" /></Avatar>
													</AvatarGroup>
												</Group>
												<DishForm plid={plid} closeModal={addDishModalHandlers.close} categoryProgress={categoryProgress} attendee={currentAttendee} />
											</>
										)}
										{!currentAttendee && (
											<AttendeeForm closeModal={addDishModalHandlers.close} setCurrentAttendee={setCurrentAttendee} />
										)}
									</Modal>

									{/* Attendees modal (for mobile tap target) */}
									<Modal opened={attendeesModalOpened} onClose={attendeesModalHandlers.close} title={<Text size="lg" fw="bold">{attendeeNames.length} {attendeeNames.length === 1 ? "person" : "people"} joined</Text>}>
										<Group gap="sm" wrap="wrap">
											{attendeeNames.map((name) => (
												<Tooltip key={name} withArrow label={name} bg="var(--bg-primary)" color="var(--text-light)">
													<Avatar name={name} color="initials" allowedInitialsColors={['blue', 'red', 'orange']} />
												</Tooltip>
											))}
										</Group>
									</Modal>
								</>
							}

							{/* ── Mobile: People icon portaled into navbar ── */}
							{navbarPortal && createPortal(
								<ActionIcon
									variant="subtle"
									c="var(--text-light)"
									onClick={attendeesModalHandlers.open}
									aria-label="View attendees"
								>
									<IconUsers size={20} />
								</ActionIcon>,
								navbarPortal
							)}

							<Center inline mx="auto">
								<Grid
									w="100%"
									mx="auto"
									gutter={{ base: "md", sm: "lg" }}
								>
									{/* ── Column 1: Info + Attendees ── */}
									<Grid.Col
										span={{ base: 12, sm: 3 }}
										order={{ base: 1, sm: 1 }}
									>
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

											{/* Attendees accordion: desktop only */}
											<Box visibleFrom="sm">
												<Accordion variant="filled" radius="md" bd="2px solid var(--border-primary)" bdrs="md">
													<Accordion.Item value="photos" style={transitionStyle}>
														<Accordion.Control
															icon={<IconUsers size={22} stroke={1.5} color="var(--mantine-color-dimmed)" />}
														>
															{attendeeNames.length} {attendeeNames.length == 1 ? "person" : "people"} joined this potluck
														</Accordion.Control>
														<Accordion.Panel>
															<Group>
																<>
																	{
																		viewableAttendees.map((name) => (
																			<Tooltip
																				key={name}
																				withArrow
																				label={name}
																				bg="var(--bg-primary)"
																				color="var(--text-light)"
																			>
																				<Avatar name={name} color="initials" allowedInitialsColors={['blue', 'red', 'orange']} />
																			</Tooltip>
																		))}

																	{ // Toggle expanded or minimized view of attendees
																		attendeesExpanded ?
																			<UnstyledButton onClick={showLessAttendees}>
																				<Avatar>
																					<IconEyeOff size={16} />
																				</Avatar>
																			</UnstyledButton>
																			:
																			attendeeNames.length > 8 &&
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
											</Box>
										</Stack>
									</Grid.Col>

									{/* ── Column 2: Dish Goals (order 3 on mobile, 3 on desktop) ── */}
									<Grid.Col
										span={{ base: 12, sm: 3 }}
										order={{ base: 3, sm: 3 }}
									>
										<Card withBorder>
											<Card.Section withBorder inheritPadding py="md">
												<Group justify="space-between">
													<Text fw="bold" size="xl">Dish Goals</Text>
													<Button disabled={totalProgress?.numRequired == 0} color="var(--bg-input-dark)" onClick={viewProgressModalHandlers.open}>view</Button>
												</Group>
											</Card.Section>

											<Text mt="sm" c="dimmed" size="sm">
												To help keep track of what else needs to be brought, use this as a reference.
											</Text>

											<Card.Section inheritPadding mt="xl" pb="md" style={transitionStyle}>
												{totalProgress?.numRequired == 0 ?
													<Text c="blue">No dish goals.</Text>
													:

													<Flex align="end" justify="space-between">

														{totalProgress && (
															<>
																<Stack gap={0}>
																	<Flex align="end">
																		<Text size="xl" fw="bolder">{totalProgress.numCompleted}</Text>
																		<Text c="dimmed">/{totalProgress.numRequired}</Text>
																	</Flex>
																	<Text>completed</Text>
																</Stack>
																<RingProgress
																	roundCaps
																	size={96}
																	thickness={10}
																	transitionDuration={250}
																	sections={[{
																		value: (totalProgress.numCompleted / totalProgress.numRequired) * 100,
																		color: (totalProgress.numCompleted >= totalProgress.numRequired) ? "var(--success)" : "yellow"
																	}
																	]}
																	label={
																		totalProgress.numCompleted >= totalProgress.numRequired ?
																			<Center>
																				<ActionIcon color="var(--success)" variant="light" radius="xl" size="xl">
																					<IconCheck size={22} />
																				</ActionIcon>
																			</Center>
																			:
																			<Center>
																				<ActionIcon color="yellow" variant="light" radius="xl" size="xl">
																					<IconCheck size={22} />
																				</ActionIcon>
																			</Center>
																	}
																>
																</RingProgress>
															</>

														)
														}

													</Flex>
												}
											</Card.Section>
										</Card>
									</Grid.Col>

									{/* ── Column 3: Dishes Table (order 2 on mobile, 2 on desktop) ── */}
									<Grid.Col
										span={{ base: 12, sm: 6 }}
										order={{ base: 2, sm: 2 }}
									>
										<Stack>
											<Stack gap={4}>
												{currentAttendee && (
													<Flex justify="flex-end">
														<Text size="xs" c="dimmed">Signed in as <Text span size="xs" fw={600} c="var(--orange-primary)">{currentAttendee}</Text></Text>
													</Flex>
												)}
												<Group align="center" justify="space-between" wrap="wrap" gap="sm">
													<Combobox
														store={combobox}
														onOptionSubmit={(val) => {
															setActiveTab(val as (Category | "all"));
															combobox.closeDropdown();
														}}
													>
														<Combobox.Target>
															<InputBase
																component="button"
																type="button"
																style={{ width: "100px" }}
																pointer
																rightSection={<Combobox.Chevron />}
																rightSectionPointerEvents="none"
																onClick={() => combobox.toggleDropdown()}
															>
																{activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + (["main", "side", "dessert"].includes(activeTab) ? "s" : "")}
															</InputBase>
														</Combobox.Target>

														<Combobox.Dropdown>
															<Combobox.Options>
																<Combobox.Option value="all" key="all">All</Combobox.Option>
																{Object.values(Category).map((cat) => (
																	<Combobox.Option value={cat} key={cat}>
																		{cat.charAt(0).toUpperCase() + cat.slice(1) + (["main", "side", "dessert"].includes(cat) ? "s" : "")}
																	</Combobox.Option>
																))}
															</Combobox.Options>
														</Combobox.Dropdown>
													</Combobox>

													<Group gap="sm">
														<CopyButton value={typeof window !== 'undefined' ? window.location.href : ''}>
															{({ copy }) => (
																<Button
																	style={{ paddingLeft: 10, paddingRight: 10 }}
																	size="xs"
																	radius="md"
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
																	<IconShare style={{ marginRight: 6 }} size={14} />
																	Share
																</Button>
															)}
														</CopyButton>
														<Button style={{ paddingLeft: 10, paddingRight: 10 }} size="xs" radius="md" onClick={addDishModalHandlers.open} color="var(--bg-input-dark)" bd="2px solid var(--border-primary)">
															Add Dish
														</Button>
													</Group>
												</Group>
											</Stack>

											<Card withBorder radius="md" p={0} style={{ overflowX: 'auto' }}>
												<Table style={{ ...transitionStyle, minWidth: 340 }}>
													<Table.Thead>
														<Table.Tr>
															<Table.Th style={{ textAlign: "left" }}>Dish</Table.Th>
															<Table.Th style={{ textAlign: "center" }}>Attendee</Table.Th>
															<Table.Th style={{ textAlign: "right" }}>Action</Table.Th>
														</Table.Tr>
													</Table.Thead>
													<Table.Tbody>
														{Object.keys(potluck?.dishes || {}).length > 0 ? (
															Object.entries(potluck?.dishes || {})
																.filter(([, dish]) => activeTab === "all" || dish.dish_category === activeTab)
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
																		<Table.Td c="var(--orange-primary)" style={{ textAlign: "left", width: "33.33%" }}>{dish.dish}</Table.Td>
																		<Table.Td style={{ textAlign: "center", width: "33.33%" }} c="dimmed">{dish.attendee}</Table.Td>
																		<Table.Td style={{ textAlign: "right", width: "33.33%" }} c="dimmed">
																			{currentAttendee == dish.attendee && (
																				<Menu width={100} position="bottom-start">
																					<Menu.Target>
																						<UnstyledButton>
																							<IconTrash size={16} />
																						</UnstyledButton>
																					</Menu.Target>
																					<Menu.Dropdown>
																						<Menu.Item disabled={deleteDishMutation.isPending} onClick={() => deleteDishMutation.mutateAsync(dishId)}>
																							Delete
																						</Menu.Item>
																					</Menu.Dropdown>
																				</Menu>
																			)}
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

											<Flex justify="end" visibleFrom="sm">
												<Text size="sm" c="dimmed">
													{(() => {
														const count = Object.values(potluck?.dishes || {}).filter(d => activeTab === "all" || d.dish_category === activeTab).length;

														return `${count} ${activeTab === "all" ? (count !== 1 ? "dishes" : "dish") : activeTab === "drinks" ? (count === 1 ? "drink" : "drinks") : ["main", "side", "dessert"].includes(activeTab) ? (count !== 1 ? activeTab + "s" : activeTab) : activeTab}`;
													})()}
												</Text>
											</Flex>
										</Stack>
									</Grid.Col>

								</Grid>
							</Center>

						</Container>
					</Center>
				)}
			</Transition>
		</>
	)
}