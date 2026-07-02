import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import { theme } from './theme.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * (60 * 1000),
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider defaultColorScheme='auto' theme={theme}>
      <Notifications />
      <QueryClientProvider client={client} >
        <App />
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
)
