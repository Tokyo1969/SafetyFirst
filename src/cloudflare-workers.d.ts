// Minimalna deklaracja modulu Workera (bez pakietu @cloudflare/workers-types).
declare module 'cloudflare:workers' {
  export function waitUntil(promise: Promise<unknown>): void
}
