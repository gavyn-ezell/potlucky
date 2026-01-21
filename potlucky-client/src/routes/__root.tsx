import { Outlet, createRootRoute } from '@tanstack/react-router'
import { EmojiBackground } from '../components/EmojiBackground'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';


export const Route = createRootRoute({
  component: () => (
    <>
      <EmojiBackground>
        <Outlet />
      </EmojiBackground>
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
    </>
  ),
})

