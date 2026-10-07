function prepare(canvas, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  return ctx
}

export function drawScene(canvas, scene, frame, viewport, width, height, selected, domains, relations) {
  const ctx = prepare(canvas, width, height)
  const z = viewport.zoom, sx = x => x * z + viewport.x, sy = y => y * z + viewport.y
  for (const band of scene.layout.bands) {
    const y = sy(band.y), h = band.height * z
    if (y + h < 0 || y > height) continue
    ctx.fillStyle = domains[band.id].color + '0d'; ctx.fillRect(0, y, width, h)
    ctx.fillStyle = domains[band.id].color + '48'; ctx.fillRect(0, y, width, 1); ctx.fillRect(0, y + h, width, 1)
  }
  // All paths share one raster surface; no SVG element or listener per edge.
  for (const edge of frame.edges) {
    const active = edge.source === selected || edge.target === selected
    const points = edge.points
    ctx.beginPath(); ctx.moveTo(sx(points[0].x), sy(points[0].y))
    for (let i = 1; i < points.length; i++) ctx.lineTo(sx(points[i].x), sy(points[i].y))
    ctx.strokeStyle = '#222623'; ctx.lineWidth = active ? 5 : 3; ctx.setLineDash([]); ctx.stroke()
    ctx.strokeStyle = active ? relations[edge.type].color : '#6d7765'
    ctx.globalAlpha = active ? .95 : .5
    ctx.lineWidth = active ? 1.7 : .8
    ctx.setLineDash(edge.type === 'enabler' ? [7, 5] : edge.type === 'influence' ? [2, 5] : [])
    ctx.stroke()
    if (z >= .25) {
      const end = points.at(-1), x = sx(end.x), y = sy(end.y), size = active ? 6 : 4
      ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - size, y - size / 2); ctx.lineTo(x - size, y + size / 2); ctx.fill()
    }
  }
  ctx.globalAlpha = 1; ctx.setLineDash([])
  if (frame.mode === 'density') {
    ctx.font = '10px Barlow, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const mark of frame.marks) {
      const x = sx(mark.cx), y = sy(mark.cy), r = Math.min(16, 3 + Math.sqrt(mark.count)), h = Math.min(10, mark.cellHeight * z * .8)
      ctx.fillStyle = domains[mark.domain].color
      ctx.globalAlpha = Math.min(1, .45 + Math.log2(mark.count + 1) / 8)
      ctx.fillRect(x - r, y - h / 2, r * 2, h)
      if (mark.count > 1 && h >= 9) { ctx.globalAlpha = 1; ctx.fillStyle = '#161b17'; ctx.fillText(String(mark.count), x, y) }
    }
    ctx.globalAlpha = 1
  } else if (frame.mode === 'nodes') {
    ctx.textAlign = 'left'; ctx.font = '11px Barlow, sans-serif'; ctx.textBaseline = 'middle'
    for (const n of frame.marks) {
      const x = sx(n.x), y = sy(n.y), w = Math.max(3, n.width * z), h = Math.max(3, n.height * z)
      ctx.fillStyle = '#2d3529'; ctx.fillRect(x, y, w, h)
      ctx.fillStyle = domains[n.domain].color; ctx.fillRect(x, y, Math.max(2, 4 * z), h)
      ctx.strokeStyle = n.id === selected ? '#edb766' : '#6a77584d'; ctx.lineWidth = n.id === selected ? 2 : 1; ctx.strokeRect(x, y, w, h)
      if (z >= .23 && frame.marks.length <= 300) {
        ctx.save(); ctx.beginPath(); ctx.rect(x + 5, y, w - 10, h); ctx.clip()
        ctx.fillStyle = '#dce2d4'; ctx.fillText(n.entry.title, x + 7, y + h / 2); ctx.restore()
      }
    }
  }
  if (frame.mode === 'density') {
    const node = scene.byId.get(selected)
    if (node) { ctx.strokeStyle = '#edb766'; ctx.lineWidth = 2; ctx.strokeRect(sx(node.x + node.width / 2) - 5, sy(node.y + node.height / 2) - 5, 10, 10) }
  }
}

export function drawOverview(canvas, scene, viewport, width, height, domains) {
  const ctx = prepare(canvas, 150, 88)
  const scale = Math.min(140 / (scene.layout.width || 1), 78 / (scene.layout.height || 1))
  const ox = (150 - scene.layout.width * scale) / 2, oy = (88 - scene.layout.height * scale) / 2
  ctx.fillStyle = '#181d19'; ctx.fillRect(0, 0, 150, 88)
  for (const band of scene.layout.bands) { ctx.fillStyle = domains[band.id].color + '35'; ctx.fillRect(ox, oy + band.y * scale, scene.layout.width * scale, Math.max(1, band.height * scale)) }
  const level = scene.levels.find(l => l.size * scale >= 3) ?? scene.levels.at(-1)
  for (const m of level?.marks ?? []) { ctx.fillStyle = domains[m.domain].color; ctx.fillRect(ox + m.cx * scale, oy + m.cy * scale, 1.5, 1.5) }
  ctx.strokeStyle = '#edb766'; ctx.lineWidth = 1
  ctx.strokeRect(ox - viewport.x / viewport.zoom * scale, oy - viewport.y / viewport.zoom * scale, width / viewport.zoom * scale, height / viewport.zoom * scale)
}
