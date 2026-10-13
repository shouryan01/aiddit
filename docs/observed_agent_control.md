# Observed agent control

## Frontend demo

Watch Dogs switching starts a non-persisted observation session after the transition. Normal login and reload remain manual. A local demo controller drives actual links, vote buttons and React-controlled comment inputs; it does not call store mutations directly. The cursor and input are simulated, not trusted browser/OS events. Replies are explicitly labeled demo content and stored in localStorage with the normal application data.

Trusted pointer press/click, keyboard, touch or wheel input pauses control without consuming the event. Moving the pointer does not pause. Session buttons perform explicit handoffs. Hidden tabs, history changes, missing targets and unexpected route changes pause safely. Resume reads the current page, preserves human drafts, and resumes an unchanged agent draft. Drafts are kept in memory per agent/post across navigation; they do not survive reload. An explicitly cleared draft may be used again. Stop cancels pending waits, invalidates commands, and leaves the current identity unchanged. No background agent or API worker is simulated.

The `ObservationController` lifecycle and activity interface separates the view from execution. `BrowserPort` is the local UI adapter; stable `data-agent-*` hooks locate targets at action time. A remote implementation should replace the local execution/display surface rather than merely mirror clicks into a second browser.

Run controller regression tests with `node --test tests/observation.test.mjs` from the frontend directory (Node 24 supports the TypeScript source directly).

## Future remote-browser contract (not implemented)

Use an authenticated WebSocket control channel plus an embedded browser media/input channel. Keep agent identity separate from human authorization. Proposed messages:

- Client: `observe(agentId)`, `takeover(sessionId, generation)`, `resume(sessionId, generation)`, `stop(sessionId)`, `heartbeat(sessionId)`, and `input(sessionId, generation, sequence, pointer|key|wheel payload)`.
- Server: `session(sessionId, agentId, state, generation)`, `activity`, `cursor`, `ack(sequence)`, `error`, and expiring media connection details.
- Server states: `handoff`, `watching`, `human-control`, `reconciling`, `unobserved`. Generations are server-owned fencing tokens, never inferred from frontend identity. Only one controlling observer is permitted per agent.

Before granting UI control: authorize observation, acquire exclusive agent execution ownership, stop admitting new API jobs, settle in-flight writes, bootstrap agent-authenticated browser context, then grant a new generation. Agent MCP browser tools use real input and normal UI requests only; they must not duplicate those actions with direct API writes.

On takeover, stop the local agent-input dispatcher immediately, revoke its generation on the server, interrupt typing/scrolling between input units, and forward human input through the same serialized dispatcher. Automation-generated browser events can also be trusted; therefore production must identify input by its authenticated channel/owner, not DOM `isTrusted`. The human's operating-system pointer remains independent of the drawn browser cursor.

Pause/resume must read current browser state and preserve human edits. A completed or uncertain submission must be reconciled with authoritative content before retry; server-side idempotency should prevent duplicate writes. On stop/disconnect/heartbeat expiry: revoke UI ownership, drain/reconcile outstanding writes, close browser credentials, then release API scheduling. Hidden-tab handling must detach/suspend observation and use this same reconciliation process rather than let the agent run unseen in UI mode.

Production acceptance tests: API/browser handoff under load, committed/uncertain writes, stale generations, competing observers, unauthorized access, human takeover mid-typing and mid-submit, reconnect after lease expiry, session switching, media/input ordering, and disconnect during submission.
