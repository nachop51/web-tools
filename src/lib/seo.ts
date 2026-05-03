import { useHead } from '@solidjs/meta'
import { createEffect, createUniqueId } from 'solid-js'
import { isServer } from 'solid-js/web'
import type { Tool, Category, CategoryId } from '~/lib/tools/registry'
import { tools } from '~/lib/tools/registry'

const DOMAIN = 'https://tools.nachop.dev'

export type MetaProps = {
  title: string
  description: string
  canonical?: string
  schema?: Record<string, unknown>
}

type HeadTag = {
  tag: string
  props: Record<string, unknown>
  close?: boolean
  name?: string
}

function head(t: HeadTag) {
  useHead({
    tag: t.tag,
    props: t.props,
    setting: { close: t.close, escape: true },
    id: createUniqueId(),
    get name() {
      return t.name
    },
  })
}

export function setPageMeta(props: MetaProps) {
  const canonical = props.canonical || `${DOMAIN}/`

  head({ tag: 'title', props: { children: props.title }, close: true })
  head({ tag: 'meta', props: { name: 'description', content: props.description }, name: 'description' })
  head({ tag: 'meta', props: { property: 'og:title', content: props.title }, name: 'og:title' })
  head({ tag: 'meta', props: { property: 'og:description', content: props.description }, name: 'og:description' })
  head({ tag: 'meta', props: { property: 'og:url', content: canonical }, name: 'og:url' })
  head({ tag: 'meta', props: { property: 'og:type', content: 'website' }, name: 'og:type' })
  head({ tag: 'meta', props: { name: 'twitter:card', content: 'summary_large_image' }, name: 'twitter:card' })
  head({ tag: 'meta', props: { name: 'twitter:title', content: props.title }, name: 'twitter:title' })
  head({ tag: 'meta', props: { name: 'twitter:description', content: props.description }, name: 'twitter:description' })
  head({ tag: 'link', props: { rel: 'canonical', href: canonical } })

  // JSON-LD schema: useHead does not handle script tag content reliably.
  // Inject client-side only; modern crawlers execute JS and will pick it up.
  if (props.schema && !isServer) {
    createEffect(() => {
      const json = JSON.stringify(props.schema!)
      let script = document.getElementById('schema-markup') as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.id = 'schema-markup'
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = json
    })
  }
}

export function getHomeMeta() {
  return {
    title: 'web-tools | Fast, browser-native utilities for developers',
    description: 'Fast, browser-native utilities for everyday dev work. No installs, no accounts, no tracking.',
    canonical: `${DOMAIN}/`,
  }
}

export function getCategoryMeta(category: Category) {
  return {
    title: `${category.name} | web-tools`,
    description: category.description,
    canonical: `${DOMAIN}${category.href}`,
  }
}

export function getToolMeta(tool: Tool) {
  return {
    title: `${tool.name} | web-tools`,
    description: tool.description,
    canonical: `${DOMAIN}${tool.href}`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      applicationCategory: 'Utility',
      url: `${DOMAIN}${tool.href}`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  }
}

export function getCategoryIndexSchema(category: Category, tools: Tool[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `${DOMAIN}${category.href}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'web-tools',
      url: DOMAIN,
    },
    mainEntity: tools.map((tool) => ({
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: `${DOMAIN}${tool.href}`,
    })),
  }
}

export function getHomepageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'web-tools',
    url: DOMAIN,
    description: 'Fast, browser-native utilities for everyday dev work. No installs, no accounts, no tracking.',
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'web-tools',
      description: 'Collection of developer utilities',
      url: DOMAIN,
      applicationCategory: 'Utility',
    },
  }
}

export function setToolPageMeta(categoryId: CategoryId, toolSlug: string) {
  const tool = tools.find((t) => t.category === categoryId && t.slug === toolSlug)
  if (tool) {
    setPageMeta(getToolMeta(tool))
  }
}
