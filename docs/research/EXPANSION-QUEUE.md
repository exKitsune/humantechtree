# Wikipedia expansion queue

Status: second coordinated expansion batch integrated, 2026-10-08. The graph is an editorial selection of capabilities, not a complete representation of Wikipedia. Resolving an article is not validation of its historical claims or every relationship.

## First coordinated batch (2026-10-07)

Three Luna agents with high reasoning researched disjoint files. One integration owner reviewed scope and contribution direction, corrected unsupported or reversed links, compiled the combined graph, and refreshed source/image metadata. Full article bodies were read only from the local archive; network requests fetched Wikimedia image/credit metadata.

| Batch | Authoring source | Added nodes | Authored parent edges | Evidence and limits |
| --- | --- | ---: | ---: | --- |
| Hunting, warfare, and rocket transfers | `data/warfare-expansion.json` | 47 | 37 | [Research note](warfare-expansion.md) |
| Construction, measurement, and supply | `data/built-world-expansion.json` | 18 | 20 | [Research note](built-world-expansion.md) |
| Finance, education, and institutions | `data/institutions-expansion.json` | 20 | 22 | [Research note](institutions-expansion.md) |

Integration also replaced two broad incoming rocket edges with three specific launch-vehicle contributions to the existing satellite and human-spaceflight nodes. The net graph change is **85 nodes and 80 edges**, bringing this snapshot to **2,175 nodes and 2,490 edges**. All 85 new article titles resolve in the archive; 72 have CDN images. Image metadata is distinct from historical evidence.

Seven new bands join the existing eleven; 431 existing nodes were reclassified without changing their historical claims. Band assignment follows the milestone's actual scope. General-use technologies remain distinct from particular military, commercial, or religious applications. The sidebar can wrap longer labels. Cross-cutting themes remain unimplemented.

## Second coordinated batch (2026-10-08)

Three Luna agents with high reasoning worked in separate computing, production, and public-health files. The integration owner reviewed their drafts against the complete graph, requested corrections to milestone dates and parent scopes, and separately researched the previously isolated Sisson theodolite. All article-body research used the local archive; only image and credit metadata used Wikimedia network requests.

| Batch | Authoring source | Added nodes | Added edges | Evidence and limits |
| --- | --- | ---: | ---: | --- |
| Sorting, indexing, and data management | `data/computing-expansion-2.json` | 18 | 17 | [Computing research](computing-expansion-2.md) |
| Mineral processing, textiles, and machinery | `data/production-expansion-2.json` | 23 | 10 | [Production research](production-expansion-2.md) |
| Water treatment, health services, and reporting | `data/public-health-expansion-2.json` | 27 | 23 | [Public-health research](public-health-expansion-2.md) |
| Leveling and surveying | `data/built-world-expansion.json` and `data/connections.json` | 1 | 3 | [Measurement research](measurement-expansion-2.md) |

Net addition: **69 nodes and 53 edges**, for **2,244 nodes and 2,543 edges**. All 69 new article references resolve in the same archive; 51 have Wikimedia CDN images with retrieved attribution metadata. The remaining 18 use the existing image fallback. Commons marks the stamp-mill image Public domain but supplies no artist field; its license and file-page attribution link are retained, and no artist was inferred. Computing additions use the existing Information categories; no category nodes or synthetic historical shortcuts were inserted. The measurement edges connect the existing theodolite to its documented telescope and leveling components.

Review separated Merrill's zinc-dust recovery from Crowe's later deaeration, corrected the 1897 oil-agglomeration/1905 froth-flotation distinction, scoped OLAP to the documented 1970 Express product, and replaced WHO's broad institutional ancestry with specific health organizations. Steam machinery uses the boiler capability rather than treating the 1712 atmospheric engine as every later steam mechanism. Research notes retain conflicting claims about synthetic-indigo commercial priority and unsubstantiated candidate inputs. Entries without supported predecessors remain explicitly unfinished research; neither isolated nodes nor clean structural checks establish historical independence or truth.

Combined verification passed: the complete authoring-source connection audit has no unresolved flags; compilation and data validation found no duplicate IDs, dangling links, date inversions, or cycles; Svelte/TypeScript checks found no errors or warnings; all 51 tests and the static production build passed. Tests include full-catalog routing and the 20,000-node LOD fixture. No new interactive browser check was performed for this data-only batch.

Twenty additions currently have neither incoming nor outgoing links. Reuse the topic notes to research their actual inputs or applications:

