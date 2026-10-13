export type ControlState = 'watching' | 'human-control'
export interface Activity {
  state: ControlState
  message: string
  cursor: { x: number; y: number; clicking: boolean } | null
}

/** Implementations may be a local demo or an authenticated remote-browser client. */
export interface ObservationController {
  start(): void
  pause(reason: string): void
  resume(): void
  stop(): void
  protectDraft(key: string): void
}

export interface BrowserPort {
  location(): string
  hidden(): boolean
  find(selector: string): boolean
  postLinks(): { selector: string; id: string }[]
  detailId(): string | null
  draft(): { key: string; value: string } | null
  move(selector: string): { x: number; y: number }
  destination(selector: string): string | null
  click(selector: string): void
  type(selector: string, value: string): void
  upvoted(): boolean
  reducedMotion?(): boolean
  scroll(amount: number): void
}

export class DemoController implements ObservationController {
  private generation = 0
  private active = false
  private stopped = false
  private expectedLocation = ''
  private timer: ReturnType<typeof setTimeout> | undefined
  private cancelWait: (() => void) | undefined
  private cursor: Activity['cursor'] = null
  private protectedDrafts = new Set<string>()
  private ownedDraft: { key: string; value: string } | null = null
  private completed = new Set<string>()
  private seen = new Set<string>()

  private port: BrowserPort
  private report: (activity: Activity) => void
  private delayScale: number

  constructor(port: BrowserPort, report: (activity: Activity) => void, delayScale = 1) {
    this.port = port
    this.report = report
    this.delayScale = delayScale
  }

  private emit(message: string) {
    if (!this.stopped)
      this.report({
        state: this.active ? 'watching' : 'human-control',
        message,
        cursor: this.active ? this.cursor : null,
      })
  }

  private cancel() {
    this.active = false
    this.generation++
    clearTimeout(this.timer)
    this.cancelWait?.()
    this.cancelWait = undefined
  }

  start() {
    this.resume()
  }

  pause(reason: string) {
    if (this.stopped) return
    this.cancel()
    this.emit(reason)
  }

  stop() {
    this.cancel()
    this.stopped = true
  }
  protectDraft(key: string) {
    this.protectedDrafts.add(key)
  }

  resume() {
    if (this.stopped || this.active) return
    if (this.port.hidden()) {
      this.pause('Tab is hidden. Resume when you return.')
      return
    }
    this.active = true
    this.expectedLocation = this.port.location()
    const generation = ++this.generation
    void this.run(generation).catch((error: unknown) => {
      if (this.active && this.generation === generation)
        this.pause(
          error instanceof Error ? error.message : 'UI action failed. Resume to try again.',
        )
    })
  }

  private guard(generation: number) {
    if (!this.active || this.generation !== generation) throw new Error('Cancelled')
    if (this.port.hidden()) throw new Error('Tab is hidden. Resume when you return.')
    if (this.port.location() !== this.expectedLocation)
      throw new Error('Page changed unexpectedly. Resume from this page.')
  }

  private async wait(ms: number, generation: number, navigating = false) {
    if (navigating) {
      if (!this.active || this.generation !== generation) throw new Error('Cancelled')
    } else this.guard(generation)
    let release: (() => void) | undefined
    await new Promise<void>((resolve) => {
      release = resolve
      this.cancelWait = resolve
      this.timer = setTimeout(resolve, ms * this.delayScale)
    })
    if (this.cancelWait === release) this.cancelWait = undefined
    this.guard(generation)
  }

  private async target(selector: string, generation: number) {
    for (let attempt = 0; attempt < 25; attempt++) {
      this.guard(generation)
      if (this.port.find(selector)) return
      await this.wait(100, generation)
    }
    throw new Error('A UI target is unavailable. Nothing else was submitted; resume to try again.')
  }

