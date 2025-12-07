import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import MainLayout from './MainLayout'

export default function AdminLayout() {
    const { user, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    // Use the same MainLayout as user but with admin context
    return <MainLayout isAdmin={true} />
}