- Computing: `shellsort`, `trie`, `entity-relationship-model`, `express-olap`.
- Production: `ball-mill`, `carding-machine`, `copper-electrorefining`, `frasch-process`, `froth-flotation`, `hydraulic-mining`, `mauveine`, `patio-process`, `roller-printing-textiles`, `synthetic-alizarin`, `synthetic-indigo`, `wool-combing-machine`.
- Public health: `ragusa-maritime-quarantine`, `liverpool-medical-officer-of-health`, `nyc-metropolitan-board-of-health-1866`, `public-health-nursing`.

## Next questions, in order

1. **Connect the evidenced but isolated milestones.** Fifteen entries from the first batch still lack both incoming and outgoing edges after connecting the theodolite. This means unresolved research, not proven historical independence. Start with these specific questions rather than adding generic parents:
   - `catapult`, `counterweight-trebuchet`: which documented mechanisms, construction practices, and intermediates contributed to the selected forms? Do not infer descent from membership in the broad catapult category.
   - `rifling`, `flintlock-firearm`, `percussion-cap`, `machine-gun`, `smokeless-propellant`: identify immediate manufacturing, ignition, feeding, or material contributions at the dated milestone. Distinguish the hand-powered Gatling entry from later fully automatic systems. Keep descriptions at historical capability level.
   - `standing-army`, `conscription`, `military-logistics`, `military-academy`: investigate the specific Neo-Assyrian, French, and Savoyard institutions and their documented administrative support. Avoid a universal military-institution ladder.
   - `coordinate-measuring-machine`: research the early Ferranti two-axis instrument. Later three-axis machines, computer control, and contemporary granite/air-bearing descriptions cannot establish its original inputs. Sisson's theodolite now has supported telescope and spirit-level inputs; its vernier-scale contribution remains a separate scope question.
   - `normal-school`, `monitorial-instruction`, `french-administrative-court`: locate the particular institutional arrangements that preceded these implementations; do not attach generic education or governance roots just to connect them.
2. **Refine reusable rocket hardware paths.** The new Sputnik, Vostok-K, Jupiter-C, and Mercury-Redstone entries make the military-to-spaceflight route more legible. Further source work should distinguish retained R-7 stages from changes through Luna/Vostok-L, and add the particular life-support and recovery capabilities needed for human flight. Preserve independent Soviet orbital and American suborbital implementations.
3. **Expand precision, construction, and supply where dates are supported.** Revisit optical flats, sine bars, dial indicators, calibration traceability, underpinning, and other deferred construction practices. The research note records why some were deferred. Do not manufacture an origin date to fit the current single-year schema.
4. **Broaden institutional coverage across traditions and regions.** Revisit dated ijazah attestations, regional knowledge-preservation institutions, administrative systems, and trade/credit arrangements with specialist sources when the archive is insufficient. The current omission of an undated ijazah milestone is not a historical absence claim. Do not repeat the rejected claim that a coherent medieval Ottoman millet system existed in its later form.
5. **Expand other capability clusters by an explanatory question.** Resume the second-batch topic notes before expanding mining, textiles, water treatment, computing, or public-health organization. Their rejected candidates and specific missing inputs are the starting queue. Food preservation, navigation, and scientific instruments are additional candidate areas. Inspect the complete current graph first: many obvious subjects already exist in the original expansion files. Article hyperlinks and category membership are discovery aids, never automatically generated edges.

## How another team resumes

- Read the relevant topic note and inspect the current complete authoring graph via `scripts/lib/catalog.mjs`; the numbers here are a dated snapshot.
- Claim one bounded question and disjoint source files. Search existing IDs, titles, and Wikipedia titles before proposing a new milestone. Keep stable IDs and record why an apparent duplicate is distinct.
- Prefer the local ZIM and ignored article cache. Retain archive identity, relevant source sections, uncertainty, and rejected alternatives in the topic note; retain supporting source URLs on edges. Full text remains outside Git.
- Agree on an integration owner. Agents do not concurrently rewrite compiled data, metadata, shared parent arrays, or one another's source files. Only the integration owner registers new files, integrates cross-file links, and compiles after all writers settle.
- Audit the complete authoring sources, compile, validate, and test the final snapshot. A clean structural audit does not establish historical truth. Source availability, claim support, and review freshness remain separate.
- Resolve new article titles locally and fetch only relevant image metadata. Review date/scope mismatches, duplicate concepts, reversed contributions, and taxonomic shortcuts before accepting a batch.

This queue uses the existing Git/manual workflow. It does not implement the planned proposal, evidence-fingerprint, stale-review, or autonomous queue APIs in the roadmap, and no recurring agent run is scheduled.
