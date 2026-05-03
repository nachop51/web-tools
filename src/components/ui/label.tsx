import type { Component, ComponentProps } from 'solid-js'
import { splitProps } from 'solid-js'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import { cn } from '~/lib/utils'

const labelVariants = cva(
  'block font-medium leading-none mb-1.5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        default: 'text-sm',
        xs: 'text-xs',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

type LabelProps = ComponentProps<'label'> & VariantProps<typeof labelVariants>

const Label: Component<LabelProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'size'])
  return <label class={cn(labelVariants({ size: local.size }), local.class)} {...others} />
}

export { Label, labelVariants }
export type { LabelProps }
