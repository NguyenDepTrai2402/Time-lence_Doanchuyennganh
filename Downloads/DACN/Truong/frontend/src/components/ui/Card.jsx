import { cn } from '@/utils/cn'

function Card({ className, ...props }) {
    return (
        <div
            className={cn(
                'bg-white rounded-lg border border-secondary-200 shadow-card',
                className
            )}
            {...props}
        />
    )
}

function CardHeader({ className, ...props }) {
    return (
        <div
            className={cn('px-6 py-4 border-b border-secondary-200', className)}
            {...props}
        />
    )
}

function CardTitle({ className, ...props }) {
    return (
        <h3
            className={cn('text-lg font-semibold text-secondary-800', className)}
            {...props}
        />
    )
}

function CardDescription({ className, ...props }) {
    return (
        <p
            className={cn('text-sm text-secondary-500 mt-1', className)}
            {...props}
        />
    )
}

function CardContent({ className, ...props }) {
    return (
        <div className={cn('px-6 py-4', className)} {...props} />
    )
}

function CardFooter({ className, ...props }) {
    return (
        <div
            className={cn('px-6 py-4 border-t border-secondary-200 bg-secondary-50', className)}
            {...props}
        />
    )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
