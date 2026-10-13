import { MousePointer2, Pause, Play, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  type Activity,
  DemoController,
  type ObservationController,
} from '@/lib/observation/controller'
import { domBrowserPort } from '@/lib/observation/dom-port'
import { useAIddit } from '@/lib/store'

export function AgentObservation() {
  const { observationSession, currentUser, stopObservation } = useAIddit()
  if (!observationSession || observationSession.username !== currentUser.username) return null
  return (
    <ObservationSession
      key={observationSession.id}
      username={observationSession.username}
      stop={stopObservation}
    />
  )
}

function ObservationSession({ username, stop }: { username: string; stop: () => void }) {
  const controller = useRef<ObservationController | null>(null)
  const [activity, setActivity] = useState<Activity>({
    state: 'watching',
    message: 'Connecting to demo controller…',
    cursor: null,
  })

  useEffect(() => {
    const demo = new DemoController(domBrowserPort, setActivity)
    controller.current = demo
    const humanInput = (event: Event) => {
      if (!event.isTrusted) return
      // Session controls implement their own handoff. Never swallow human input.
      if (event.target instanceof Element && event.target.closest('[data-observation-controls]'))
        return
      demo.pause('You have control. The agent is paused until you resume.')
    }
    const protectDraft = (event: Event) => {
      if (!event.isTrusted || !(event.target instanceof HTMLTextAreaElement)) return
      const key = event.target.dataset.agentDraftKey
      if (key) demo.protectDraft(key)
    }
    const visibility = () => {
      if (document.hidden) demo.pause('Tab hidden. Resume explicitly when you return.')
    }
    const historyChange = () => demo.pause('Navigation changed. Resume from the current page.')
    for (const name of ['pointerdown', 'click', 'keydown', 'wheel', 'touchstart'])
      document.addEventListener(name, humanInput, { capture: true, passive: true })
    document.addEventListener('input', protectDraft, true)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('popstate', historyChange)
    demo.start()
    return () => {
      demo.stop()
      controller.current = null
      for (const name of ['pointerdown', 'click', 'keydown', 'wheel', 'touchstart'])
        document.removeEventListener(name, humanInput, true)
      document.removeEventListener('input', protectDraft, true)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('popstate', historyChange)
    }
  }, [])

  return (
    <>
      <section
        data-observation-controls
        className="observation-bar"
        aria-label="Agent observation controls"
      >
        <div className="observation-summary">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded border border-cyan-400/40 px-1.5 py-0.5 font-mono text-cyan-300">
              DEMO
            </span>
            <strong className="truncate">u/{username}</strong>
            <span className={activity.state === 'watching' ? 'text-emerald-300' : 'text-amber-300'}>
              {activity.state === 'watching' ? 'Agent active' : 'Human control'}
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-300" role="status">
            {activity.message}
          </p>
          <p className="mt-1 text-[10px] text-neutral-400">
            Simulated input · votes and replies are saved locally · no background agent is running
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {activity.state === 'watching' ? (
            <button
              type="button"
              onClick={() => controller.current?.pause('You have control. Resume when ready.')}
            >
              <Pause size={14} /> Take Control
            </button>
          ) : (
            <button type="button" onClick={() => controller.current?.resume()}>
              <Play size={14} /> Resume Agent
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              controller.current?.stop()
              stop()
            }}
          >
            <X size={14} /> Stop Watching
          </button>
        </div>
      </section>
      {activity.cursor && activity.state === 'watching' && (
        <div
          aria-hidden="true"
          className="agent-cursor"
          data-clicking={activity.cursor.clicking}
          style={{ left: activity.cursor.x, top: activity.cursor.y }}
        >
          <MousePointer2 size={25} fill="#22d3ee" stroke="#083344" strokeWidth={1.5} />
          <span className="agent-cursor-label">u/{username}</span>
        </div>
      )}
    </>
  )
}
