# Humanity — the technology tree

A purely exploratory atlas of **2,175 human capabilities**: discoveries, tools, machines, infrastructure, institutions, and cultural practices. Built with Svelte 5, TypeScript, Vite, and Svelte Flow. The industrial interface takes inspiration from Factorio; it uses no Factorio assets.

## Design and agent workflow

The next development phase treats this as one inspectable knowledge system: versioned sources support evidence, evidence supports scoped claims, and the graph supplies reproducible views. The plan prioritizes reusable research and justified decisions alongside the nodes and connections.

- [Agent entry point](AGENTS.md): current rules and a short reading map.
- [System design](docs/SYSTEM.md): abstraction boundaries, evidence, review freshness, and coherent control.
- [Agent workflow](docs/AGENT-WORKFLOW.md): today's operating loop and clearly labeled future interface contracts.
- [Implementation roadmap](docs/ROADMAP.md): ordered milestones, migrations, and measurable acceptance gates.

These documents distinguish implemented behavior from planned tooling. They do not add a backend or change the current catalog or frontend.

## Run locally

Requires Node.js 22.12+ (Node 22 LTS recommended).

```sh
npm ci
npm run dev
```

Use the printed local URL. Search with `/` or Ctrl/Cmd+K. Scroll or drag to pan in any direction; pinch or Ctrl/Cmd+scroll to zoom. Click a capability to inspect it. Click a visible connection to jump to its other end and center that capability; links unrelated to the selection follow their arrow direction. Hover highlights the link and names the destination. **Full tree** applies category/era filters across the whole catalog. **Connections** shows two steps upstream and downstream from the selected capability. URL hashes such as `#node=microscope` can be bookmarked or shared without server routing.

```sh
npm run check          # Svelte and TypeScript
npm test              # Graph behavior and layout
npm run build         # Dataset validation and static production build
npm run preview       # Preview dist/
```

## GitHub Pages

The included `.github/workflows/pages.yml` builds and deploys pushes to `main` or a manual workflow run. Create/connect your GitHub repository, push this repository, and select **Settings → Pages → Source → GitHub Actions**. No remote repository is assumed or created by this project.

Vite's relative asset base (`./`) and hash navigation work at either `https://USER.github.io/` or `https://USER.github.io/REPOSITORY/`. Only `dist/` is deployed. There is no backend, database, API key, or runtime article API request.

Reference: [GitHub Pages deployment with Vite](https://vite.dev/guide/static-deploy.html#github-pages).

## What belongs in the tree?

A node represents a distinct capability: **something people learned to understand, make, or organize that opened further possibilities**. Both general capabilities (writing, metallurgy, cities) and specific realizations (a treaty, instrument, or manufacturing process) can qualify when their scope is explicit.

Connections answer **“How did this help make that possible?”** They are directed, many-to-many, and specific to the historical or technical route being described:

| Relationship | Meaning |
| --- | --- |
| Technical foundation | A material, tool, method, or result directly used in this particular development. Other routes may exist. |
| Enabling condition | Specific infrastructure, an institution, or a capability that directly supported development, adoption, or scale. |
| Historical influence | An identifiable idea or practice adapted or built upon in this particular historical development. |

This is not a game, an unlock system, or a universal sequence every society must follow. Religion, treaties, and institutions are first-class subjects; they are never presumed to be universal requirements for technological development. Nodes occupy chronological periods that expand with their population, rather than a proportional time axis. Same-period prerequisites advance through additional columns. Dates are approximate milestones. Era names are navigation aids and do not describe every region's periodization.

Each capability has one primary branch. Weapons & warfare covers specifically military equipment, fortifications, organization, doctrine, and supply practices. Classify the actual milestone: general-purpose tools, materials, propulsion, and diplomatic treaties keep their respective branches even when they have military uses. Connections explain contributions across branches. Cross-cutting themes are a possible future extension, not an implemented filter.

Branch boundaries follow the specific milestone rather than every possible use of it:

| Branch | Scope |
| --- | --- |
| Construction & settlements | Buildings, civil infrastructure, settlement forms, and urban planning |
| Measurement & standards | Quantitative instruments, calibration, units, tolerances, and standardization |
| Logistics & supply | Storage, handling, inventory, distribution, and delivery coordination |
| Trade & finance | Exchange, markets, money, credit, risk sharing, and commercial organization |
| Law & governance | Legal systems, public administration, representation, rights, and diplomacy |
| Education & knowledge institutions | Teaching, libraries, archives, and organized knowledge transmission and research |
| Religion & belief | Religious traditions, practices, texts, and institutions |

Transport covers vehicles and movement; logistics covers how supplies are handled and coordinated. General materials and manufacturing tools retain their respective branches. Society & institutions covers remaining social organization, welfare, and collective services. A branch is a browsing category, not evidence for a dependency.

The layout is calculated from the current view's nodes and connections in a local web worker. The eighteen branches form horizontal bands; prerequisites advance from left to right. Vertical bands use the same eras as the filters. The displayed population determines their subdivisions: periods with more than 24 capabilities split by powers of ten down to individual years. Single years expand into extra columns, with at most six cards from a branch in one column. Empty periods use no columns. Date boundaries, widths, branch heights, and routing corridors are recalculated whenever the displayed graph changes; adding catalog entries requires no hand-positioned bands. Starting points remain inside their own branches.

Each node's outbound relationships are routed together as an ordered fan-out. Destination bands, columns and heights determine the attachment-point order and nested routing tracks. Connected chains retain rows across date columns, and later dates cannot jump left of earlier ones. Long links use reusable corridors above or below the cards; a clear single-successor chain can cross skipped columns directly. A final clearance pass aligns facing ports into straight links wherever possible, or uses one smooth S-curve for a change of height. It retains detours when simpler candidates conflict with cards or same-source links. Geometric port and track ordering reduces avoidable crossings. See [layout design and measured results](docs/LAYOUT.md), or run `npm run layout:analyze -- --node dirac-equation` to inspect a view. Links from the same source remain separate without crossing or touching; unrelated sources can still cross, with a visual break distinguishing crossings from junctions. Filtering or changing the focused neighborhood recalculates the arrangement. Panning and zooming keep positions stable. Dragging, scrolling, keyboard commands, zoom controls and minimap navigation stop at the occupied cards and routed detours plus a 240-world-unit margin on all four sides. A viewport larger than that area centers it. **Fit visible tree** includes the entire current view and its routed connections. Click a branch, era or date label to fit its area. Cyan dashed enablers, pink dotted influences and amber foundations retain their colors even when unselected, with screen-sized strokes and dark crossing outlines.

An article reference is not a dependency. Importing more Wikipedia content will not automatically establish useful prerequisites. Nodes without parents may be starting points or incomplete research; nodes without any links need further editorial connections. Filters can also hide an otherwise connected node's neighbors.

## Large graphs and level of detail

The canvas uses three levels of detail: aggregate counts at overview scale, lightweight node marks at medium zoom, and image cards close up. Click a group to zoom into it, or click a simplified node to open it. Search remains available at every scale. Arrow keys pan a focused canvas, `+`/`-` zoom, and Home fits the view.

Node and edge spatial indexes avoid scanning the full graph every frame. Density levels are built once per layout; canvas drawing is coalesced with animation frames. At most 120 DOM cards are mounted, with budgets of 1,800 raster marks and 700 routed links. Dense views switch detail levels rather than mounting more cards. Overview hides individual links; intermediate views can show only the selected node's connections, as indicated on the canvas. The minimap is also a raster surface.

`npm test` includes a synthetic 20,000-node fixture, aggregate-count conservation, viewport picking, rendering budgets and fan-out geometry. With `npm run dev` running, open `/tests/benchmark.html` for an interactive 1,000–50,000-node fixture using the same graph component. The fixture and measurements do not enter the production build. Browser checks have also exercised 50,000 synthetic nodes; this is not a claim that all Wikipedia articles have been incorporated or that arbitrary million-node graphs are validated.

## Catalog and editorial status

- `data/engineering.json`: 400 material, machine, energy, transport, and food entries.
- `data/science.json`: 350 science, medicine, and information entries.
- `data/society.json`: 250 institutional and cultural entries.
- The original `data/engineering-expansion.json`, `data/science-expansion.json`, and `data/society-expansion.json` add 400, 350, and 250 entries respectively. Source filenames indicate authoring ownership; each node's `domain` controls its displayed band.
- `data/warfare-expansion.json`, `data/built-world-expansion.json`, and `data/institutions-expansion.json`: offline-researched topic batches; see the [expansion queue](docs/research/EXPANSION-QUEUE.md) for scope and remaining questions.
- `data/*-connections.json`: researched intermediate capabilities added while refining the routes between existing milestones.
- `data/connections.json`: explicit cross-domain contributions.
- `public/data/catalog.json`: compiled, static application data.
- `public/data/wikipedia.json`: cached article identifiers, Wikimedia image URLs, and attribution metadata.
- `public/data/offline-index.json`: article matches in the local ZIM, once imported.

The current catalog contains 2,175 nodes and 2,490 connections, including the original 90 connection intermediates and 85 new topic-batch milestones. All 2,175 article references resolve in the local archive. Connection review revised the parents of 348 existing nodes, replacing remote ancestry with specific contributions and documenting independently used tools and materials.

Edit the source catalogs, then run `npm run data:compile` to update the local preview. Production builds also compile the catalogs automatically. Every edge must name an existing node, carry a relationship type, and explain a specific contribution. Validation checks unique IDs and titles, schema, references, chronological direction, cycles, and unresolved connection-review flags. It **does not establish historical truth**.

The expanded catalog is an editorial draft. Dates are approximate milestones, not always the earliest instance worldwide. Relationships are proposed interpretations awaiting individual source review. A resolved Wikipedia URL or offline article match only proves that the reference exists. Treat disputed origins, independent inventions, and socially contingent claims with particular care.

### Making connections

Connect the **nearest specific contribution** to the target milestone. Match the parent's actual scope: observing bacteria, growing a pure bacterial culture, and demonstrating bacterial transformation are different capabilities. For DNA as hereditary material, the transformation experiments and DNA preparation supply much more immediate experimental contributions than the first observation of bacteria. Earlier discoveries remain reachable through intermediate steps and branches.

Use an existing intermediate where it explains the dependency; add a supported missing capability when necessary. An article link, shared topic, chronological order, or distant common ancestor does not establish a dependency. Preserve multiple independent inputs. A microscope, vacuum pump, material, or mathematical method can still contribute directly alongside a longer chain of discoveries.

```sh
npm run data:audit-connections
npm run data:audit-connections -- --json
npm run data:audit-connections -- --check
npm run data:compile
npm run validate:data
```

The audit reads the current source catalogs, including added intermediates and supplemental connections. It flags edges with an alternate multi-step path, and discovery/observation/isolation milestones reused at least 100 years later. The latter is a review heuristic for missing methods, not a historical cutoff. Reports include the alternate route and its relationship types; mixed types do not imply logical equivalence. No edges are automatically inferred, removed, or replaced.

Resolve a flag by correcting the shortcut or documenting the independent direct role in that parent's `directContribution` field. The detail panel shows that explanation as **Direct role**. Keep a supporting URL in `source` when checked. Explanations must describe the concrete contribution rather than merely dismiss the audit; validation checks their presence, not their truth. Builds fail on unresolved flags so later catalog additions cannot silently introduce a newly redundant route. See [AGENTS.md](AGENTS.md) for the authoring rules.

## Offline-first research

The main reference archive is Kiwix's full English Wikipedia with images, August 2026:

```text
F:\Wikipedia\wikipedia_en_all_maxi_2026-08.zim
127,418,087,648 bytes
SHA-256: 34162d18b9f96f494eac48a73a309c72e0bc95d85f76be405d0f5de795854aa6
```

`scripts/download-wikipedia.ps1` downloads/resumes the archive, verifies its size and the official SHA-256, and writes `F:\Wikipedia\download-status.json`. While downloading, the current progress is the `.part` file's size; the status JSON changes at stage transitions. The `.zim` final name appears only after checksum verification. Re-running the script resumes a partial transfer or verifies the complete archive. It will not overwrite a mismatched complete archive.

Source: [official Kiwix archive](https://download.kiwix.org/zim/wikipedia/), [checksum manifest](https://download.kiwix.org/zim/wikipedia/wikipedia_en_all_maxi_2026-08.zim.meta4).

After downloading, resolve the tree against the archive without any network calls:

```sh
python -m pip install -r scripts/requirements.txt
python scripts/offline-import.py --archive F:/Wikipedia/wikipedia_en_all_maxi_2026-08.zim
# Optional focused extraction:
python scripts/offline-import.py --archive F:/Wikipedia/wikipedia_en_all_maxi_2026-08.zim --ids microscope,bacteria
```

The importer writes article text to ignored `.cache/wiki-research/` for local research and a small reference index to `public/data/`. It does not automatically replace the editorial summaries or mark claims as reviewed. The full archive never enters Git or the Pages build.

## Images and attribution

Pictures point directly at Wikimedia's CDN. `npm run data:enrich` performs **cached, throttled metadata-only requests** for article IDs, image locations, artists, and licenses. It does not fetch article bodies or scrape article pages. It runs manually, never during the normal build or in visitors' browsers. Existing results are reused; changed titles are refreshed. On Windows installations using the system certificate store, use `node --use-system-ca scripts/enrich-wikipedia.mjs` with a current Node 22 release. Use `-- --ids=microscope,bacteria --refresh` for a focused update.

Some articles have no suitable lead image. These use a category symbol. Loading failures also degrade to that symbol, keeping navigation usable. Wikimedia images retain their original individual licenses, with credits and source-page links displayed beside the picture. Wikipedia article text remains attributable to its contributors under its applicable license; locally extracted text is research material, not included in the deployed bundle. Original catalog prose is not copied from Wikipedia introductions.

The frontend works if image hosts are unavailable. External images and fonts require a connection; the catalog itself is served as static local data.

## Project structure

`src/App.svelte` owns browsing state and panels; `src/lib/Graph.svelte` owns the canvas and controls. `src/lib/graph.js` contains neighborhood, search, and filter functions. `src/lib/timeline.js` subdivides eras and allocates date columns; `src/lib/placement.js` aligns chains and allocates rows; `src/lib/layout.js` assembles cards and bands; `src/lib/fanout.js` creates safe fallback routes; `src/lib/simplify-routes.js` removes unnecessary bends; `src/lib/route-geometry.js` defines curve drawing and envelopes. `src/lib/layout-client.js` and `src/lib/layout.worker.js` manage background layout and recent-view caching. `src/lib/spatial.js` supplies scene/card indexes; `src/lib/scene.js` builds the scene and chooses detail levels; `src/lib/draw-scene.js` draws the raster layers. `src/lib/viewport.js` defines bounded navigation. `src/lib/config.ts` defines domains and relation labels; era definitions are shared with the worker through `timeline.js`.
