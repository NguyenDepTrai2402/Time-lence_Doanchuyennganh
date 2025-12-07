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
        { title: 'Sự kiện hôm nay', value: stats.eventsToday || 0, icon: Calendar, color: 'text-primary' },
        { title: 'Sự kiện tuần này', value: stats.eventsThisWeek || 0, icon: Clock, color: 'text-success' },
        { title: 'Hoàn thành', value: `${stats.completionRate || 0}%`, icon: CheckSquare, color: 'text-warning' },
        { title: 'Tổng sự kiện', value: stats.totalEvents || 0, icon: TrendingUp, color: 'text-purple-500' },
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
        <div className="space-y-6 -mt-4" style={{ paddingTop: '3.5rem' }}>
            {/* Welcome */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl blur-xl" />
                <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Xin chào, {user?.full_name || 'Bạn'}! 
                    </h1>
                    <p className="text-secondary-600 mt-2 text-lg">
                        Chúc bạn một ngày làm việc hiệu quả!
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="card-hover">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-secondary-500 font-medium">{stat.title}</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-secondary-800 to-secondary-600 bg-clip-text text-transparent mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm shadow-md ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upcoming Events */}
            <Card className="card-hover">
                <CardHeader className="bg-gradient-to-r from-white/80 to-purple-50/50">
                    <CardTitle className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Sự kiện sắp tới</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/20">
                        {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => (
                                <div key={event.id} className="p-4 hover:bg-white/50 transition-colors">
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
                            <p className="p-4 text-sm text-secondary-500">Không có sự kiện sắp tới</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer card-hover group">
                    <CardContent className="p-6 text-center">
                        <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
                            <Calendar className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="font-semibold text-secondary-800">Xem lịch</h3>
                        <p className="text-sm text-secondary-500 mt-1">Quản lý sự kiện của bạn</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer card-hover group">
                    <CardContent className="p-6 text-center">
                        <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-3 group-hover:scale-110 transition-transform">
                            <Clock className="h-10 w-10 text-success" />
                        </div>
                        <h3 className="font-semibold text-secondary-800">Thêm sự kiện</h3>
                        <p className="text-sm text-secondary-500 mt-1">Tạo sự kiện mới nhanh chóng</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
