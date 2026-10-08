# Agent operating guide

## Orient and read selectively

Humanity is an exploratory atlas of explainable contributions between human capabilities. The public site stays a static Svelte/GitHub Pages application. Optimize for accurate claims, recoverable changes, and reuse of prior evidence before node count or automation volume.

Start with `git status --short` and the relevant source files; preserve unrelated changes. `package.json` defines commands that actually exist. Use `scripts/lib/catalog.mjs` to read the complete authoring graph and its file maps. `public/data/catalog.json` is generated browser data, not an editorial source.

| Task | Read next |
| --- | --- |
| Run, browse, or deploy the current app | [README.md](README.md) |
| Author or correct a milestone/connection | The authoring rules below, then the relevant steps in [AGENT-WORKFLOW.md](docs/AGENT-WORKFLOW.md) |
| Change architecture, schema, provenance, or agent tooling | [SYSTEM.md](docs/SYSTEM.md), then the relevant [roadmap milestone](docs/ROADMAP.md) |
| Implement a planned operation | Its contract in [AGENT-WORKFLOW.md](docs/AGENT-WORKFLOW.md#planned-operation-contracts) and its roadmap acceptance gates |
| Change layout or rendering | [Layout pipeline and diagnostics](docs/LAYOUT.md), README project map, and the affected `src/lib/` modules/tests; keep historical semantics separate from geometry |

The design documents explicitly distinguish current behavior from planned features. The proposed status/inspect/evidence/proposal operations and structured research records are not implemented yet. Do not invent commands, fields, or guarantees from those plans. Update implementation status and current instructions when a feature actually ships.

## Catalog authoring

The project uses an offline Wikipedia archive at `F:/Wikipedia/wikipedia_en_all_maxi_2026-08.zim`. Prefer it and `.cache/wiki-research/` for research. CDN image/credit metadata is fetched separately with `scripts/enrich-wikipedia.mjs`.

Every edge must explain an immediate, specific contribution to the target milestone. Match the parent's actual title, date and scope: observing bacteria is not equivalent to culturing strains, and isolating a substance is not equivalent to all later methods using it. Prefer an existing nearer process, experiment, instrument or institution when it accounts for the contribution. Add an evidence-supported missing intermediate when necessary. Never pad a new node with a broad root solely to make it connected.

Preserve multiple independent prerequisites. A still-used older material, machine or mathematical method may genuinely contribute directly even when another multi-step path exists. An alternate path or a large date gap triggers review, not automatic transitive reduction. Do not force a single historical ladder or infer prerequisites from article links, shared topics, chronology, or later terminology.

Run `npm run data:audit-connections` against the complete authoring sources after changing nodes or links. Resolve flags by removing/replacing an unsupported shortcut or documenting its independent direct role in that parent's `directContribution` field. That explanation must address the actual contribution; it is not a waiver or proof of historical truth. Keep supporting URLs in `source` when checked, and do not set `reviewed` merely because an article title resolved.

Base catalogs and expansion files contain nodes. Additional registered topic batches cover warfare, the built world, institutions, computing, production, and public health; see `docs/research/EXPANSION-QUEUE.md` before choosing another batch. `scripts/lib/catalog.mjs` owns the explicit file list, including the numbered expansion batches. Optional `data/engineering-connections.json`, `data/science-connections.json`, and `data/society-connections.json` contain added intermediate nodes. `data/connections.json` contains supplemental cross-domain edges. Define each source/target pair only once across all files; duplicate supplements fail compilation so an explanation can never be silently ignored. Update source files, then compile; do not edit only the generated `public/data/catalog.json`.

Optional node `category` IDs reference `src/lib/categories.js` and must belong to the node's `domain`. Use its existing scope descriptions when classifying new milestones; extend that registry for a distinct topic. Categories organize browsing and placement, not historical contributions: never insert category nodes as artificial prerequisites or replace parents with group membership. Current Information milestones are classified; missing assignments remain visible as Other capabilities in a categorized band. See `docs/LAYOUT.md` for grouping and LOD contracts.

Before completing a catalog change run `npm run data:compile`, `npm run validate:data`, and appropriate tests. A relationship's direction must respect the milestone dates and remain acyclic. Filters and zoom must never invent shortcuts across hidden intermediate nodes.

## Bounded work and durable knowledge

Inspect the affected node, parents, children, scopes, dates, and relevant alternate paths before expanding the investigation. Retrieve focused source sections; avoid whole-catalog/context dumps or full metadata refreshes for a small change. The current importer reads compiled data and writes the public offline index, so it is not a read-only lookup.

Keep IDs stable. Separate source availability, support for a claim, and review freshness in your conclusions even before their planned schemas exist. Revisit retained explanations when endpoint scope, dates, evidence, or relevant intermediates change; current automation cannot invalidate old reasoning reliably.

Preserve useful sources, rejected alternatives, and open questions using existing edge fields and, when necessary, a concise topic note as described in the workflow. Keep full article text in ignored cache. Do not store hidden reasoning transcripts or turn unsuccessful searches into historical absence claims.

When parallel work is explicitly authorized, assign disjoint source files or proposals and one integration owner. Only that owner compiles generated files after writers settle and audits the combined graph. Never silently overwrite another contributor's changes.

Validate the final snapshot, not an earlier compiled catalog. Follow the workflow's change-specific verification table. Documentation-only edits need link/path/command checks and `git diff --check`, not an app rebuild. Distinguish passed, failed, and not-run checks. Finish with the actual change, evidence limits, verification, and Git state; do not expand a bounded task into an indefinite catalog rewrite.
