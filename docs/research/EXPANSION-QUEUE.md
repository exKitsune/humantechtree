# Wikipedia expansion queue

Status: first coordinated expansion batch integrated, 2026-10-07. The graph is an editorial selection of capabilities, not a complete representation of Wikipedia. Resolving an article is not validation of its historical claims or every relationship.

## Completed batch

Three Luna agents with high reasoning researched disjoint files. One integration owner reviewed scope and contribution direction, corrected unsupported or reversed links, compiled the combined graph, and refreshed source/image metadata. Full article bodies were read only from the local archive; network requests fetched Wikimedia image/credit metadata.

| Batch | Authoring source | Added nodes | Authored parent edges | Evidence and limits |
| --- | --- | ---: | ---: | --- |
| Hunting, warfare, and rocket transfers | `data/warfare-expansion.json` | 47 | 37 | [Research note](warfare-expansion.md) |
| Construction, measurement, and supply | `data/built-world-expansion.json` | 18 | 20 | [Research note](built-world-expansion.md) |
| Finance, education, and institutions | `data/institutions-expansion.json` | 20 | 22 | [Research note](institutions-expansion.md) |

Integration also replaced two broad incoming rocket edges with three specific launch-vehicle contributions to the existing satellite and human-spaceflight nodes. The net graph change is **85 nodes and 80 edges**, bringing this snapshot to **2,175 nodes and 2,490 edges**. All 85 new article titles resolve in the archive; 72 have CDN images. Image metadata is distinct from historical evidence.

Seven new bands join the existing eleven; 431 existing nodes were reclassified without changing their historical claims. Band assignment follows the milestone's actual scope. General-use technologies remain distinct from particular military, commercial, or religious applications. The sidebar can wrap longer labels. Cross-cutting themes remain unimplemented.

## Next questions, in order

1. **Connect the evidenced but isolated milestones.** Sixteen new entries lack both incoming and outgoing edges. This means unresolved research, not proven historical independence. Start with these specific questions rather than adding generic parents:
   - `catapult`, `counterweight-trebuchet`: which documented mechanisms, construction practices, and intermediates contributed to the selected forms? Do not infer descent from membership in the broad catapult category.
   - `rifling`, `flintlock-firearm`, `percussion-cap`, `machine-gun`, `smokeless-propellant`: identify immediate manufacturing, ignition, feeding, or material contributions at the dated milestone. Distinguish the hand-powered Gatling entry from later fully automatic systems. Keep descriptions at historical capability level.
   - `standing-army`, `conscription`, `military-logistics`, `military-academy`: investigate the specific Neo-Assyrian, French, and Savoyard institutions and their documented administrative support. Avoid a universal military-institution ladder.
   - `theodolite`, `coordinate-measuring-machine`: research the specific Sisson and early Ferranti instruments. A downstream inspection standard or demand for measurement is not automatically an input to their construction.
   - `normal-school`, `monitorial-instruction`, `french-administrative-court`: locate the particular institutional arrangements that preceded these implementations; do not attach generic education or governance roots just to connect them.
2. **Refine reusable rocket hardware paths.** The new Sputnik, Vostok-K, Jupiter-C, and Mercury-Redstone entries make the military-to-spaceflight route more legible. Further source work should distinguish retained R-7 stages from changes through Luna/Vostok-L, and add the particular life-support and recovery capabilities needed for human flight. Preserve independent Soviet orbital and American suborbital implementations.
3. **Expand precision, construction, and supply where dates are supported.** Revisit optical flats, sine bars, dial indicators, calibration traceability, underpinning, and other deferred construction practices. The research note records why some were deferred. Do not manufacture an origin date to fit the current single-year schema.
4. **Broaden institutional coverage across traditions and regions.** Revisit dated ijazah attestations, regional knowledge-preservation institutions, administrative systems, and trade/credit arrangements with specialist sources when the archive is insufficient. The current omission of an undated ijazah milestone is not a historical absence claim. Do not repeat the rejected claim that a coherent medieval Ottoman millet system existed in its later form.
5. **Expand other capability clusters by an explanatory question.** Candidate areas include mining and mineral processing, water management, textile production, food preservation, navigation, public-health organization, and scientific instruments. Inspect the complete current graph first: many obvious subjects already exist in the original expansion files. Article hyperlinks and category membership are discovery aids, never automatically generated edges.

## How another team resumes

- Read the relevant topic note and inspect the current complete authoring graph via `scripts/lib/catalog.mjs`; the numbers here are a dated snapshot.
- Claim one bounded question and disjoint source files. Search existing IDs, titles, and Wikipedia titles before proposing a new milestone. Keep stable IDs and record why an apparent duplicate is distinct.
- Prefer the local ZIM and ignored article cache. Retain archive identity, relevant source sections, uncertainty, and rejected alternatives in the topic note; retain supporting source URLs on edges. Full text remains outside Git.
- Agree on an integration owner. Agents do not concurrently rewrite compiled data, metadata, shared parent arrays, or one another's source files. Only the integration owner registers new files, integrates cross-file links, and compiles after all writers settle.
- Audit the complete authoring sources, compile, validate, and test the final snapshot. A clean structural audit does not establish historical truth. Source availability, claim support, and review freshness remain separate.
- Resolve new article titles locally and fetch only relevant image metadata. Review date/scope mismatches, duplicate concepts, reversed contributions, and taxonomic shortcuts before accepting a batch.

This queue uses the existing Git/manual workflow. It does not implement the planned proposal, evidence-fingerprint, stale-review, or autonomous queue APIs in the roadmap, and no recurring agent run is scheduled.
