import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hitTest, hitLink, linkDestination, spatialIndex } from '../src/lib/scene.js'
import { distanceToRoute } from '../src/lib/route-geometry.js'

const line = (id, y) => ({ id, source: id + '-source', target: id + '-target', type: 'enabler', points: [{ x: -10000, y }, { x: 10000, y }] })
const scene = { nodeIndex: spatialIndex([]) }
const frame = edges => ({ mode: 'nodes', marks: [], cards: [], edges })

test('straight and dashed links can be picked with both endpoints offscreen at a fixed screen tolerance', () => {
  const edge = line('remote', 100), visible = frame([edge])
  for (const zoom of [.1, .25, .9, 1.8]) {
    assert.equal(hitTest(scene, visible, { x: 0, y: 100 + 7 / zoom }, zoom)?.edge.id, edge.id)
    assert.equal(hitTest(scene, visible, { x: 0, y: 100 + 9 / zoom }, zoom), null)
  }
  const elbow = { ...edge, points: [{ x: -1000, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 1000 }, { x: 1000, y: 1000 }] }
  assert.equal(hitLink(frame([elbow]), { x: 54, y: 400 }, 1), elbow)
})

test('S-curves are picked along the painted curve and never along its invisible skeleton', () => {
  const edge = { id: 'curve', points: [{ x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }, { x: 200, y: 0 }],
    curve: { from: { x: 0, y: 100 }, to: { x: 200, y: 0 } } }
  // Exact cubic position at t = 1/4, away from the orthogonal skeleton.
  const onCurve = { x: 59.375, y: 84.375 }
  for (const zoom of [.1, .9, 1.8]) assert.equal(hitLink(frame([edge]), onCurve, zoom), edge)
  assert.equal(hitLink(frame([edge]), { x: 100, y: 10 }, 1), null)
  assert.equal(hitLink(frame([edge]), { x: 20, y: 20 }, 1), null)
  const tall = { ...edge, points: [{ x: 0, y: 1e6 }, { x: 100, y: 1e6 }, { x: 100, y: 0 }, { x: 200, y: 0 }],
    curve: { from: { x: 0, y: 1e6 }, to: { x: 200, y: 0 } } }
  assert(distanceToRoute(tall, { x: 59.375, y: 843750 }, 1.8) * 1.8 < .3)
})

test('nearest visible link wins, with drawn order breaking ties at crossings', () => {
  const first = line('first', 0), second = line('second', 12)
  assert.equal(hitLink(frame([first, second]), { x: 0, y: 2 }, 1), first)
  assert.equal(hitLink(frame([first, second]), { x: 0, y: 10 }, 1), second)
  const crossing = { ...second, points: [{ x: 0, y: -1000 }, { x: 0, y: 1000 }] }
  assert.equal(hitLink(frame([first, crossing]), { x: 0, y: 0 }, 1), crossing)
  assert.equal(hitLink(frame([crossing, first]), { x: 0, y: 0 }, 1), first)
})

test('cards have priority and LOD-hidden connections are not interactive', () => {
  const edge = line('visible', 0), card = { id: 'card', x: -50, y: -50, width: 100, height: 100 }
  assert.equal(hitTest({ nodeIndex: spatialIndex([card]) }, frame([edge]), { x: 0, y: 0 }, 1)?.node.id, card.id)
  assert.equal(hitLink(frame([]), { x: 0, y: 0 }, 1), null)
  assert.equal(hitTest(scene, { ...frame([edge]), mode: 'density' }, { x: 0, y: 0 }, .01), null)
})

test('following a connection visits the other end of the selected node, including an incoming prosthesis link', () => {
  const edge = { source: 'prosthesis', target: 'bionic-prosthesis' }
  assert.equal(linkDestination(edge, 'bionic-prosthesis'), 'prosthesis')
  assert.equal(linkDestination(edge, 'prosthesis'), 'bionic-prosthesis')
  assert.equal(linkDestination(edge, 'transistor'), 'bionic-prosthesis')
})