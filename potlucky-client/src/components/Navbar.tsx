import { ActionIcon, AppShell, Box, Button, Container, Drawer, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import "../styles.css";

/**
 * The `Navbar` component renders the header section of the application, including navigation links
 * and branding. It highlights the active navigation link based on the current route.
 *
 * On mobile, the nav links collapse into a drawer accessible via the hamburger icon.
 * A portal target (#navbar-right-portal) allows route-specific content on the right side on mobile.
 */
export function Navbar() {
	const [drawerOpened, drawerHandlers] = useDisclosure(false);

	return (
		<>
			<Drawer
				opened={drawerOpened}
				onClose={drawerHandlers.close}
				size="xs"
				title={<Button variant="transparent" component="a" href="/" c="var(--text-white)" fw="bolder">Potlucky</Button>}
				styles={{
					body: { background: "var(--bg-primary)" },
					header: { background: "var(--bg-primary)" },
				}}
			>
				<Stack gap="xs">
					<Button component="a" href="/" variant="subtle" c="var(--text-light)" justify="flex-start" onClick={drawerHandlers.close}>Create</Button>

				</Stack>
			</Drawer>

			<AppShell.Header bg="var(--bg-primary)">
				<Container size="xxl">
					<Group justify="space-between" align="center" py="xs">
						<Group gap={0} align="center">
							<ActionIcon
								variant="transparent"
								aria-label="sidebar-expand-button"
								c="var(--text-light)"
								mb={2}
								display={{ base: "block", sm: "none" }}
								onClick={drawerHandlers.open}
							>
								<IconLayoutSidebarLeftExpand />
							</ActionIcon>
							<Button variant="transparent" component="a" href="/" c="var(--text-white)" fw="bolder">Potlucky</Button>
						</Group>

						{/* Desktop nav links — hidden on mobile */}
						<Group gap={0} display={{ base: "none", sm: "flex" }}>
							<Button id="create-link" component="a" href="/" variant="transparent" c="var(--text-white)">Create</Button>
						</Group>

						{/* Portal target for route-specific mobile content (e.g. attendees icon) */}
						<Box hiddenFrom="sm">
							<span id="navbar-right-portal" />
						</Box>
					</Group>
				</Container>
			</AppShell.Header>
		</>
	)
}