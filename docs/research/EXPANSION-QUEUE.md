# Wikipedia expansion queue

Status: fourth coordinated expansion batch integrated, 2026-10-10. The graph is an editorial selection of capabilities, not a complete representation of Wikipedia. Resolving an article is not validation of its historical claims or every relationship.

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

At the end of the second batch, twenty additions had neither incoming nor outgoing links. Reuse the topic notes to research their actual inputs or applications:

- Computing: `shellsort`, `trie`, `entity-relationship-model`, `express-olap`.
- Production: `ball-mill`, `carding-machine`, `copper-electrorefining`, `frasch-process`, `froth-flotation`, `hydraulic-mining`, `mauveine`, `patio-process`, `roller-printing-textiles`, `synthetic-alizarin`, `synthetic-indigo`, `wool-combing-machine`.
- Public health: `ragusa-maritime-quarantine`, `liverpool-medical-officer-of-health`, `nyc-metropolitan-board-of-health-1866`, `public-health-nursing`.

## Third coordinated batch (2026-10-08)

Three Luna High agents resumed their topic work, using disjoint files and proposed supplemental edges. Integration reviewed exact date and parent scope, added measurement evidence, and applied the accepted proposals once all writers finished.

| Batch | Added nodes | Added edges, including supplements | Evidence |
| --- | ---: | ---: | --- |
| String indexes, data models, and analytics | 17 | 20 | [Computing](computing-expansion-3.md) |
| Carding, textile mills/printing, and silver processing | 12 | 13 | [Production](production-expansion-3.md) |
| Sanitary investigations, public administration, and laboratories | 12 | 11 | [Public health](public-health-expansion-3.md) |
| Instrument manufacture and geodetic measurement | 7 | 13 | [Measurement](measurement-expansion-3.md) |

**48 nodes and 57 edges added; total 2,292 nodes and 2,600 edges.** All new references and the corrected League health reference resolve locally. The 48 additions have 37 CDN images; 11 use the image fallback. No existing edges were removed. One existing milestone was corrected: the League's permanent Health Organization is dated to formal establishment in 1923, with official-source references retained in the public-health note. This is separate from earlier planning and provisional health activity.

Eight formerly isolated entries gained supported connections: `trie`, `entity-relationship-model`, `carding-machine`, `patio-process`, `roller-printing-textiles`, `liverpool-medical-officer-of-health`, `nyc-metropolitan-board-of-health-1866`, and `public-health-nursing`. The new `venetian-forty-day-quarantine` and `public-health-laboratory-service-1946` remain isolated. The Ragusan/Venetian chronology does not alone prove a transfer, and conflicting Emergency PHLS dates remain unresolved. Further connections must explain actual contributions, not fill blank space.

Useful new routes include ER model and relational theory → IDEF1 → IDEF1X; carding machinery → dated mill implementations; Duncan's local evidence and legislation → health offices; and Ramsden's screw-cutting lathe → dividing engine → great theodolite → survey results. The independently measured Hounslow baseline supplies a separate input to the last result.

Most research used the local archive. Small official-history checks were needed where archive accounts contradicted one another. An empty-page issue was traced to archive-local HTML section redirects; the improved local reader recovered the Washoe and great-theodolite evidence. That finding is recorded in the operating workflow. Image metadata remains separate: the vernier crop needed its original photographer/crop credit filled from Commons file descriptions, because the API omitted the artist field.

Combined verification passed: the complete authoring-source audit has zero unresolved candidates and retains 65 independently explained direct contributions. Compilation and data validation passed; Svelte/TypeScript checks found zero errors or warnings; all 51 tests and the static production build passed. The local development server was checked and serves 2,292 nodes and 2,600 edges. No interactive browser check was performed for this data-only batch.

## Fourth coordinated batch (2026-10-10)

Three Luna High agents researched separate files using the offline archive. Integration reviewed the proposed scope, dates, and actual contributions before applying accepted changes; rejected candidates remain documented in the topic notes.

| Batch | Added nodes | Added edges, including supplements | Evidence |
| --- | ---: | ---: | --- |
| Marine longitude, instruments, tables, and sea trials | 8 | 14 | [Navigation](navigation-expansion-4.md) |
| Monitorial schools, teacher preparation, and institutional succession | 5 | 4 | [Institutions](institutions-expansion-4.md) |
| Dye manufacture, flotation development, and economical sulfur extraction | 8 | 8 | [Production](production-expansion-4.md) |

**21 nodes and 26 edges added, with two old edges removed: total 2,313 nodes and 2,624 edges.** Five previously isolated milestones gained supported connections: `monitorial-instruction`, `french-administrative-court`, `mauveine`, `frasch-process`, and `froth-flotation`. Every new node participates in at least one connection; roots still have unresolved prerequisites rather than an implied claim of independence.

Three existing milestones were corrected while preserving IDs. `sextant` now dates Bird's brass prototype to 1759, with the 1731 octant represented separately. `marine-chronometer` now describes Harrison's H4 completed in 1759, with its 1761 departure/1762 trial result represented separately and the Jefferys watch's reused features as its immediate input. `monitorial-instruction` now identifies Bell's dated Madras implementation, distinct from Lancaster's school. The broad optical-lens-to-sextant and pendulum-clock-to-H4 links were replaced. The octant's retained instrument design is independently direct despite the alternate route through Campbell's sea trial.

