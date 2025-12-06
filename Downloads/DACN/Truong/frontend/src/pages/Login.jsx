import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'

const loginSchema = z.object({
    email: z.string().email('Email khong hop le'),
    password: z.string().min(1, 'Vui long nhap mat khau'),
})

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()
    const toast = useToast()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const response = await login(data.email, data.password)
            if (response.success) {
                toast.success('Dang nhap thanh cong!')
                // Redirect based on role
                const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/dashboard'
                navigate(redirectPath)
            } else {
                toast.error(response.message || 'Dang nhap that bai')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Co loi xay ra')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
                <div className="text-white text-center">
                    <Calendar className="h-20 w-20 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-4">Schedule App</h1>
                    <p className="text-lg text-primary-100">
                        Quan ly thoi gian hieu qua. Khong bao gio bo lo su kien quan trong.
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Calendar className="h-12 w-12 mx-auto text-primary mb-2" />
                        <h1 className="text-2xl font-bold text-primary">Schedule App</h1>
                    </div>

                    <Card>
                        <CardContent className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-secondary-800">Chao mung tro lai</h2>
                                <p className="text-secondary-500 mt-2">Dang nhap de tiep tuc</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="email@example.com"
                                    icon={Mail}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />

                                <Input
                                    label="Mat khau"
                                    type="password"
                                    placeholder="Nhap mat khau"
                                    icon={Lock}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-secondary-300 text-primary focus:ring-primary" />
                                        <span className="text-sm text-secondary-600">Ghi nho dang nhap</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                        Quen mat khau?
                                    </Link>
                                </div>

                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    Dang nhap
                                </Button>
                            </form>

                            <p className="text-center mt-6 text-secondary-600">
                                Chua co tai khoan?{' '}
                                <Link to="/register" className="text-primary font-medium hover:underline">
                                    Dang ky ngay
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
