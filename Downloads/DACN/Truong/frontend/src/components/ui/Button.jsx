import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    {
        variants: {
            variant: {
                primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary',
                secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary',
                outline: 'border border-secondary-300 bg-transparent hover:bg-secondary-50 focus:ring-secondary',
                ghost: 'bg-transparent hover:bg-secondary-100 focus:ring-secondary',
                destructive: 'bg-error text-white hover:bg-red-600 focus:ring-error',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-4',
                lg: 'h-12 px-6 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
)

const Button = forwardRef(({
    className,
    variant,
    size,
    isLoading,
    children,
    ...props
}, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    )
})

Button.displayName = 'Button'

export { Button, buttonVariants }
