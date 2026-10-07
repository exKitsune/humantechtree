// Synthetic copies preserve the catalog's varied fan-out, long prerequisites,
// disconnected roots and cross-branch links without changing application data.
export function multiplyCatalog(nodes, copies) {
  return Array.from({ length: copies }, (_, copy) => nodes.map(n => ({ ...n,
    id: `${copy}:${n.id}`, title: `${n.title} (${copy + 1})`,
    parents: n.parents.map(p => ({ ...p, id: `${copy}:${p.id}` })),
  }))).flat()
}
