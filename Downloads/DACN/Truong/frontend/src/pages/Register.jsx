import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/Toast'

const registerSchema = z.object({
    full_name: z.string().min(2, 'Ho ten it nhat 2 ky tu').max(100, 'Ho ten toi da 100 ky tu'),
    email: z.string().email('Email khong hop le'),
    password: z.string()
        .min(8, 'Mat khau it nhat 8 ky tu')
        .regex(/[A-Z]/, 'Can it nhat 1 chu hoa')
        .regex(/[a-z]/, 'Can it nhat 1 chu thuong')
        .regex(/[0-9]/, 'Can it nhat 1 so'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mat khau xac nhan khong khop',
    path: ['confirmPassword'],
})

function PasswordStrength({ password }) {
    const getStrength = () => {
        if (!password) return { level: 0, text: '', color: '' }
        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++

        if (score <= 2) return { level: 1, text: 'Yeu', color: 'bg-error' }
        if (score <= 3) return { level: 2, text: 'Trung binh', color: 'bg-warning' }
        return { level: 3, text: 'Manh', color: 'bg-success' }
    }

    const strength = getStrength()
    if (!password) return null

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded ${i <= strength.level ? strength.color : 'bg-secondary-200'}`}
                    />
                ))}
            </div>
            <p className={`text-xs ${strength.level === 1 ? 'text-error' : strength.level === 2 ? 'text-warning' : 'text-success'}`}>
                Do manh: {strength.text}
            </p>
        </div>
    )
}

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { register: registerUser } = useAuth()
    const toast = useToast()

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
    })

    const password = watch('password')

    const onSubmit = async (data) => {
        setIsLoading(true)
        try {
            const response = await registerUser({
                full_name: data.full_name,
                email: data.email,
                password: data.password,
            })
            if (response.success) {
                toast.success('Dang ky thanh cong! Vui long dang nhap.')
                navigate('/login')
            } else {
                toast.error(response.message || 'Dang ky that bai')
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
                        Bat dau hanh trinh quan ly thoi gian cua ban ngay hom nay.
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
                                <h2 className="text-2xl font-bold text-secondary-800">Tao tai khoan moi</h2>
                                <p className="text-secondary-500 mt-2">Bat dau quan ly thoi gian cua ban</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Ho ten"
                                    placeholder="Nguyen Van A"
                                    icon={User}
                                    error={errors.full_name?.message}
                                    {...register('full_name')}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="email@example.com"
                                    icon={Mail}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />

                                <div>
                                    <Input
                                        label="Mat khau"
                                        type="password"
                                        placeholder="It nhat 8 ky tu"
                                        icon={Lock}
                                        error={errors.password?.message}
                                        {...register('password')}
                                    />
                                    <PasswordStrength password={password} />
                                </div>

                                <Input
                                    label="Xac nhan mat khau"
                                    type="password"
                                    placeholder="Nhap lai mat khau"
                                    icon={Lock}
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />

                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        required
                                        className="mt-1 rounded border-secondary-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-secondary-600">
                                        Toi dong y voi <a href="#" className="text-primary hover:underline">Dieu khoan su dung</a> va{' '}
                                        <a href="#" className="text-primary hover:underline">Chinh sach bao mat</a>
                                    </span>
                                </label>

                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    Dang ky
                                </Button>
                            </form>

                            <p className="text-center mt-6 text-secondary-600">
                                Da co tai khoan?{' '}
                                <Link to="/login" className="text-primary font-medium hover:underline">
                                    Dang nhap
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
