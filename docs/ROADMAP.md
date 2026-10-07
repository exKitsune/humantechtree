# Implementation roadmap

Status: plan only, 2026-10-07. P0 is the documentation delivered in this change. P1–P6 are **not implemented**. Existing code remains governed by current `AGENTS.md` and runnable commands in `package.json`. [SYSTEM.md](SYSTEM.md) owns the design; [AGENT-WORKFLOW.md](AGENT-WORKFLOW.md) owns operation contracts and the current manual fallback.

## Delivery strategy

Build a local vertical slice that resolves a real editorial question before adding more infrastructure. Keep Svelte, static GitHub Pages delivery, stable IDs, offline-first research, existing source files, and current rendering invariants. Introduce reusable pure modules behind commands; avoid a parallel agent-only implementation of graph rules.

Each milestone includes implementation, a concrete user/agent task, migration or compatibility behavior, verification, and a documentation status update. A task is not complete merely because its CLI prints JSON. Code and generated artifacts must describe the same snapshot. Do not mark a milestone implemented until its acceptance gates pass.

Dependency order: **P0 → P1 → P2 → P3 → P4**. P5 uses P1–P3 and feeds evidence into P4. P6 follows measurements from P4/P5, not a speculative node-count target.

## P0 — Shared design and a reliable entry point

Delivered by this documentation change:

- Root `AGENTS.md`: brief orientation, invariants, current commands, selective reading routes.
- `docs/SYSTEM.md`: linked abstraction levels, editorial contracts, durable knowledge, freshness, control, and resource priorities.
- `docs/AGENT-WORKFLOW.md`: practical current loop and clearly planned operation contracts.
- This roadmap: ordered deliverables, acceptance gates, and deliberate deferrals.
- README links the documents while retaining actual installation, browsing, and deployment instructions.

Acceptance: local document links resolve; current commands and paths exist; proposed capabilities are labeled; no catalog, runtime, or source-media behavior changes. Historical authoring requirements remain intact.

## P1 — Inspect and validate one identified graph

First implementation task: build compact read-only status, node/edge inspection, and directed tracing on `loadCatalog()`. Start with the current JSON files and an in-memory index. Add stable IDs/file locations to diagnostics, bounded output, pagination, snapshot identity, and schema-versioned responses. Keep tool adapters thin and optional.

Consolidate shared domain/kind/relation definitions and structural validation into reusable contracts; generate or check TypeScript and publication compatibility from them. Do not require a new framework. Compute content identity independently of timestamps. An overall snapshot manifest carries component digests for graph, schema, evidence when present, and media; layer caches use only their relevant inputs.

Separate validating source data from compilation. Make source validation read-only, then compile deterministically. Fix CI to compile/validate the current source before tests that read generated data. Detect stale compiled output, unknown metadata IDs, changed article references, duplicate authoring definitions, and incomplete outputs without silently repairing them.

Acceptance gates:

- Inspect `dna-heredity` with immediate neighbors and source locations without reading the full JSON into the agent context or launching a browser.
- Trace its experimental and nuclear-chemistry ancestry with every intermediate and edge type visible; unknown IDs and truncated results are explicit.
- Repeating a read produces identical content for the same snapshot and performs zero writes/network requests.
- Compiling unchanged content produces identical bytes; a run timestamp is separate from content identity.
- Deliberately stale compiled data cannot make CI test yesterday's graph while publishing today's graph.
- The current catalog and all semantic/layout tests retain their behavior. Shared-rule extraction does not change historical assertions.

Deliver a before/after measurement of commands, output bytes, and elapsed time for that inspection task. The initial interface defaults are in the workflow document; latency targets are set after measurement on the actual machine.

## P2 — Preserve evidence, judgments, and rejected alternatives

Introduce versioned schemas for compact evidence, reviews, decisions, and open questions under a dedicated `research/` source area. Define deterministic record lookup and bounded shards before expanding storage; keep Git diffs local. Full article text stays in ignored cache. This directory and its schemas do not exist yet.

