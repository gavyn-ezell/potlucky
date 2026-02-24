import { Outlet, createRootRoute } from '@tanstack/react-router'
import { EmojiBackground } from '../components/EmojiBackground'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { Navbar } from '@/components/Navbar';
import { AppShell } from '@mantine/core';


export const Route = createRootRoute({
  component: () => (
    <AppShell>
      <Navbar />
      <EmojiBackground>
        <Outlet />
      </EmojiBackground>
    </AppShell>
  ),
})

{/* <TanStackDevtools
      config={{
        position: 'bottom-right',
      }}
      plugins={[
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
    ]}
  /> */}