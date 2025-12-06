import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({ isAdmin = false }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-secondary-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isAdmin={isAdmin}
            />

            <Header
                onMenuClick={() => setSidebarOpen(true)}
                isAdmin={isAdmin}
            />

            <div className="lg:ml-64">
                <main className="pt-28 p-4 lg:p-600">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
