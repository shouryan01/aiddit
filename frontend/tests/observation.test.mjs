import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DemoController } from '../src/lib/observation/controller.ts'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function until(predicate) {
  for (let attempt = 0; attempt < 600; attempt++) {
    if (predicate()) return
    await sleep(2)
  }
  throw new Error('Condition timed out')
}
function fixture() {
  let path = '/'
  let detail = null
  let body = ''
  let voted = false
  let hidden = false
  let missing = false
  let submissions = 0
  const actions = []
  const activities = []
  const port = {
    location: () => path,
    hidden: () => hidden,
    find: () => !missing,
    postLinks: () => [{ id: 'p1', selector: 'open' }],
    detailId: () => detail,
    draft: () => ({ key: 'agent:p1', value: body }),
    move: () => ({ x: 100, y: 100 }),
    destination: (selector) => selector === 'open' ? '/post/p1' : '/',
    click: (selector) => {
      actions.push(selector)
      if (selector === 'open') { path = '/post/p1'; detail = 'p1' }
      if (selector.includes('home')) { path = '/'; detail = null }
      if (selector.includes('Upvote')) voted = true
      if (selector.includes('submit-comment')) { submissions++; body = '' }
    },
    type: (_, value) => { body = value; actions.push('type') },
    upvoted: () => voted,
    scroll: () => actions.push('scroll'),
  }
  const controller = new DemoController(port, (activity) => activities.push(activity), 0.001)
  return {
    controller, activities, actions,
    get body() { return body },
    get submissions() { return submissions },
    set body(value) { body = value },
    set path(value) { path = value },
    set hidden(value) { hidden = value },
    set missing(value) { missing = value },
    pauseDuringSubmit() {
      const original = port.click
      port.click = (selector) => { original(selector); if (selector.includes('submit-comment')) controller.pause('takeover') }
    },
  }
}

test('browses through UI controls and submits once', async () => {
  const f = fixture(); f.controller.start()
  await until(() => f.activities.at(-1)?.state === 'human-control')
  assert.equal(f.submissions, 1)
  assert.ok(f.actions.includes('scroll'))
  assert.ok(f.actions.includes('open'))
  assert.ok(f.actions.some((action) => action.includes('Upvote')))
  assert.ok(f.actions.includes('type'))
  f.controller.stop()
})

test('takeover cancels typing immediately and resume continues an unchanged agent draft', async () => {
  const f = fixture(); f.controller.start()
  await until(() => f.body.length > 5)
  f.controller.pause('takeover')
  const body = f.body; const count = f.actions.length
  await sleep(25)
  assert.equal(f.body, body); assert.equal(f.actions.length, count)
  f.controller.resume()
  await until(() => f.submissions === 1)
  f.controller.stop()
})

test('human edited drafts are never overwritten or submitted on resume', async () => {
  const f = fixture(); f.controller.start()
  await until(() => f.body.length > 5)
  f.controller.pause('takeover'); f.body = 'My own reply'; f.controller.protectDraft('agent:p1')
  f.controller.resume()
  await until(() => f.activities.at(-1)?.message.includes('protected'))
  assert.equal(f.body, 'My own reply'); assert.equal(f.submissions, 0)
  f.controller.stop()
})

test('clearing a human draft explicitly permits a fresh demo reply', async () => {
  const f = fixture(); f.body = 'Human draft'; f.controller.protectDraft('agent:p1'); f.controller.start()
  await until(() => f.activities.at(-1)?.message.includes('protected'))
  f.body = ''; f.controller.resume()
  await until(() => f.submissions === 1)
  f.controller.stop()
})

test('stop/switch prevents all pending actions and reports', async () => {
  const f = fixture(); f.controller.start(); f.controller.stop()
  const count = f.activities.length
  await sleep(25)
  assert.equal(f.actions.length, 0); assert.equal(f.activities.length, count)
  f.controller.resume(); await sleep(10); assert.equal(f.actions.length, 0)
})

test('unexpected navigation safely pauses before any write', async () => {
  const f = fixture(); f.controller.start(); f.path = '/unexpected'
  await until(() => f.activities.at(-1)?.state === 'human-control')
  assert.match(f.activities.at(-1).message, /unexpectedly/)
  assert.equal(f.submissions, 0); f.controller.stop()
})

test('missing UI controls pause with no submission', async () => {
  const f = fixture(); f.missing = true; f.controller.start()
  await until(() => f.activities.at(-1)?.state === 'human-control')
  assert.match(f.activities.at(-1).message, /unavailable/)
  assert.equal(f.submissions, 0); f.controller.stop()
})

test('hidden tab refuses resume and requires explicit resume when visible', async () => {
  const f = fixture(); f.hidden = true; f.controller.start()
  assert.equal(f.activities.at(-1).state, 'human-control')
  f.hidden = false; await sleep(20); assert.equal(f.actions.length, 0)
  f.controller.resume(); await until(() => f.actions.length > 0); f.controller.stop()
})

test('takeover at submission boundary never replays a committed comment', async () => {
  const f = fixture(); f.pauseDuringSubmit(); f.controller.start()
  await until(() => f.submissions === 1)
  f.controller.resume()
  await until(() => f.activities.at(-1)?.state === 'human-control')
  assert.equal(f.submissions, 1); f.controller.stop()
})

test('rapid pause/resume invalidates previous generations', async () => {
  const f = fixture(); f.controller.start()
  f.controller.pause('pause'); f.controller.resume(); f.controller.pause('pause'); f.controller.resume()
  await until(() => f.submissions === 1)
  f.controller.stop(); await sleep(20)
  assert.equal(f.submissions, 1)
})

test('reduced motion uses one scroll step and preserves an existing upvote', async () => {
  let detail = null
  let path = '/'
  let scrolls = 0
  let votes = 0
  let draft = ''
  let done = false
  const port = {
    location: () => path, hidden: () => false, find: () => true,
    reducedMotion: () => true,
    postLinks: () => [{id:'p1', selector:'open'}], detailId: () => detail,
    draft: () => ({key:'agent:p1', value:draft}), move: () => ({x:1,y:1}),
    destination: (selector) => selector === 'open' ? '/p1' : '/',
    click: (selector) => {
      if (selector === 'open') { detail = 'p1'; path = '/p1' }
      if (selector.includes('home')) { detail = null; path = '/' }
      if (selector.includes('Upvote')) votes++
      if (selector.includes('submit-comment')) draft = ''
    },
    type: (_, value) => { draft = value }, upvoted: () => true,
    scroll: () => { scrolls++ },
  }
  const controller = new DemoController(port, (activity) => { if (activity.state === 'human-control') done = true }, 0.001)
  controller.start(); await until(() => done)
  assert.equal(votes, 0)
  assert.equal(scrolls, 2)
  controller.stop()
})
