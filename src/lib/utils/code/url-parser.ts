export type ParsedUrl = {
  protocol: string
  username: string
  password: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  params: Record<string, string>
}

export function parseUrl(url: string): ParsedUrl {
  const u = new URL(url)
  const params: Record<string, string> = {}
  u.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return {
    protocol: u.protocol,
    username: u.username,
    password: u.password,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    params,
  }
}

export function buildUrl(parts: Partial<ParsedUrl>): string {
  const u = new URL('http://placeholder')
  if (parts.protocol) u.protocol = parts.protocol
  if (parts.username) u.username = parts.username
  if (parts.password) u.password = parts.password
  if (parts.hostname) u.hostname = parts.hostname
  if (parts.port !== undefined) u.port = parts.port
  if (parts.pathname) u.pathname = parts.pathname
  if (parts.search) u.search = parts.search
  if (parts.hash) u.hash = parts.hash
  if (parts.params) {
    Object.entries(parts.params).forEach(([k, v]) => u.searchParams.set(k, v))
  }
  return u.toString()
}