Add read-only source lookup by either catalog ID or article title, separate from the current importer's mutation of the public index. Include archive UUID, article path, section/fallback locator, extraction version, and content digest. Reuse cached sections; report missing/ambiguous results without changing claim status.

Pilot durable records on the DNA correction, one directly used vacuum-pump edge, and one disputed or unresolved institutional/script link. Re-read the necessary source passages: do not convert previous prose or URL resolution into a supported assessment automatically. Preserve useful interim topic notes with their original limits.

Implement source availability, editorial assessment, and freshness as separate fields. Legacy `reviewed`/`directContribution` values remain available but start as legacy assertions rather than inferred verification. Draft catalog entries remain identifiable as drafts; this migration must not assert that the whole catalog was reviewed.

Acceptance gates:

- A new agent can explain why bacteria observation is not a direct DNA-experiment input, and why an old vacuum pump can remain a direct device input, using saved evidence and decisions.
- A previously rejected edge proposal surfaces the prior decision and its reopening condition.
- Altering the cited source passage, target scope, date, or relevant alternate route marks the appropriate review stale; an unrelated formatting change does not.
- Changing live CDN metadata does not rewrite offline text provenance or invalidate unrelated historical review.
- Missing archive access, unlocated passages, source disagreement, and unsupported claims have distinguishable outcomes.
- Version-1 public output remains compatible through an explicit projection. New metadata is not silently dropped during round trips.

## P3 — Make coherent edits cheap and recoverable

Add typed proposals for bounded node/edge changes and linked review dispositions. Proposals carry operation ID, base snapshot, expected record fingerprints, evidence references, and intended semantic effect. Produce a semantic diff and impact report before applying. Default to the user's authorized scope; the preview is a correctness mechanism, not a new mandatory approval ceremony.

Compute affected neighbors, directness flags, review freshness, aliases, and output changes from the complete proposed graph. A retained explanation alone must no longer suppress a stale review indefinitely. Preserve the current directness gate until its replacement has explicit compatibility and regression coverage.

Stage and validate the proposed snapshot. Implement an exclusive writer convention, precondition checks, transaction journal, incomplete-transaction detection, and conflict-safe recovery. Readers/publication must refuse a partially applied state. Do not assume filesystem operations across several files are atomic or that external editors respect a lock.

Acceptance gates:

- Replacing a remote parent and adding an evidenced intermediate appears as one coherent semantic change and invalidates affected decisions across file boundaries.
- A stale base refuses application while preserving unrelated edits. Retrying the same applied operation is a no-op with its original receipt.
- Injected failure halfway through a multi-file application leaves a detectable, recoverable transaction; it cannot publish half the graph.
- Recovery refuses to overwrite a subsequently edited file. An integration test exercises this conflict, not just the happy path.
- Two authorized contributors can submit disjoint proposals; their combined result receives one complete audit and receipt.
- Receipts identify exact snapshots, sources, tests, generated outputs, remaining questions, and Git state. “Not run” cannot be serialized as success.

## P4 — Make human and agent exploration agree

Expose the public subset of provenance through the existing detail panel: what the edge contributed, supporting reference, assessment/uncertainty, and freshness where available. Keep technical authoring controls out of normal browsing. Add useful upstream/downstream expansion and path inspection without hiding intermediate steps or treating multiple parents as universal unlock requirements.

Use one application state model for UI controls, diagnostics, tests, and any later agent adapter. Include snapshot, selected ID, filters, depth, omitted-neighbor counts, layout generation, and LOD budgets. Preserve existing bookmarks; introduce aliases before retiring IDs.

Acceptance gates:

- Human selection and programmatic inspection identify the same node, edges, and source snapshot.
- Filtering an intermediate never creates a direct edge; missing visible neighbors are explained as filtered or outside the neighborhood.
- Aggregate counts conserve represented nodes; stale worker responses cannot replace a newer selection/filter state.
- Evidence and contested/stale labels are readable without turning the interface into a developer console.
- Worker, assets, data, and bookmarked details work at a GitHub Pages repository subpath with unavailable images.
- Existing fan-out, era subdivision, navigation-margin, picking, and rendering-budget tests continue to pass.

