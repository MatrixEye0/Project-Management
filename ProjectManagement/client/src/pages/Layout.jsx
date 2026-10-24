import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'
import {useUser, SignIn, useAuth, CreateOrganization, useOrganizationList} from '@clerk/clerk-react'
import { fetchWorkspaces, resetWorkspaces } from '../features/workspaceSlice'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isWorkspaceSyncTimedOut, setIsWorkspaceSyncTimedOut] = useState(false)
    const { loading, workspaces, error } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()
    const {user, isLoaded}= useUser()
    const authenticatedUserId = user?.id
    const {getToken} = useAuth()
    const {userMemberships, isLoaded: isOrganizationListLoaded} = useOrganizationList({userMemberships: true})
    const previousUserId = useRef(null)
    const organizationIds = (userMemberships?.data || [])
        .map(({ organization }) => organization.id)
        .sort()
    const organizationIdsKey = organizationIds.join('|')
    const organizationIdSet = new Set(organizationIds)
    const availableWorkspaces = workspaces.filter((workspace) => organizationIdSet.has(workspace.id))
    const workspaceIds = workspaces.map((workspace) => workspace.id).sort()
    const workspaceIdsKey = workspaceIds.join('|')
    const workspacesAreSynced = organizationIdsKey === workspaceIdsKey

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [dispatch])

    useEffect(() => {
        if (!isLoaded) return

        const userId = user?.id || null
        if (previousUserId.current !== userId) {
            previousUserId.current = userId
            dispatch(resetWorkspaces(userId))
            if (userId) dispatch(fetchWorkspaces({ getToken, userId }))
            return
        }
        if (userId && isOrganizationListLoaded) {
            dispatch(fetchWorkspaces({ getToken, userId }))
        }
    }, [dispatch, getToken, isLoaded, isOrganizationListLoaded, organizationIdsKey, user?.id])

    useEffect(() => {
        if (!authenticatedUserId || !isOrganizationListLoaded || organizationIds.length === 0 || error) return
        if (workspacesAreSynced) {
            setIsWorkspaceSyncTimedOut(false)
            return
        }
        if (isWorkspaceSyncTimedOut) return

        let retryCount = 0
        const intervalId = window.setInterval(() => {
            if (retryCount === 10) {
                window.clearInterval(intervalId)
                setIsWorkspaceSyncTimedOut(true)
                return
            }
            retryCount += 1
            dispatch(fetchWorkspaces({ getToken, userId: authenticatedUserId, silent: true }))
        }, 2000)
        return () => window.clearInterval(intervalId)
    }, [authenticatedUserId, dispatch, error, getToken, isOrganizationListLoaded, isWorkspaceSyncTimedOut, organizationIdsKey, organizationIds.length, workspaceIdsKey, workspacesAreSynced])

if (!isLoaded || !user){
    if (!isLoaded) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )
    return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <SignIn />
        </div>
    )
}

    if (loading || !isOrganizationListLoaded) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    if (error) return (
        <div className='min-h-screen flex flex-col justify-center items-center gap-4 text-center'>
            <p className='text-sm text-red-600'>Unable to load your workspaces: {error}</p>
            <button
                type='button'
                onClick={() => dispatch(fetchWorkspaces({ getToken, userId: user.id }))}
                className='rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700'
            >
                Retry
            </button>
        </div>
    )

    if (availableWorkspaces.length === 0 && organizationIds.length > 0) {
        if (isWorkspaceSyncTimedOut) return (
            <div className='min-h-screen flex flex-col justify-center items-center gap-4 text-center'>
                <p className='text-sm text-gray-600 dark:text-zinc-400'>Your organization is not synced yet. Check that the Clerk events are reaching Inngest, then retry.</p>
                <button
                    type='button'
                    onClick={() => {
                        setIsWorkspaceSyncTimedOut(false)
                        dispatch(fetchWorkspaces({ getToken, userId: user.id }))
                    }}
                    className='rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700'
                >
                    Retry
                </button>
            </div>
        )
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (organizationIds.length === 0 && availableWorkspaces.length === 0) {
        return(
            <div className='min-h-screen flex justify-center items-center'>
                <CreateOrganization
                afterCreateOrganizationUrl="/"
                />
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
