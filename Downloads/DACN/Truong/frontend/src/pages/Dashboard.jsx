import { Calendar, Clock, CheckSquare, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'

export default function Dashboard() {
    const { user } = useAuth()

    // Fetch dashboard stats
    const { data: stats = {} } = useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: async () => {
            const response = await api.get('/users/dashboard/stats')
            return response.data.data
        }
    })

    // Fetch upcoming events
    const { data: upcomingEvents = [] } = useQuery({
        queryKey: ['dashboard', 'upcoming-events'],
        queryFn: async () => {
            const response = await api.get('/users/dashboard/upcoming-events?limit=5')
            return response.data.data
        }
    })

    const statCards = [
        { title: 'Su kien hom nay', value: stats.eventsToday || 0, icon: Calendar, color: 'text-primary' },
        { title: 'Su kien tuan nay', value: stats.eventsThisWeek || 0, icon: Clock, color: 'text-success' },
        { title: 'Hoan thanh', value: `${stats.completionRate || 0}%`, icon: CheckSquare, color: 'text-warning' },
        { title: 'Tong su kien', value: stats.totalEvents || 0, icon: TrendingUp, color: 'text-purple-500' },
    ]

    const formatTime = (startTime, endTime) => {
        if (!startTime) return ''
        const start = format(new Date(startTime), 'HH:mm')
        const end = endTime ? format(new Date(endTime), 'HH:mm') : ''
        return end ? `${start} - ${end}` : start
    }

    const getCategoryColor = (color) => {
        if (color) return `bg-[${color}]`
        return 'bg-primary'
    }

    return (
        <div className="space-y-2">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-secondary-800">
                    Xin chao, {user?.full_name || 'Ban'}!
                </h1>
                <p className="text-secondary-500 mt-1">
                    Chuc ban mot ngay lam viec hieu qua
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-secondary-500">{stat.title}</p>
                                    <p className="text-3xl font-bold text-secondary-800 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg bg-secondary-50 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upcoming Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Su kien sap toi</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-secondary-100">
                        {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => (
                                <div key={event.id} className="p-4 hover:bg-secondary-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-1 h-12 rounded-full"
                                            style={{ backgroundColor: event.category_color || '#3B82F6' }}
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-secondary-800">{event.title}</h4>
                                            <p className="text-sm text-secondary-500">
                                                {formatTime(event.start_time, event.end_time)}
                                            </p>
                                        </div>
                                        {event.category_name && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 text-secondary-600">
                                                {event.category_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-secondary-500">Khong co su kien sap toi</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-card-hover transition-shadow">
                    <CardContent className="p-6 text-center">
                        <Calendar className="h-10 w-10 text-primary mx-auto mb-3" />
                        <h3 className="font-semibold text-secondary-800">Xem lich</h3>
                        <p className="text-sm text-secondary-500 mt-1">Quan ly su kien cua ban</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-card-hover transition-shadow">
                    <CardContent className="p-6 text-center">
                        <Clock className="h-10 w-10 text-success mx-auto mb-3" />
                        <h3 className="font-semibold text-secondary-800">Them su kien</h3>
                        <p className="text-sm text-secondary-500 mt-1">Tao su kien moi nhanh chong</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
