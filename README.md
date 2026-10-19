# ShapeGrammar

A dark, monochrome learning site for shape grammars, sets and symmetry, with parallel reading paths through George Stiny and Terry Knight. The interface follows Nijat Mahamaliyev’s personal HTMAA website.

The application includes:

- **34 short lessons:** 16 shape grammar, 8 set theory and 10 group theory lessons, with worked examples, 68 checked questions, practice prompts, hints and solutions.
- **An exact line laboratory:** drawing, visual and coordinate rule editing, finite matching, manual alignment, separate witness/part/result counts, pan/zoom, derivation history and validated workspace import/export.
- **98 reference records:** searchable by topic, author and title; 20 permitted, unmodified PDFs; Stiny and Knight indexes, source locators and explicit review/rights notes.
- **10 research pathways and a 33-term glossary**, including a guided introduction to the Monster and moonshine with prerequisite boundaries.
- **Private notes and progress:** automatic browser storage for study notes, portable backups, import validation and explicit laboratory save/restore.

Start a local preview:

```bash
npm run dev
```

Open **http://127.0.0.1:8765/**. The laboratory is at `lab.html`. No package installation is needed; Node.js ≥20 and Python ≥3.9 are sufficient. Modules require HTTP, so opening the HTML as a local file is insufficient.

Run verification and create the production folder:

```bash
npm run check
npm run build
node tools/check-site.mjs --dist
```

The [release validation](docs/RELEASE_VALIDATION.md) records actual tests, browser observations, performance measurements and remaining limits. The [mathematical model](docs/MATHEMATICAL_MODEL.md) states exact geometry conventions and the finite search scope. The [deployment guide](docs/DEPLOYMENT.md) explains the prepared, manually triggered GitHub Pages workflow. Publication remains owner-controlled.

The engine uses rational arithmetic and geometric coverage rather than matching original stroke objects. A subsegment can span old drawing boundaries. Searches run in a worker where supported and explicitly report cancellation, time, candidate or witness limits as incomplete results. This restricted model handles unlabelled straight-line shapes; color, material, curved, free-angle and higher-dimensional algebras remain reading topics.

Start the scholarly reading route with the [catalogue](Reference/CATALOGUE.md), [George Stiny index](Reference/authors/george-stiny/README.md), [Terry Knight index](Reference/authors/terry-knight/README.md), and [curriculum coverage](Reference/COVERAGE.md). Knight’s 55 associated records include byline work, editorial roles and named contributions; unresolved leads are documented rather than described as a complete collected works.

Notes stay on the browser’s current origin and are not sent to a server. Export backups before moving between localhost and Pages. The optional IBM Plex Mono font is requested from Google Fonts with local fallbacks. Third-party publications retain their own rights: the [attribution ledger](Reference/RIGHTS_AND_ATTRIBUTION.md) governs saved originals; a reading link does not itself grant permission to republish a work.
