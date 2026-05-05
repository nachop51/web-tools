import type { JSX, ValidComponent } from 'solid-js'
import { splitProps } from 'solid-js'

import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import * as RadioGroupPrimitive from '@kobalte/core/radio-group'

import { cn } from '~/lib/utils'

type RadioGroupRootProps<T extends ValidComponent = 'div'> = RadioGroupPrimitive.RadioGroupRootProps<T> & {
  class?: string | undefined
}

const RadioGroup = <T extends ValidComponent = 'div'>(props: PolymorphicProps<T, RadioGroupRootProps<T>>) => {
  const [local, others] = splitProps(props as RadioGroupRootProps, ['class'])
  return <RadioGroupPrimitive.Root class={cn('grid gap-2', local.class)} {...others} />
}

type RadioGroupItemProps<T extends ValidComponent = 'div'> = RadioGroupPrimitive.RadioGroupItemProps<T> & {
  class?: string | undefined
  children?: JSX.Element
}

const RadioGroupItem = <T extends ValidComponent = 'div'>(props: PolymorphicProps<T, RadioGroupItemProps<T>>) => {
  const [local, others] = splitProps(props as RadioGroupItemProps, ['class', 'children'])
  return (
    <RadioGroupPrimitive.Item class={cn('flex items-center space-x-2', local.class)} {...others}>
      <RadioGroupPrimitive.ItemInput />
      <RadioGroupPrimitive.ItemControl class="aspect-square size-4 cursor-pointer rounded-full border border-primary text-primary ring-offset-background transition-[transform,box-shadow,border-color] duration-150 ease-out hover:scale-110 hover:shadow-[0_0_0_4px_color-mix(in_oklch,var(--color-primary)_15%,transparent)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:scale-100">
        <RadioGroupPrimitive.ItemIndicator class="flex h-full items-center justify-center ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-2.5 fill-current text-current"
          >
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          </svg>
        </RadioGroupPrimitive.ItemIndicator>
      </RadioGroupPrimitive.ItemControl>
      {local.children}
    </RadioGroupPrimitive.Item>
  )
}

type RadioGroupLabelProps<T extends ValidComponent = 'label'> = RadioGroupPrimitive.RadioGroupLabelProps<T> & {
  class?: string | undefined
}

const RadioGroupItemLabel = <T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, RadioGroupLabelProps<T>>
) => {
  const [local, others] = splitProps(props as RadioGroupLabelProps, ['class'])
  return (
    <RadioGroupPrimitive.ItemLabel
      class={cn(
        'cursor-pointer text-sm font-medium leading-none transition-colors hover:text-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        local.class
      )}
      {...others}
    />
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupItemLabel }
