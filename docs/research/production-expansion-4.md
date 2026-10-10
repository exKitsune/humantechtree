# Production and materials expansion 4

Integration status: accepted on 2026-10-10. Source files are registered, accepted supplements are in `data/connections.json`, and existing-node corrections are applied. See the [expansion queue](EXPANSION-QUEUE.md#fourth-coordinated-batch-2026-10-10) for final combined counts and checks. The research account below preserves the contributor handoff and integration decisions.

Authoring handoff: this batch adds 8 dated milestones and 7 authored parent edges. One incoming edge to existing `froth-flotation` is proposed in `.cache/production-expansion-4/supplemental-edges.json`.

## Scope and archive

This pass revisits isolated mineral and industrial-chemistry milestones from production batches 2 and 3. The focused question was whether the local archive names specific contributions to those capabilities or dated downstream implementations. Article text came from `F:/Wikipedia/wikipedia_en_all_maxi_2026-08.zim`, UUID `50e94998-c1ec-b5e7-ec34-499f1d907c30`, using `.cache/read-wiki-resolved.py`. Focused extracts remain under `.cache/production-expansion-4/`; no network article research was used.

## Supported nodes and relationships

- `perkin-mauveine-dyeworks` (1857): “Mauveine” says Perkin opened a dyeworks the year after his 1856 discovery and mass-produced the dye there. The new dated implementation links to the existing `mauveine` product. This separates the discovery date from the commercial factory date.
- `cattermole-oil-agitation-flotation` (1902): “Froth flotation” describes Cattermole's process as a small amount of oil, violent agitation, and slow stirring that formed mineral nodules for gravity separation. The source says it proved unsuccessful; this is a distinct attempted process, not the 1897 Elmore oil-agglomeration process or the later Sulman–Picard–Ballot froth method.
- `minerals-separation-ltd-flotation-research` (1903): “Froth flotation” says the company formed in Britain to acquire Cattermole's patent, found that process unsuccessful, and continued testing and combining other discoveries before patenting the Sulman–Picard–Ballot process in 1905. The new institution links from Cattermole's process as the specific patent it acquired. The proposed `minerals-separation-ltd-flotation-research -> froth-flotation` edge records the documented research and patenting contribution to the existing 1905 Broken Hill capability.
- `spindletop-oilfield` (1901): “Spindletop” dates its well's oil discovery to January 10, 1901 and says the volume made petroleum fuel economically feasible for mass consumption. It is left without a parent: the broad 1859 `oil-well` milestone does not identify the particular drilling equipment or practice used at Spindletop. A shared purpose does not establish that implementation's direct technical input.
- `frasch-sulphur-mines-production` (1903): “Frasch process” distinguishes the 1894 first successful extraction from economic production at Sulphur Mines, Louisiana, in 1903. It states that the 1901 Spindletop discovery provided cheap fuel oil, overcoming the process's high heating cost. The new implementation therefore has both the Frasch method and Spindletop as parents; neither is backdated into the 1894 invention.
- `zinc-corporation-broken-hill-flotation` (1910): “Froth flotation” says the Zinc Corporation replaced its earlier Elmore oil-agglomeration process at Broken Hill with Minerals Separation's Sulman–Picard–Ballot froth-flotation process. This is a later installation of the existing 1905 capability; Elmore's 1897 process remains distinct.
- `butte-superior-flotation-test-plant` (1911): “Froth flotation” dates Hyde's first U.S. froth-flotation test installation at the Butte and Superior Mill to 1911. It links to the process applied at the plant.
- `butte-superior-flotation-works` (1912): “Froth flotation” says Hyde designed the Butte and Superior zinc works in 1912, describing it as the first large flotation plant in America. It links directly to the flotation process. No causal edge is drawn from the 1911 test plant because the source establishes chronology but not transfer of a test result or design.

## Deferred or rejected links

The 1870 ball mill remains isolated. “Froth flotation” says ore is ground before the process, but “Ball mill” reports its 1870 use for pottery flint and describes later ore applications without identifying a ball mill in the dated Broken Hill implementation.

The 1870 Pembrey copper-electrorefining plant remains isolated. “Electrowinning” dates the plant, and “Copper extraction” describes blister copper as feed to electrorefining, but the inspected passages do not identify a specifically dated smelting capability or feedstock chain at Pembrey. No general electrolysis-law or electroplating edge is proposed.

The proposed 1832 anthracene-isolation node and its edge to the 1868 synthetic-alizarin route were deferred. The archive establishes discovery and later reagent use, but does not identify the preparative route that supplied the later experiment; first isolation is not evidence for every subsequent production method. It separately dates coal-tar anthracene extraction as an industrial development to 1871, after the 1868 synthesis; that later account should not be backdated as its feedstock source.

No Béchamp-aniline edge is added to the 1856 mauveine discovery or 1857 dyeworks. The archive says Béchamp's 1854 method made aniline production easier and that aniline dyes were produced at scale, but it does not identify the method as Perkin's source of aniline. Perkin's dye works is retained because the source directly documents it as the site that mass-produced mauveine.

The 1877 Bessel graphite process is not added as an ancestor to the 1905 Broken Hill process. Although the archive says some regard it as a root of froth flotation, it also says the process was largely forgotten; direct transfer to Sulman–Picard–Ballot is not documented. No input edge is proposed from aniline to Pfleger's 1901 indigo route either: the article's accounts conflict on commercial priority, and this pass does not establish a dated supply path for the specific route.

Article-level dates and descriptions identify the implementations and stated relationships but do not replace specialist review of patents, plant records, or local industrial archives.

## Focused archive passages

- “Mauveine,” history; `https://en.wikipedia.org/wiki/Mauveine`.
- “Froth flotation,” Cattermole, Minerals Separation Ltd, Zinc Corporation, and Butte and Superior passages; `https://en.wikipedia.org/wiki/Froth_flotation`.
- “Spindletop,” discovery and history; `https://en.wikipedia.org/wiki/Spindletop`.
- “Frasch process,” history and process; `https://en.wikipedia.org/wiki/Frasch_process`.
- “Ball mill,” history and applications; `https://en.wikipedia.org/wiki/Ball_mill`.
- “Copper extraction,” refining; “Electrowinning,” history and process; `https://en.wikipedia.org/wiki/Copper_extraction` and `https://en.wikipedia.org/wiki/Electrowinning`.
- “Aniline,” history and synthetic-dye-industry passages; `https://en.wikipedia.org/wiki/Aniline`.
- “Anthracene,” history and occurrence; “Alizarin,” age of synthetic alizarin; `https://en.wikipedia.org/wiki/Anthracene` and `https://en.wikipedia.org/wiki/Alizarin`.
- “Indigo dye,” chemical synthesis and synthetic development; `https://en.wikipedia.org/wiki/Indigo_dye`.
