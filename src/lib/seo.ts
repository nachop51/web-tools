import type { Tool, Category, CategoryId } from "~/lib/tools/registry";
import { tools, toolsByCategory } from "~/lib/tools/registry";

const DOMAIN = "https://tools.nachop.dev";

export type MetaProps = {
  title: string;
  description: string;
  canonical?: string;
  schema?: Record<string, unknown>;
};

export function setPageMeta(props: MetaProps) {
  if (typeof window === "undefined") return;

  const canonical = props.canonical || `${DOMAIN}/`;
  document.title = props.title;

  const updateMeta = (name: string, content: string, isProperty: boolean) => {
    const attr = isProperty ? "property" : "name";
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  updateMeta("description", props.description, false);
  updateMeta("og:title", props.title, true);
  updateMeta("og:description", props.description, true);
  updateMeta("og:url", canonical, true);
  updateMeta("og:type", "website", true);
  updateMeta("twitter:card", "summary_large_image", false);
  updateMeta("twitter:title", props.title, false);
  updateMeta("twitter:description", props.description, false);

  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", canonical);

  if (props.schema) {
    let script = document.getElementById("schema-markup");
    if (!script) {
      script = document.createElement("script");
      script.id = "schema-markup";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(props.schema);
  }
}

export function getHomeMeta() {
  return {
    title: "web-tools | Fast, browser-native utilities for developers",
    description:
      "Fast, browser-native utilities for everyday dev work. No installs, no accounts, no tracking.",
    canonical: `${DOMAIN}/`,
  };
}

export function getCategoryMeta(category: Category) {
  return {
    title: `${category.name} | web-tools`,
    description: category.description,
    canonical: `${DOMAIN}${category.href}`,
  };
}

export function getToolMeta(tool: Tool) {
  return {
    title: `${tool.name} | web-tools`,
    description: tool.description,
    canonical: `${DOMAIN}${tool.href}`,
    schema: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.name,
      description: tool.description,
      applicationCategory: "Utility",
      url: `${DOMAIN}${tool.href}`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  };
}

export function getCategoryIndexSchema(category: Category, tools: Tool[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `${DOMAIN}${category.href}`,
    isPartOf: {
      "@type": "WebSite",
      name: "web-tools",
      url: DOMAIN,
    },
    mainEntity: tools.map((tool) => ({
      "@type": "SoftwareApplication",
      name: tool.name,
      description: tool.description,
      url: `${DOMAIN}${tool.href}`,
    })),
  };
}

export function getHomepageSchema(categories: Category[], totalTools: number) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "web-tools",
    url: DOMAIN,
    description:
      "Fast, browser-native utilities for everyday dev work. No installs, no accounts, no tracking.",
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "web-tools",
      description: "Collection of developer utilities",
      url: DOMAIN,
      applicationCategory: "Utility",
    },
  };
}

export function setToolPageMeta(categoryId: CategoryId, toolSlug: string) {
  const tool = tools.find((t) => t.category === categoryId && t.slug === toolSlug);
  if (tool) {
    setPageMeta(getToolMeta(tool));
  }
}