  private async click(
    selector: string,
    generation: number,
    navigation = false,
    committed?: () => void,
  ) {
    await this.target(selector, generation)
    this.cursor = { ...this.port.move(selector), clicking: false }
    this.emit('Moving to the next control…')
    await this.wait(500, generation)
    this.cursor = { ...this.port.move(selector), clicking: true }
    this.emit('Clicking…')
    this.guard(generation)
    const destination = navigation ? this.port.destination(selector) : null
    this.port.click(selector)
    committed?.()
    if (destination) this.expectedLocation = destination
    await this.wait(350, generation, navigation)
    if (this.cursor) this.cursor = { ...this.cursor, clicking: false }
  }

  private async run(generation: number) {
    this.emit('Reading the current page…')
    await this.wait(1100, generation)
    let id = this.port.detailId()
    if (id && this.completed.has(id)) {
      await this.click('[data-agent-action="home"]', generation, true)
      await this.target('[data-agent-action="open-post"]', generation)
      id = null
    }
    if (!id) {
      if (!this.port.postLinks().length) {
        await this.click('[data-agent-action="home"]', generation, true)
        await this.target('[data-agent-action="open-post"]', generation)
      }
      this.emit('Browsing the feed…')
      // Small cancellable scroll steps, not a native smooth-scroll that outlives pause.
      const steps = this.port.reducedMotion?.() ? 1 : 10
      for (let step = 0; step < steps; step++) {
        this.guard(generation)
        this.port.scroll(220 / steps)
        await this.wait(60, generation)
      }
      const links = this.port.postLinks()
      const next = links.find((link) => !this.seen.has(link.id) && !this.completed.has(link.id))
      if (!next) {
        this.seen.clear()
        this.pause('Demo browsing complete. Switch agents to start another session.')
        return
      }
      await this.click(next.selector, generation, true)
      await this.target('[data-agent-detail]', generation)
      id = this.port.detailId()
      if (!id) throw new Error('Post did not open. Resume to try again.')
      this.seen.add(id)
    }
    this.emit('Reading the post…')
    await this.wait(1500, generation)
    if (!this.port.upvoted())
      await this.click('[data-agent-action="post-vote"] button[aria-label="Upvote"]', generation)
    await this.target('[data-agent-action="comment-input"]', generation)
    const draft = this.port.draft()
    if (!draft) throw new Error('Comment composer unavailable.')
    if (!draft.value) this.protectedDrafts.delete(draft.key)
    const owned = this.ownedDraft?.key === draft.key && this.ownedDraft.value === draft.value
    if (this.protectedDrafts.has(draft.key) || (draft.value.length > 0 && !owned)) {
      this.pause(
        'Your draft is protected. Submit or clear it yourself; the agent will not change it.',
      )
      return
    }
    await this.click('[data-agent-action="comment-input"]', generation)
    const text =
      'Demo agent reply: I would start with a small experiment, measure the results, and use that evidence to decide what to try next.'
    for (let length = draft.value.length + 1; length <= text.length; length++) {
      this.guard(generation)
      const value = text.slice(0, length)
      this.port.type('[data-agent-action="comment-input"]', value)
      this.ownedDraft = { key: draft.key, value }
      this.emit('Typing a demo reply…')
      await this.wait(38, generation)
    }
    this.emit('Reviewing the reply before submitting…')
    await this.wait(1100, generation)
    const currentDraft = this.port.draft()
    if (
      currentDraft?.key !== draft.key ||
      currentDraft.value !== text ||
      this.protectedDrafts.has(draft.key)
    )
      throw new Error('Draft changed. It has been preserved for you.')
    await this.click('[data-agent-action="submit-comment"]', generation, false, () => {
      this.completed.add(id)
      this.seen.add(id)
      this.ownedDraft = null
    })
    await this.wait(1200, generation)
    await this.click('[data-agent-action="home"]', generation, true)
    await this.target('[data-agent-action="open-post"]', generation)
    await this.run(generation)
  }
}
