import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Calendar, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { authService } from '@/services/authService'
import { useToast } from '@/components/ui/Toast'

const emailSchema = z.object({
    email: z.string().email('Email khong hop le'),
})

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP phai co 6 so'),
})

const passwordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Mat khau it nhat 8 ky tu')
        .regex(/[A-Z]/, 'Can it nhat 1 chu hoa')
        .regex(/[a-z]/, 'Can it nhat 1 chu thuong')
        .regex(/[0-9]/, 'Can it nhat 1 so'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mat khau xac nhan khong khop',
    path: ['confirmPassword'],
})

export default function ForgotPassword() {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const navigate = useNavigate()
    const toast = useToast()

    const emailForm = useForm({ resolver: zodResolver(emailSchema) })
    const otpForm = useForm({ resolver: zodResolver(otpSchema) })
    const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleSendOTP = async (data) => {
        setIsLoading(true)
        try {
            const response = await authService.forgotPassword(data.email)
            if (response.success) {
                setEmail(data.email)
                setStep(2)
                startCountdown()
                toast.success('Ma OTP da duoc gui den email cua ban')
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Co loi xay ra')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOTP = async (data) => {
        setIsLoading(true)
        try {
            const response = await authService.verifyOTP(email, data.otp)
            if (response.success) {
                setOtp(data.otp)
                setStep(3)
                toast.success('OTP hop le')
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP khong hop le')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (data) => {
        setIsLoading(true)
        try {
            const response = await authService.resetPassword(email, otp, data.newPassword)
            if (response.success) {
                setStep(4)
                toast.success('Mat khau da duoc cap nhat')
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Co loi xay ra')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOTP = async () => {
        if (countdown > 0) return
        await handleSendOTP({ email })
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-secondary-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Calendar className="h-12 w-12 mx-auto text-primary mb-2" />
                    <h1 className="text-2xl font-bold text-primary">Schedule App</h1>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= s ? 'bg-primary text-white' : 'bg-secondary-200 text-secondary-500'}`}
                            >
                                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-12 h-1 ${step > s ? 'bg-primary' : 'bg-secondary-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <Card>
                    <CardContent className="p-8">
                        {step === 1 && (
                            <>
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-secondary-800">Quen mat khau?</h2>
                                    <p className="text-secondary-500 mt-2">Nhap email de nhan ma xac nhan</p>
                                </div>
                                <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-5">
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="email@example.com"
                                        icon={Mail}
                                        error={emailForm.formState.errors.email?.message}
                                        {...emailForm.register('email')}
                                    />
                                    <Button type="submit" className="w-full" isLoading={isLoading}>
                                        Gui ma xac nhan
                                    </Button>
                                </form>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-secondary-800">Nhap ma OTP</h2>
                                    <p className="text-secondary-500 mt-2">Ma da duoc gui den {email}</p>
                                </div>
                                <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-5">
                                    <Input
                                        label="Ma OTP"
                                        placeholder="Nhap 6 so"
                                        maxLength={6}
                                        error={otpForm.formState.errors.otp?.message}
                                        {...otpForm.register('otp')}
                                    />
                                    <Button type="submit" className="w-full" isLoading={isLoading}>
                                        Xac nhan
                                    </Button>
                                    <p className="text-center text-sm text-secondary-500">
                                        Chua nhan duoc ma?{' '}
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={countdown > 0}
                                            className={`font-medium ${countdown > 0 ? 'text-secondary-400' : 'text-primary hover:underline'}`}
                                        >
                                            Gui lai {countdown > 0 && `(${countdown}s)`}
                                        </button>
                                    </p>
                                </form>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-secondary-800">Dat lai mat khau</h2>
                                    <p className="text-secondary-500 mt-2">Tao mat khau moi cho tai khoan</p>
                                </div>
                                <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-5">
                                    <Input
                                        label="Mat khau moi"
                                        type="password"
                                        placeholder="It nhat 8 ky tu"
                                        icon={Lock}
                                        error={passwordForm.formState.errors.newPassword?.message}
                                        {...passwordForm.register('newPassword')}
                                    />
                                    <Input
                                        label="Xac nhan mat khau"
                                        type="password"
                                        placeholder="Nhap lai mat khau"
                                        icon={Lock}
                                        error={passwordForm.formState.errors.confirmPassword?.message}
                                        {...passwordForm.register('confirmPassword')}
                                    />
                                    <Button type="submit" className="w-full" isLoading={isLoading}>
                                        Cap nhat mat khau
                                    </Button>
                                </form>
                            </>
                        )}

                        {step === 4 && (
                            <div className="text-center py-8">
                                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-secondary-800 mb-2">Thanh cong!</h2>
                                <p className="text-secondary-500 mb-6">Mat khau cua ban da duoc cap nhat</p>
                                <Button onClick={() => navigate('/login')} className="w-full">
                                    Dang nhap ngay
                                </Button>
                            </div>
                        )}

                        {step < 4 && (
                            <div className="mt-6 text-center">
                                <Link to="/login" className="inline-flex items-center text-sm text-secondary-500 hover:text-primary">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Quay lai dang nhap
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
