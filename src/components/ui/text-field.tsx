import type { ValidComponent } from 'solid-js'
import { mergeProps, onMount, splitProps } from 'solid-js'

import type { PolymorphicProps } from '@kobalte/core'
import * as TextFieldPrimitive from '@kobalte/core/text-field'
import { cva } from 'class-variance-authority'

import { cn } from '~/lib/utils'

type TextFieldRootProps<T extends ValidComponent = 'div'> = TextFieldPrimitive.TextFieldRootProps<T> & {
  class?: string | undefined
  warning?: boolean
}

const TextField = <T extends ValidComponent = 'div'>(props: PolymorphicProps<T, TextFieldRootProps<T>>) => {
  const [local, others] = splitProps(props as TextFieldRootProps, ['class', 'warning'])
  return (
    <TextFieldPrimitive.Root
      class={cn('group/textfield flex flex-col gap-2', local.class)}
      data-warning={local.warning ? 'true' : undefined}
      {...others}
    />
  )
}

type TextFieldInputProps<T extends ValidComponent = 'input'> = TextFieldPrimitive.TextFieldInputProps<T> & {
  class?: string | undefined
  type?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week'
}

const TextFieldInput = <T extends ValidComponent = 'input'>(rawProps: PolymorphicProps<T, TextFieldInputProps<T>>) => {
  const props = mergeProps<TextFieldInputProps<T>[]>({ type: 'text' }, rawProps)
  const [local, others] = splitProps(props as TextFieldInputProps, ['type', 'class'])
  return (
    <TextFieldPrimitive.Input
      type={local.type}
      class={cn(
        'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 hover:border-violet/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-error-foreground data-[invalid]:text-error-foreground group-data-[warning]/textfield:border-warning-foreground/70 group-data-[warning]/textfield:hover:border-warning-foreground/70 group-data-[warning]/textfield:focus-visible:ring-warning-foreground/50',
        local.class
      )}
      {...others}
    />
  )
}

type TextFieldTextAreaProps<T extends ValidComponent = 'textarea'> = TextFieldPrimitive.TextFieldTextAreaProps<T> & {
  class?: string | undefined
}

const TextFieldTextArea = <T extends ValidComponent = 'textarea'>(
  props: PolymorphicProps<T, TextFieldTextAreaProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldTextAreaProps & { ref?: HTMLTextAreaElement | ((el: HTMLTextAreaElement) => void) }, ['class', 'ref'])
  let el: HTMLTextAreaElement | undefined
  // Kobalte+Polymorphic sets `value` as an attribute, which a textarea ignores;
  // only the inner text controls displayed content. Sync the attribute to `.value`
  // on mount so initial values from URL params actually show.
  onMount(() => {
    if (!el) return
    const attr = el.getAttribute('value')
    if (attr && el.value !== attr) el.value = attr
  })
  return (
    <TextFieldPrimitive.TextArea
      {...others}
      class={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 hover:border-violet/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        local.class
      )}
      ref={(element: HTMLTextAreaElement) => {
        el = element
        const userRef = local.ref
        if (typeof userRef === 'function') (userRef as (el: HTMLTextAreaElement) => void)(element)
      }}
    />
  )
}

const labelVariants = cva(
  'text-sm font-medium leading-none mb-1.5 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        label: 'data-[invalid]:text-destructive',
        description: 'font-normal text-muted-foreground',
        error: 'text-xs text-destructive',
        warning: 'text-xs text-warning-foreground',
      },
    },
    defaultVariants: {
      variant: 'label',
    },
  }
)

type TextFieldLabelProps<T extends ValidComponent = 'label'> = TextFieldPrimitive.TextFieldLabelProps<T> & {
  class?: string | undefined
}

const TextFieldLabel = <T extends ValidComponent = 'label'>(props: PolymorphicProps<T, TextFieldLabelProps<T>>) => {
  const [local, others] = splitProps(props as TextFieldLabelProps, ['class'])
  return <TextFieldPrimitive.Label class={cn(labelVariants(), local.class)} {...others} />
}

type TextFieldDescriptionProps<T extends ValidComponent = 'div'> = TextFieldPrimitive.TextFieldDescriptionProps<T> & {
  class?: string | undefined
}

const TextFieldDescription = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldDescriptionProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldDescriptionProps, ['class'])
  return (
    <TextFieldPrimitive.Description class={cn(labelVariants({ variant: 'description' }), local.class)} {...others} />
  )
}

type TextFieldErrorMessageProps<T extends ValidComponent = 'div'> = TextFieldPrimitive.TextFieldErrorMessageProps<T> & {
  class?: string | undefined
}

const TextFieldErrorMessage = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>
) => {
  const [local, others] = splitProps(props as TextFieldErrorMessageProps, ['class'])
  return <TextFieldPrimitive.ErrorMessage class={cn(labelVariants({ variant: 'error' }), local.class)} {...others} />
}

type TextFieldWarningMessageProps = {
  class?: string
  children?: import('solid-js').JSX.Element
}

const TextFieldWarningMessage = (props: TextFieldWarningMessageProps) => {
  const [local, others] = splitProps(props, ['class', 'children'])
  return (
    <p class={cn(labelVariants({ variant: 'warning' }), local.class)} {...others}>
      {local.children}
    </p>
  )
}

export {
  TextField,
  TextFieldInput,
  TextFieldTextArea,
  TextFieldLabel,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldWarningMessage,
}
