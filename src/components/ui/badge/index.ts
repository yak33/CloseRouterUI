import { cva, type VariantProps } from 'class-variance-authority'

export { default as Badge } from './Badge.vue'

export const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 whitespace-nowrap rounded-md border',
    'px-1.5 py-0.5 text-[11px] font-medium leading-none transition-colors',
    '[&_svg]:size-3 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/12 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-muted-foreground',
        success: 'border-transparent bg-success/12 text-success',
        warning: 'border-transparent bg-warning/15 text-warning',
        destructive: 'border-transparent bg-destructive/12 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
