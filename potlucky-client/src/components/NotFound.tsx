import { Title, Button, Container } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import type { CSSProperties } from 'react';

export function NotFoundPage() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const styles: Record<string, CSSProperties> = {
		root: {
			minHeight: '100vh',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			textAlign: 'center',
			padding: '20px',
		},
		label: {
			fontWeight: 900,
			fontSize: isMobile ? '100px' : '180px',
			lineHeight: 1,
			color: 'var(--mantine-color-white)',
		},
		title: {
			fontWeight: 700,
			fontSize: isMobile ? '24px' : '34px',
			marginTop: '10px',
		},
		button: {
			marginTop: '30px',
		},
	};

	return (
		<Container style={styles.root}>
			<div style={styles.label}>404</div>
			<Title style={styles.title}>Page not found</Title>
			<div style={styles.button}>
				<Link to="/">
					<Button size={isMobile ? "sm" : "md"}>
						Return home to plan your next potluck
					</Button>
				</Link>
			</div>
		</Container>
	);
}