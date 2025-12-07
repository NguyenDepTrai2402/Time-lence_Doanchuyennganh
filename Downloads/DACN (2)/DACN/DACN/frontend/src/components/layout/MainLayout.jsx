import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { HeaderProvider } from '@/context/HeaderContext'
import { useHeader } from '@/context/HeaderContext'
import { cn } from '@/utils/cn'

function MainContent({ isAdmin = false }) {
    const { isHeaderVisible } = useHeader()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen relative">
            {/* Background overlay for better readability */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-50/80 via-blue-50/80 to-indigo-50/80 backdrop-blur-sm pointer-events-none" />
            
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isAdmin={isAdmin}
            />

            <Header
                onMenuClick={() => setSidebarOpen(true)}
                isAdmin={isAdmin}
            />

            <div className="lg:ml-64 relative z-10">
                <main className={cn(
                    "p-4 lg:p-6 transition-all duration-300",
                    isHeaderVisible ? "pt-20" : "pt-4"
                )}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default function MainLayout({ isAdmin = false }) {
    return (
        <HeaderProvider>
            <MainContent isAdmin={isAdmin} />
        </HeaderProvider>
    )
}
