import { ActionIcon, AppShell, Button, Container, Group } from "@mantine/core";
import { useLocation } from '@tanstack/react-router'
import { useEffect, useRef } from "react";
import { IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import "../styles.css";

/**
 * The `Navbar` component renders the header section of the application, including navigation links
 * and branding. It highlights the active navigation link based on the current route.
 *
 * @remarks
 * - This component uses `useLocation` from `tanstack-router` to determine the current route.
 * - A `useEffect` hook is used to dynamically update the styles of the navigation links
 *   based on the active route.
 */
export function Navbar() {
	const location = useLocation();
	const pathname = location.pathname
	const createLink = useRef<HTMLAnchorElement | null>(null);
	const tutorialLink = useRef<HTMLAnchorElement | null>(null);

	useEffect(() => {
		if (createLink != null && tutorialLink != null) {
			if (pathname === "/") {
				createLink!!.current!!.style.color = "var(--orange-primary)"
			}
			if (pathname === "/tutorial") {
				tutorialLink!!.current!!.style.color = "var(--orange-primary)Why"
			}
		}
	}, [location])

	return (
		<AppShell.Header bg="var(--bg-primary)">
			<Container size="xxl">
				<Group justify="space-between" align="center" py="xs">
					<Group gap={0} align="center">
						<ActionIcon variant="transparent" aria-label="sidebar-expand-button" c="var(--text-light)" mb={2} display={{base: "block", lg:"none"}}>
							<IconLayoutSidebarLeftExpand />
						</ActionIcon>
						<Button variant="transparent" component="a" href="/" c="var(--text-white)" fw="bolder">Potlucky</Button>
					</Group>
					<Group gap={0} >
						<Button id="create-link" ref={createLink} component="a" href="/" variant="transparent" c="var(--text-white)">Create</Button>
						<Button id="tutorial-link" ref={tutorialLink} component="a" href="/tutorial" variant="transparent" c="var(--text-white)">How it works</Button>
					</Group>
				</Group>
			</Container>
		</AppShell.Header>
	)
}