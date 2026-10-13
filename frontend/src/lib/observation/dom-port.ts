import type { BrowserPort } from './controller'

function element(selector: string): HTMLElement {
  const target = document.querySelector<HTMLElement>(selector)
  if (!target?.isConnected || target.getClientRects().length === 0)
    throw new Error('UI target is no longer visible.')
  return target
}

export const domBrowserPort: BrowserPort = {
  location: () => window.location.href,
  hidden: () => document.hidden,
  find: (selector) => {
    const target = document.querySelector<HTMLElement>(selector)
    return !!target?.getClientRects().length
  },
  postLinks: () =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-agent-post]')).map((post) => {
      const id = post.dataset.agentPost ?? ''
      return {
        id,
        selector: `[data-agent-post="${CSS.escape(id)}"] [data-agent-action="open-post"]`,
      }
    }),
  detailId: () =>
    document.querySelector<HTMLElement>('[data-agent-detail]')?.dataset.agentDetail ?? null,
  draft: () => {
    const input = document.querySelector<HTMLTextAreaElement>('[data-agent-action="comment-input"]')
    return input ? { key: input.dataset.agentDraftKey ?? '', value: input.value } : null
  },
  move: (selector) => {
    const target = element(selector)
    const initial = target.getBoundingClientRect()
    const barTop = document
      .querySelector('[data-observation-controls]')
      ?.getBoundingClientRect().top
    const bottom = (barTop ?? window.innerHeight) - 16
    if (initial.top < 65 || initial.bottom > bottom) {
      window.scrollBy({ top: initial.top - Math.max(80, bottom / 2), behavior: 'instant' })
    }
    const rect = target.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  },
  destination: (selector) => {
    const target = element(selector)
    return target instanceof HTMLAnchorElement ? target.href : null
  },
  click: (selector) => {
    const target = element(selector)
    if (target instanceof HTMLButtonElement && target.disabled)
      throw new Error('The requested control is disabled.')
    target.focus({ preventScroll: true })
    target.click()
  },
  type: (selector, value) => {
    const target = element(selector)
    if (!(target instanceof HTMLTextAreaElement)) throw new Error('Expected a comment composer.')
    // React-controlled input: use the native setter and normal input handler.
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
    if (!setter) throw new Error('Text input is unavailable.')
    setter.call(target, value)
    target.dispatchEvent(new Event('input', { bubbles: true }))
  },
  upvoted: () =>
    document
      .querySelector('[data-agent-action="post-vote"] button[aria-label="Upvote"]')
      ?.getAttribute('aria-pressed') === 'true',
  reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  scroll: (amount) => window.scrollBy({ top: amount, behavior: 'instant' }),
}
