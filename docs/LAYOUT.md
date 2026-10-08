# Layout design and crossing analysis

The layout is a projection of the displayed graph. Historical relationships remain authored data; placement never adds, removes, or rewrites them. Branch order and era membership constrain geometry. Dates are ordered horizontally, but distance is allocated for readability rather than elapsed time.

## Diagnosis, 2026-10-07

The previous layout (commit `05241bb`) protected cards and each source's fan-out, but had no useful ordering objective across independent sources:

- Every date column restarted its stack at the top of the branch. Sorting by the parents' local row number did not preserve a connected chain through skipped columns. In the Dirac neighborhood, Bohr's atomic model occupied the row between special relativity and matter waves, although it fed quantum mechanics through a separate connection.
- All long links used a corridor above their source branch, including links heading toward lower branches. Corridors were permanently reserved across the entire width, even for disjoint date spans.
- Incoming ports followed the authoring parent-array order; vertical track families largely followed source IDs. Neither order represented the geometry of arriving relationships.
- Within a date subdivision, a later independent milestone could be placed left of an earlier milestone pushed right by dependencies or population. Edges advanced correctly, but the overall chronology could look backward.

## Current pipeline

1. `layout.js` canonicalizes the displayed nodes/edges, rejects backward prerequisites and cycles, and assigns card dimensions from port counts. Only authored edges with both endpoints present survive filtering.
2. `timeline.js` splits populated periods into finer dates and caps a branch at six cards per column. Dependencies advance to later columns. After finishing one year, later years cannot move left of its rightmost column. Same-year nodes may share columns when their dependencies permit it.
3. `placement.js` chooses disjoint visual chains within each branch, preferring short column spans and then foundation/enabler/influence links. Each milestone gets at most one predecessor/successor **for alignment only**. All historical parents remain in the rendered graph. Entire chain intervals reserve a row, so an unrelated node cannot interrupt a chain's empty dates. Nonoverlapping intervals reuse rows; connected neighboring chains influence the preferred row.
4. `fanout.js` allocates top or bottom corridors according to the destination branch, or the source row for links within a branch. Each source family gets a contiguous nested block. Different families reuse corridor lanes only when their complete date intervals are disjoint. A single-successor link can cross skipped columns directly when its shared row has no intervening card.
5. Receiving ports are sorted by arrival height; outgoing ports by destination/corridor height. Source families retain their nesting order. Vertical track families begin in geometric order, then make up to four adjacent-swap passes whenever the local crossing count decreases. IDs break remaining ties, rather than deciding the primary route order.
6. The worker returns cards, routes, adaptive date bands, and branch bounds together. Spatial indexes and LOD consume this geometry. Panning/zooming do not rerun placement; changing the displayed graph does.

This is a deterministic constrained heuristic, not a global crossing optimum. Reserving chain rows uses extra vertical space. Fixed branch order, chronology, independent prerequisites, and high-degree nodes can still require or produce crossings between different sources. A same-row chain is visual continuity, not an assertion that it is the only historical path. Historical review and routing diagnostics remain separate.

## Measured result

Both versions used the unchanged compiled catalog: 2,175 nodes, 2,490 edges; SHA-256 `a4728fe2a0756e738187bb0834855d0783935dda450c24c239ae3799709fd54c`. Focused views use the app's two-step upstream/downstream selector. The science view filters to `domain=science`.

| View | Nodes / edges | Proper crossings before | After | Reduction |
| --- | ---: | ---: | ---: | ---: |
| Dirac equation | 6 / 6 | 6 | 0 | 100% |
| Microscope | 47 / 55 | 436 | 144 | 67% |
| Science | 414 / 499 | 36,687 | 18,609 | 49% |
| Full catalog | 2,175 / 2,490 | 239,432 | 139,649 | 42% |

A proper crossing is an interior perpendicular intersection between segments belonging to different edges. The metric excludes endpoint touches, self-intersections, and coincident runs; those need separate geometry checks. It counts intersections, not unique pairs of edges, and measures all routes even when overview LOD hides them.

Full-catalog route length fell from 143,340,362 to 134,152,952 world units (6.4%). Canvas area rose from 21,846,056,544 to 23,363,046,912 square world units (6.9%) to preserve chain rows. The Dirac view uses more vertical space and slightly more route length to remove its crossings. Width/height and crossing count are diagnostics, not historical-quality scores.

## Reproduce and guard

`npm run layout:analyze` is a read-only local command against `public/data/catalog.json`. Compile first after authoring changes. It reports the exact catalog digest, scope, layout duration, dimensions, route length, crossing count, and the ten most-crossed edges. No network or file writes occur. The crossing scan is quadratic in segment count and belongs in offline diagnostics, never the rendering loop; use a bounded view for very large future catalogs.

```sh
npm run layout:analyze -- --node dirac-equation
npm run layout:analyze -- --node microscope --depth 2
npm run layout:analyze -- --domain science
npm run layout:analyze -- --from 1750 --to 1900
npm run layout:analyze
```

`--from` is inclusive and `--to` exclusive, matching the app filters. Combining `--node` with filters first selects the neighborhood, then filters it. Unknown IDs/domains and invalid ranges fail explicitly. The command's geometry is reproducible; elapsed time depends on hardware and warm/cold state.

The regression suite checks the Dirac chain's alignment and zero crossings, input/parent order independence, chronology within subdivisions, clear direct routes through skipped dates, every catalog card/route, and fan-out separation across 120 seeded mixed-band DAGs. Existing tests retain adaptive era bands, 240-unit pan margins, and the 20,000-node LOD fixture. Full-graph crossing counts are measured rather than frozen as a test threshold, because legitimate catalog additions change the graph.

Further reduction should start with the diagnostic's worst edges and a bounded view. Candidate improvements include connected-component row ordering and obstacle-aware local corridors; evaluate crossing count, route length, space, deterministic ordering, fan-out clearance, and runtime together. Do not solve geometric congestion by deleting valid contributions or synthesizing shortcuts.