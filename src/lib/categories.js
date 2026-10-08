// Presentation taxonomy: categories organize milestones; they never supply prerequisites.
// Registry order is the stable vertical order within each branch.
export const categories = [
  {
    "id": "computing-foundations",
    "domain": "information",
    "label": "Calculation & computing theory",
    "description": "Manual and mechanical calculation, formal computation, and its mathematical limits."
  },
  {
    "id": "computer-hardware",
    "domain": "information",
    "label": "Electronic hardware",
    "description": "Electronic components, computer architectures, and general-purpose devices."
  },
  {
    "id": "memory-storage",
    "domain": "information",
    "label": "Memory & storage",
    "description": "Devices that retain and retrieve digital information."
  },
  {
    "id": "programming",
    "domain": "information",
    "label": "Programming & software engineering",
    "description": "Languages, translation, programming techniques, verification, and development tools."
  },
  {
    "id": "operating-distributed-systems",
    "domain": "information",
    "label": "Operating & distributed systems",
    "description": "Resource management, virtualization, and coordination across computers."
  },
  {
    "id": "sorting",
    "domain": "information",
    "label": "Sorting algorithms",
    "description": "Algorithms whose primary task is arranging records in an order."
  },
  {
    "id": "search-data-structures",
    "domain": "information",
    "label": "Search & data structures",
    "description": "Representing collections and finding or indexing their contents."
  },
  {
    "id": "numerical-optimization",
    "domain": "information",
    "label": "Numerical methods & optimization",
    "description": "Computational mathematics, graph optimization, and symbolic calculation."
  },
  {
    "id": "data-representation",
    "domain": "information",
    "label": "Databases & data representation",
    "description": "Data models, query systems, character encoding, and interchange formats."
  },
  {
    "id": "telecommunications",
    "domain": "information",
    "label": "Networks & telecommunications",
    "description": "Signals, switching, protocols, and infrastructure connecting people and computers."
  },
  {
    "id": "web",
    "domain": "information",
    "label": "Web & network applications",
    "description": "Publishing, communication, and discovery services built on computer networks."
  },
  {
    "id": "cryptography-security",
    "domain": "information",
    "label": "Cryptography & security",
    "description": "Encryption, authentication, integrity, secure protocols, and cryptographic ledgers."
  },
  {
    "id": "graphics-signals",
    "domain": "information",
    "label": "Graphics, interfaces & signals",
    "description": "Human-computer interaction, imaging, signal processing, coding, and compression."
  },
  {
    "id": "artificial-intelligence",
    "domain": "information",
    "label": "Artificial intelligence",
    "description": "Learning, inference, neural architectures, and intelligent decision systems."
  },
  {
    "id": "computational-biology",
    "domain": "information",
    "label": "Computational biology",
    "description": "Algorithms for interpreting and reconstructing biological sequences."
  },
  {
    "id": "quantum-computing",
    "domain": "information",
    "label": "Quantum computing",
    "description": "Computational architectures and algorithms using quantum states."
  }
]
export const categoryInfo = Object.fromEntries(categories.map(category => [category.id, category]))

export function categoryFor(node) {
  const category = categoryInfo[node.category]
  return category?.domain === node.domain ? category : undefined
}

export function categoryGroups(nodes) {
  const grouped = new Map()
  for (const node of nodes) {
    const category = categoryFor(node)
    const id = category?.id ?? `${node.domain}:other`
    if (!grouped.has(id)) grouped.set(id, { id, domain: node.domain, category: category?.id, label: category?.label, nodes: [] })
    grouped.get(id).nodes.push(node)
  }
  const order = new Map(categories.map((category, i) => [category.id, i]))
  return [...grouped.values()].sort((a, b) => a.domain.localeCompare(b.domain)
    || (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity) || a.id.localeCompare(b.id))
}

export function validateCategories(nodes) {
  const ids = new Set()
  for (const category of categories) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.id) || ids.has(category.id)
      || !category.domain || !category.label || !category.description) throw new Error(`Invalid category definition: ${category.id}`)
    ids.add(category.id)
  }
  for (const node of nodes) if (node.category !== undefined && (typeof node.category !== 'string' || !categoryFor(node))) {
    throw new Error(`Invalid category for ${node.id} (${node.domain}): ${node.category}`)
  }
}
