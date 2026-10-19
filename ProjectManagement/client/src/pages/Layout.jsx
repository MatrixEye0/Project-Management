import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'
import { useUser, SignIn, useAuth, CreateOrganization, useOrganization } from '@clerk/react'
import { fetchWorkspaces } from '../features/workspaceSlice'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading, workspaces } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()
    const { user, isLoaded } = useUser()
    const { organization } = useOrganization()
    const { getToken } = useAuth()

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    // Load workspaces on login, and again whenever the Clerk organization changes
    useEffect(() => {
        if (isLoaded && user) {
            dispatch(fetchWorkspaces({ getToken }))
        }
    }, [user, isLoaded, organization?.id])

    // The Clerk -> Inngest -> DB webhook is async, so after an org is created
    // keep checking quietly (every 2s, max 10 times) until the workspace shows up
    useEffect(() => {
        if (!organization || workspaces.length > 0) return

        let tries = 0
        const id = setInterval(() => {
            tries++
            dispatch(fetchWorkspaces({ getToken, silent: true }))
            if (tries >= 10) clearInterval(id)
        }, 2000)

        return () => clearInterval(id)
    }, [organization?.id, workspaces.length])

    if (!isLoaded) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <SignIn />
            </div>
        )
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (workspaces.length === 0) {
        // Org already exists in Clerk, just waiting for the DB row (webhook)
        if (organization) {
            return (
                <div className='flex flex-col gap-3 items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                    <Loader2Icon className="size-7 text-blue-500 animate-spin" />
                    <p className='text-sm text-gray-500 dark:text-zinc-400'>Setting up your workspace...</p>
                </div>
            )
        }

        return (
            <div className='min-h-screen flex justify-center items-center'>
                <CreateOrganization />
            </div>
        )
    }

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout