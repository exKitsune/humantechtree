# Humanity — the technology tree

A purely exploratory atlas of **1,000 human capabilities**: discoveries, tools, machines, infrastructure, institutions, and cultural practices. Built with Svelte 5, TypeScript, Vite, and Svelte Flow. The industrial interface takes inspiration from Factorio; it uses no Factorio assets.

## Run locally

Requires Node.js 22.12+ (Node 22 LTS recommended).

```sh
npm ci
npm run dev
```

Use the printed local URL. Search with `/` or Ctrl/Cmd+K. Drag the canvas, scroll/pinch to zoom, and click a capability to inspect it. **Full tree** applies category/era filters across the whole catalog. **Connections** shows two steps upstream and downstream from the selected capability. URL hashes such as `#node=microscope` can be bookmarked or shared without server routing.

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
| Technical foundation | A tool, material, or body of knowledge used by the particular technology or method shown. It is not a claim that no alternative route exists. |
| Enabling condition | A capability or institution that supported development, adoption, or scale. |
| Historical influence | An earlier idea or practice that shaped a particular development. |

This is not a game, an unlock system, or a universal sequence every society must follow. Religion, treaties, and institutions are first-class subjects; they are never presumed to be universal requirements for technological development. Nodes are arranged by dependency depth, with approximate dates displayed, rather than a proportional chronological axis. Era names are navigation aids and do not describe every region's periodization.

## Catalog and editorial status

- `data/engineering.json`: 400 material, machine, energy, transport, and food entries.
- `data/science.json`: 350 science, medicine, and information entries.
- `data/society.json`: 250 institutional and cultural entries.
- `data/connections.json`: explicit cross-domain contributions.
- `public/data/catalog.json`: compiled, static application data.
- `public/data/wikipedia.json`: cached article identifiers, Wikimedia image URLs, and attribution metadata.
- `public/data/offline-index.json`: article matches in the local ZIM, once imported.

Edit the source catalogs, then run `npm run data:compile` to update the local preview. Production builds also compile the catalogs automatically. Every edge must name an existing node, carry a relationship type, and explain a specific contribution. Validation checks uniqueness, schema, references, and cycles. It **does not establish historical truth**.

The first edition is an editorial draft. Dates are approximate milestones, not always the earliest instance worldwide. Relationships are proposed interpretations awaiting individual source review. A resolved Wikipedia URL or offline article match only proves that the reference exists. Treat disputed origins, independent inventions, and socially contingent claims with particular care.

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

Pictures point directly at Wikimedia's CDN. `npm run data:enrich` performs **cached, throttled metadata-only requests** for article IDs, image locations, artists, and licenses. It does not fetch article bodies or scrape article pages. It runs manually, never during the normal build or in visitors' browsers. Existing results are reused; changed titles are refreshed. Use `-- --ids=microscope,bacteria --refresh` for a focused update.

Some articles have no suitable lead image. These use a category symbol. Loading failures also degrade to that symbol, keeping navigation usable. Wikimedia images retain their original individual licenses, with credits and source-page links displayed beside the picture. Wikipedia article text remains attributable to its contributors under its applicable license; locally extracted text is research material, not included in the deployed bundle. Original catalog prose is not copied from Wikipedia introductions.

The frontend works if image hosts are unavailable. External images and fonts require a connection; the catalog itself is served as static local data.

## Project structure

`src/App.svelte` owns browsing state and panels; `src/lib/Graph.svelte` owns the canvas; `src/lib/graph.js` contains independently tested layout, neighborhood, search, and filter functions. `src/lib/config.ts` defines domains, eras, and relation labels. The graph renders only the visible part of the canvas to keep the 1,000-node view usable.
