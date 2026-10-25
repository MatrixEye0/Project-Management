import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CLERK_PROXY_URL = import.meta.env.PROD
    ? 'https://project-management-la97.vercel.app/__clerk'
    : undefined

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Clerk publishable key. Please set the VITE_CLERK_PUBLISHABLE_KEY environment variable.')
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
           
                <ClerkProvider publishableKey={PUBLISHABLE_KEY} proxyUrl={CLERK_PROXY_URL}>
                <Provider store={store}>
                <App />
                </Provider>
                </ClerkProvider>
    </BrowserRouter>,
)