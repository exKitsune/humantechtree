# Catalog authoring

The project uses an offline Wikipedia archive at `F:/Wikipedia/wikipedia_en_all_maxi_2026-08.zim`. Prefer it and `.cache/wiki-research/` for research. CDN image/credit metadata is fetched separately with `scripts/enrich-wikipedia.mjs`.

Every edge must explain an immediate, specific contribution to the target milestone. Match the parent's actual title, date and scope: observing bacteria is not equivalent to culturing strains, and isolating a substance is not equivalent to all later methods using it. Prefer an existing nearer process, experiment, instrument or institution when it accounts for the contribution. Add an evidence-supported missing intermediate when necessary. Never pad a new node with a broad root solely to make it connected.

Preserve multiple independent prerequisites. A still-used older material, machine or mathematical method may genuinely contribute directly even when another multi-step path exists. An alternate path or a large date gap triggers review, not automatic transitive reduction. Do not force a single historical ladder or infer prerequisites from article links, shared topics, chronology, or later terminology.

Run `npm run data:audit-connections` against the complete authoring sources after changing nodes or links. Resolve flags by removing/replacing an unsupported shortcut or documenting its independent direct role in that parent's `directContribution` field. That explanation must address the actual contribution; it is not a waiver or proof of historical truth. Keep supporting URLs in `source` when checked, and do not set `reviewed` merely because an article title resolved.

Base catalogs and expansion files contain nodes. Optional `data/engineering-connections.json`, `data/science-connections.json`, and `data/society-connections.json` contain added intermediate nodes. `data/connections.json` contains supplemental cross-domain edges. Define each source/target pair only once across all files; duplicate supplements fail compilation so an explanation can never be silently ignored. Update source files, then compile; do not edit only the generated `public/data/catalog.json`.

Before completing a catalog change run `npm run data:compile`, `npm run validate:data`, and appropriate tests. A relationship's direction must respect the milestone dates and remain acyclic. Filters and zoom must never invent shortcuts across hidden intermediate nodes.