New paths include Cattermole's patented process → the company formed to develop it → the successful 1905 froth-flotation process; Spindletop fuel supply and Frasch extraction → economic sulfur production; and Lancaster's school → teacher training and a society explicitly adopting its method. A date conflict about Borough Road College is preserved by scoping the new node to the 1809 male-apprentice training attestation rather than an undisputed founding date. The French royal council link records documented institutional influence across a revolutionary break, not continuous operation.

All 21 new article references and H4's changed reference resolve in the local archive. Twenty additions have CDN images; the National Society uses the normal image fallback. Historical article-body research stayed offline. Network access fetched image/reference metadata and one Commons file description to recover its omitted author credit. No new image has an unresolved artist or license field after that correction. Article support and clean checks do not amount to independent specialist verification.

Verification passed on the integrated graph: full-source connection audit (zero unresolved flags, 66 independently explained direct contributions), compilation, data validation, all 51 tests, and the static production build. The restarted local preview was checked over HTTP and serves the same 2,313 nodes and 2,624 connections. This data-only batch did not rerun Svelte checking or interactive browser testing; no UI code changed.

## Next questions, in order

1. **Connect the evidenced but isolated milestones.** Thirteen entries from the first batch still lack both incoming and outgoing edges after connecting the theodolite, Bell's monitorial implementation, and the French Council of State. This means unresolved research, not proven historical independence. Start with these specific questions rather than adding generic parents:
   - `catapult`, `counterweight-trebuchet`: which documented mechanisms, construction practices, and intermediates contributed to the selected forms? Do not infer descent from membership in the broad catapult category.
   - `rifling`, `flintlock-firearm`, `percussion-cap`, `machine-gun`, `smokeless-propellant`: identify immediate manufacturing, ignition, feeding, or material contributions at the dated milestone. Distinguish the hand-powered Gatling entry from later fully automatic systems. Keep descriptions at historical capability level.
   - `standing-army`, `conscription`, `military-logistics`, `military-academy`: investigate the specific Neo-Assyrian, French, and Savoyard institutions and their documented administrative support. Avoid a universal military-institution ladder.
   - `coordinate-measuring-machine`: research the early Ferranti two-axis instrument. Later three-axis machines, computer control, and contemporary granite/air-bearing descriptions cannot establish its original inputs. Sisson's theodolite now has telescope, spirit-level, and separately scoped vernier-scale inputs. The Ramsden instrument-manufacturing route is also represented; distinguish its 1787 Royal Society instrument from the later 1791 Board of Ordnance instrument in any national-survey extension.
   - `normal-school`: find an explicit organizational, personnel, or teaching-model transfer into the dated Reims school. The fourth-batch note records why La Salle's earlier teacher community was not enough to establish that edge. Bell's implementation and the French Council of State now have supported outgoing or incoming relationships; reuse their new scopes.
2. **Refine reusable rocket hardware paths.** The new Sputnik, Vostok-K, Jupiter-C, and Mercury-Redstone entries make the military-to-spaceflight route more legible. Further source work should distinguish retained R-7 stages from changes through Luna/Vostok-L, and add the particular life-support and recovery capabilities needed for human flight. Preserve independent Soviet orbital and American suborbital implementations.
3. **Expand precision, construction, and supply where dates are supported.** Revisit optical flats, sine bars, dial indicators, calibration traceability, underpinning, and other deferred construction practices. The research note records why some were deferred. Do not manufacture an origin date to fit the current single-year schema.
4. **Broaden institutional coverage across traditions and regions.** Revisit dated ijazah attestations, regional knowledge-preservation institutions, administrative systems, and trade/credit arrangements with specialist sources when the archive is insufficient. The current omission of an undated ijazah milestone is not a historical absence claim. Do not repeat the rejected claim that a coherent medieval Ottoman millet system existed in its later form.
5. **Expand other capability clusters by an explanatory question.** Resume the latest topic notes, including the fourth-batch navigation, institutions, and production records before expanding mining, textiles, water treatment, computing, or public-health organization. Their rejected candidates and specific missing inputs are the starting queue. Food preservation, navigation, and scientific instruments are additional candidate areas. Inspect the complete current graph first: many obvious subjects already exist in the original expansion files. Article hyperlinks and category membership are discovery aids, never automatically generated edges.

## How another team resumes

- Read the relevant topic note and inspect the current complete authoring graph via `scripts/lib/catalog.mjs`; the numbers here are a dated snapshot.
- Claim one bounded question and disjoint source files. Search existing IDs, titles, and Wikipedia titles before proposing a new milestone. Keep stable IDs and record why an apparent duplicate is distinct.
- Prefer the local ZIM and ignored article cache. Retain archive identity, relevant source sections, uncertainty, and rejected alternatives in the topic note; retain supporting source URLs on edges. Full text remains outside Git.
- Agree on an integration owner. Agents do not concurrently rewrite compiled data, metadata, shared parent arrays, or one another's source files. Only the integration owner registers new files, integrates cross-file links, and compiles after all writers settle.
- Audit the complete authoring sources, compile, validate, and test the final snapshot. A clean structural audit does not establish historical truth. Source availability, claim support, and review freshness remain separate.
- Resolve new article titles locally and fetch only relevant image metadata. Review date/scope mismatches, duplicate concepts, reversed contributions, and taxonomic shortcuts before accepting a batch.

This queue uses the existing Git/manual workflow. It does not implement the planned proposal, evidence-fingerprint, stale-review, or autonomous queue APIs in the roadmap, and no recurring agent run is scheduled.
