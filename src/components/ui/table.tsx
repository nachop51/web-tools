import type { Component, ComponentProps } from 'solid-js'
import { createContext, splitProps, useContext } from 'solid-js'

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import { cn } from '~/lib/utils'

/**
 * Variants
 *
 * - default: standard data tables (url parser, lookup tables, etc.) — violet
 *   row hover, violet cell hover, mono cells.
 * - accent: highlighted result tables on a violet-tinted surface (compound
 *   interest schedule, etc.). The whole surface is the accent — rows hover
 *   slightly darker, dividers stay violet.
 * - form: interactive editor tables where cells host inputs/selects/buttons
 *   (fake-data editor). No hover styling, looser vertical padding, no font
 *   override on cells so form controls keep their own typography.
 */
const tableVariant = cva('w-full caption-bottom text-sm', {
  variants: {
    variant: {
      default: '',
      accent: '',
      form: '',
    },
  },
  defaultVariants: { variant: 'default' },
})

type TableVariant = NonNullable<VariantProps<typeof tableVariant>['variant']>

const TableVariantContext = createContext<TableVariant>('default')
const useTableVariant = () => useContext(TableVariantContext)

const tableHeaderVariant = cva('', {
  variants: {
    variant: {
      default: 'bg-muted/40 [&_tr]:border-b [&_tr]:transition-none [&_tr:hover]:bg-transparent',
      accent: 'bg-violet/10 [&_tr]:border-b [&_tr]:border-violet/20 [&_tr]:transition-none [&_tr:hover]:bg-transparent',
      form: '[&_tr]:border-b [&_tr]:transition-none [&_tr:hover]:bg-transparent',
    },
  },
  defaultVariants: { variant: 'default' },
})

const tableBodyVariant = cva('[&_tr:last-child]:border-0', {
  variants: {
    variant: {
      default: '',
      accent: '[&>tr]:border-violet/15',
      form: '',
    },
  },
  defaultVariants: { variant: 'default' },
})

const tableRowVariant = cva('border-b transition-colors duration-300', {
  variants: {
    variant: {
      default:
        'border-border/60 hover:bg-violet/5 hover:duration-25 data-[state=selected]:bg-violet/5 data-[state=selected]:text-foreground',
      accent: 'border-violet/15 hover:bg-violet/10 hover:duration-25',
      form: 'border-border/40 hover:bg-transparent',
    },
  },
  defaultVariants: { variant: 'default' },
})

const tableHeadVariant = cva(
  'h-auto px-3 py-2 text-left align-middle font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground [&:has([role=checkbox])]:pr-0',
  {
    variants: {
      variant: {
        default: '',
        accent: 'px-4 py-2.5',
        form: 'pb-2 pr-4 px-0 py-0 normal-case font-sans text-xs font-semibold tracking-wider',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const tableCellVariant = cva('align-middle [&:has([role=checkbox])]:pr-0', {
  variants: {
    variant: {
      default:
        'px-3 py-1.5 font-mono tabular-nums transition-colors duration-300 hover:bg-violet/10 hover:text-violet hover:duration-25',
      accent: 'px-4 py-2.5 font-mono tabular-nums',
      form: 'py-2 pr-4',
    },
  },
  defaultVariants: { variant: 'default' },
})

type TableProps = ComponentProps<'table'> & VariantProps<typeof tableVariant>

const Table: Component<TableProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'variant'])
  const variant = () => local.variant ?? 'default'
  return (
    <TableVariantContext.Provider value={variant()}>
      <div class="relative w-full overflow-auto">
        <table class={cn(tableVariant({ variant: variant() }), local.class)} {...others} />
      </div>
    </TableVariantContext.Provider>
  )
}

const TableHeader: Component<ComponentProps<'thead'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  const variant = useTableVariant()
  return <thead class={cn(tableHeaderVariant({ variant }), local.class)} {...others} />
}

const TableBody: Component<ComponentProps<'tbody'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  const variant = useTableVariant()
  return <tbody class={cn(tableBodyVariant({ variant }), local.class)} {...others} />
}

const TableFooter: Component<ComponentProps<'tfoot'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  return (
    <tfoot class={cn('bg-primary font-medium text-primary-foreground', local.class)} {...others} />
  )
}

const TableRow: Component<ComponentProps<'tr'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  const variant = useTableVariant()
  return <tr class={cn(tableRowVariant({ variant }), local.class)} {...others} />
}

const TableHead: Component<ComponentProps<'th'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  const variant = useTableVariant()
  return <th class={cn(tableHeadVariant({ variant }), local.class)} {...others} />
}

const TableCell: Component<ComponentProps<'td'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  const variant = useTableVariant()
  return <td class={cn(tableCellVariant({ variant }), local.class)} {...others} />
}

const TableCaption: Component<ComponentProps<'caption'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])
  return <caption class={cn('mt-4 text-sm text-muted-foreground', local.class)} {...others} />
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