## P5 — Expand through an inspectable research queue

Create a persistent queue of precise questions and candidate milestones, linked to evidence and prior decisions. Separate discovery of a candidate from admission to the canonical graph. Give each queue item an understandable priority reason, scope, status, attempts, and next useful action.

Prioritize user corrections and high-impact ambiguity while reserving attention for neglected eras, regions, and institutional/cultural branches. Shared Wikipedia links or similarity may suggest investigations; they cannot create accepted edges. Deduplicate by scope and aliases, not title alone. No arbitrary promise to turn all Wikipedia articles into capabilities.

Acceptance gates:

- A bounded batch returns supported changes or well-scoped unresolved questions, without padding every candidate with a generic root.
- A repeat run reuses source lookups and rejected alternatives instead of regenerating the same mistakes.
- A budget limit or interruption leaves resumable records and stable progress; elapsed time does not authorize new actions.
- Coverage reporting distinguishes milestones, missing research, isolated nodes, and filtered views. Higher node/edge counts are not reported as higher accuracy.
- Every accepted batch passes the same proposal, review, compilation, and publication path as a single manual correction.

## P6 — Scale the measured bottleneck

Profile cold/warm inspection, source retrieval, impact analysis, build size, initial browser load, layout, and interaction separately at current size and synthetic 20,000/50,000-node fixtures. Identify the limiting layer before changing storage or rendering.

Possible later changes include persistent local query indexes, incremental audit indexes, bounded evidence shards, and static graph/search chunks. Each remains derived from canonical records with versioned manifests and explicit completeness. If only part of a graph is loaded, a query cannot claim “no path exists” until the relevant search is complete.

Acceptance gates:

- Report p50/p95 latency, emitted bytes, memory where measurable, source reads, and external requests with hardware/fixture conditions.
- Show which bottleneck improved and that semantics, provenance, counts, and reproducibility stayed unchanged.
- Keep the published site static and usable without local research infrastructure.
- Retain straightforward full rebuild/full audit as correctness oracles; optimize incremental paths against them.

## Deliberate deferrals and decision rules

Do not add a hosted database, mandatory backend, graph service, vector store, MCP server, autonomous multi-agent scheduler, full-archive crawler, or generalized event-sourcing platform without a measured need that simpler local tools cannot meet. Adapters use the same core; they do not fork semantics.

Do not perform global transitive reduction, infer historical necessity from topology, equate source matches with reviews, promote model confidence to truth, or rewrite all IDs/schema fields in one migration.

Rationale worth retaining:

| Decision | Why | Reopen when |
| --- | --- | --- |
| Git-backed canonical data and static publication | Inspectable diffs, recoverability, simple hosting | Measured editing/delivery limits exceed bounded shards and derived indexes |
| Offline sources first; bounded external lookup | Reuse a known snapshot and avoid repeated bulk scraping | A specific claim needs missing, newer, or stronger evidence |
| Typed inspection before autonomous expansion | Agents must observe state and verify results before controlling larger scope | P1–P3 acceptance gates pass |
| Claim-specific assessment rather than one confidence score | Scope, support, availability, and freshness answer different questions | A concrete decision needs an additional well-defined dimension |
| Keep justified long edges | Physical use and conceptual ancestry can coexist | New evidence or a changed milestone scope defeats the contribution |

## Progress and documentation maintenance

Use milestone IDs in future implementation descriptions and receipts. Record completed acceptance evidence and remaining scope; do not mark an entire phase complete for one utility. Update current instructions in the same change that makes a planned operation real. Keep plans and runtime contracts consistent, and retire obsolete instructions rather than accumulating conflicting versions.

For this documentation-only change, verify links, paths, runnable command examples, status labels, and the Git diff. Runtime/catalog tests are required when their inputs change, not as ceremony for prose edits.
