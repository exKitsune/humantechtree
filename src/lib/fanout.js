/** Order the whole fan-out, not each edge independently. Long routes heading
 * above the source band take the upper bus lanes; routes returning downward
 * take the lower lanes. Within each family, destination columns determine the
 * nesting order, and destination heights break ties inside a column.
 */
export function orderFanouts(index, edges, bands, trackSpacing, portSpacing, rankCount) {
  const bandRank = new Map(bands.map((band, i) => [band.id, i]))
  const buses = new Map(bands.map(b => [b.id, []]))
  for (const edge of edges) {
    const source = index.get(edge.source), target = index.get(edge.target)
    if (target.rank <= source.rank + 1) continue
    edge.above = bandRank.get(target.domain) < bandRank.get(source.domain)
    buses.get(source.domain).push(edge)
  }
  for (const band of bands) {
    const family = buses.get(band.id)
    family.sort((a, b) => a.source.localeCompare(b.source) || Number(b.above) - Number(a.above)
      || (a.above ? 1 : -1) * (index.get(a.target).rank - index.get(b.target).rank)
      || a.targetY - b.targetY || a.id.localeCompare(b.id))
    family.forEach((edge, i) => edge.busY = band.y + 70 + i * trackSpacing)
  }
  for (const node of index.values()) {
    node.outgoing.sort((a, b) => (a.busY ?? a.targetY) - (b.busY ?? b.targetY) || a.id.localeCompare(b.id))
    node.outgoing.forEach((edge, i) => {
      const port = { id: edge.sourceHandle, type: 'source', x: node.width, y: (i + 1) * portSpacing + node.rank / (rankCount + 1) }
      node.ports.push(port)
      edge.sourceY = node.y + port.y
    })
  }
}

/** Reserve a separate track for every segment. Upward exits nest from left to
 * right in port order; downward exits nest in reverse. Destination entries
 * mirror the bus ordering. Keeping each family contiguous preserves these
 * constraints regardless of other sources sharing the same column gap.
 */
export function assignFanoutTracks(segments) {
  segments.sort((a, b) => a.edge.source.localeCompare(b.edge.source) || a.kind.localeCompare(b.kind) || compareFamily(a, b))
  segments.forEach((segment, i) => segment.track = i)
  return segments.length
}

function compareFamily(a, b) {
  if (a.kind === 'exit') {
    const aUp = a.to < a.from, bUp = b.to < b.from
    return Number(bUp) - Number(aUp) || (aUp ? 1 : -1) * (a.from - b.from) || a.id.localeCompare(b.id)
  }
  return Number(b.edge.above) - Number(a.edge.above)
    || (a.edge.above ? 1 : -1) * (a.edge.busY - b.edge.busY) || a.id.localeCompare(b.id)
}
