# Measurement expansion 2: leveling the Sisson theodolite

Integration status: accepted into the complete catalog on 2026-10-08; see the [expansion queue](EXPANSION-QUEUE.md) for combined verification. The research and per-agent checks below describe the authoring handoff.

Offline review, 2026-10-08. One node was added to `data/built-world-expansion.json`; two parents of the existing `theodolite` were added in `data/connections.json`. This closes one previously isolated milestone with documented components rather than an assumed general precision-engineering prerequisite.

## Evidence and scope

Archive: `F:/Wikipedia/wikipedia_en_all_maxi_2026-08.zim`, UUID `50e94998-c1ec-b5e7-ec34-499f1d907c30`. Focused article text remains in ignored `.cache/expansion-2-review/`. No article bodies were fetched from the web.

- [Spirit level](https://en.wikipedia.org/wiki/Spirit_level), History and Design and construction: Thevenot's correspondence establishes the instrument existed by February 1661; this is an attestation date, not a claim of widespread adoption. Early tubular instruments used curved glass vials, liquid, and an air bubble. Existing glassmaking supplies the actual transparent vial material.
- [Theodolite](https://en.wikipedia.org/wiki/Theodolite), History: Sisson's 1725 instrument explicitly combined a sighting telescope, spirit levels on its base plate, adjusting screws, and vernier readout. Telescope and spirit level perform separate direct roles in aiming and leveling. The existing 1774 precision-machining and 1848 micrometer nodes cannot be retrojected into this 1725 instrument.

## Deferred questions

- Sisson's vernier readout is also documented, but the current `vernier-caliper` milestone describes a complete jawed measuring instrument, not the scale alone. A caliper-to-theodolite edge would misstate the contribution. A separately scoped vernier-scale node and the caliper date deserve a coordinated review before adding this path.
- The [coordinate-measuring machine](https://en.wikipedia.org/wiki/Coordinate-measuring_machine) article dates Ferranti's early two-axis machines to the 1950s, three-axis models to the 1960s, and computer control to the 1970s. Its description of contemporary probes, air bearings, and granite tables cannot by itself establish those inputs for the existing 1950 milestone. It remains unresolved.
- Ramsden's later dividing engine and great theodolite offer a useful machine-making-instrument path. The checked articles use different approximate dates and the separate Great theodolite entry returned no useful body through the focused reader. This extension is deferred until the exact instrument and engine milestone are supported; no later screw-cutting lathe was used as an anachronistic parent.

Article availability, source support, and independent historical review remain separate. No `reviewed` claim was set.

## Subsequent work

Batch 3 added the separate vernier-scale component and recovered the great-theodolite source through its archive-local HTML redirect. The [measurement follow-up](measurement-expansion-3.md) records the dated machine-to-instrument-to-survey route. The Ferranti CMM question remains open.
