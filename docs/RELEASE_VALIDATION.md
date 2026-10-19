# Release validation

Local release review on **19 October 2026**. No Git commands, repository/account APIs, commits, pushes or deployment actions were performed. The static application and a manually triggered Pages workflow are ready for owner review; hosted deployment has not been executed.

## Automated evidence

`npm run check` passes **32 tests**, reference integrity validation and local link checks. `npm run build` produces the curated `dist/` folder; `node tools/check-site.mjs --dist` checks its exact file list and validates the reference collection again inside the clean distribution.

| Area | Evidence |
| --- | --- |
| Geometry | 13 core tests for exact fractions, maximal lines, parthood, arithmetic, shared transformations, finite domains, ambiguity, limits and replay |
| Independent oracle | 192 host/query fixture pairs × 144 transformations = 27,648 candidates; complete witness sets agree with a separately implemented integer oracle |
| Curriculum/explorers | Five tests check all 34 lessons, sources/navigation, 10 research paths, glossary links, finite sets, half-step geometry, domain counts and Monster arithmetic |
| Group operations | Every D₄ product, inverse and all 512 associativity triples checked; four orbit/stabilizer examples verified |
| Worker transport | Three tests cover exact serialized results, cancellation, time limits and the non-worker fallback |
| Study data | Six tests cover completion requirements, persistence, literal note text, rejected replacements, corrupt-data recovery, quota errors and input limits |
| Lab workspace | Five tests cover exact round trips, redo cursor, selected rule, legacy files, tampered replay, malformed/future formats and resource/storage boundaries |
| References | 98 canonical records, 20 unchanged PDF byte counts/SHA-256 hashes, coverage IDs and local-only preserved-file checks when present |
| Portability | Reference validation succeeds inside `dist/`, where the excluded pre-existing Stiny PDF is absent |
| Public boundaries | Curated file manifest checked exactly; prompts/configuration, private exports, Git data and unregistered originals excluded; an injected test export was correctly rejected |
| Paths | Public Markdown/HTML/local-original targets checked; all declared production files served successfully beneath `/dist/`, with valid JavaScript-module MIME types |

The complete original collection contains 20 permitted unmodified PDFs, 29,234,889 bytes and 2,351 parsed PDF pages. The public reference manifest lists 240 paths. The final build manifest records the current distribution file count and bytes. A full public-link check of all 110 unique stable/reading URLs returned 71 HTTP 200, 38 HTTP 403 and one HTTP 429. Access filtering and rate limits remain visible in [the report](../Reference/LINK_CHECK_REPORT.json); no access controls were bypassed.

## Observed Safari checks

The production site was loaded at a nested `/dist/` path to exercise project-style relative URLs. Desktop and a **390×844 CSS pixel** responsive viewport were inspected.

- Home/course/lesson navigation and the dark personal-site style rendered correctly.
- The SG-01 half-step slider showed [2.5,4.5] as a part spanning the old join.
- Correct quiz answers plus practice confirmation marked a lesson complete; progress and a private note survived reload.
- The reference library listed 98 records, and the Knight filter returned 55 associated records with pagination.
- Set inputs reproduced union {1,2,3,4}, intersection {3}, difference {1,2} and the six ordered pairs. A thirteenth token produced a clear limit message.
- The symmetry explorer displayed RF=f90 and FR=f270, then showed commuting products after selecting identity. Its full multiplication table was inspected.
- The mobile menu opened and closed on navigation; lesson text and controls remained within the narrow layout. Keyboard skip navigation preserved the active notebook route and moved focus into the main content.
- The lab completed its 56-transform emergence preset, applied a rule, undid it, then branched with a deletion rule. The production ambiguity preset completed all eight candidates and retained two witnesses, one distinct part and two results; the query-string preset matched the example selector. Counts, history, fractional rule editing and dark drawing previews were inspected. Earlier save/restore checks retained a redo branch.

The download control opened the native Save As dialog; that test download was canceled without writing a file. Native file-picker import completion was not certified in this pass. Interchange parsing, replacement validation, exact replay, storage failure and export content have automated evidence. The [lab report](LAB_VALIDATION.md) details interaction scope.

## Accuracy, performance and limits

All lesson worked examples and 68 answer-key checks were reviewed for internal consistency. [Content review](CONTENT_REVIEW.md) records definitions, source locators, original teaching examples, and the distinction between introductory content and unreviewed research proofs. There was no independent subject-expert review. The Knight bibliography preserves unresolved coverage leads rather than claiming completeness.

Three core benchmarks measured approximately **100–436 ms** on this machine. Search limits and worker execution protect interaction; they do not guarantee constant response time for every input or device. [Performance details](PERFORMANCE.md) include payload sizes and measurement limits.

Safari desktop/responsive observations are not physical iPhone testing or a cross-browser certification. Full assistive-technology testing, exhaustive pointer interactions, Lighthouse/Web Vitals and a hosted Pages smoke test remain unverified. The site provides semantic headings, native controls, focus styles, skip navigation, coordinate-form alternatives and textual activity results; it does not claim a formal accessibility audit.

## Reproduce

```bash
npm run check
npm run build
node tools/check-site.mjs --dist
npm run dev
```

Open `http://127.0.0.1:8765/` or `/dist/`. See [deployment instructions](DEPLOYMENT.md) for the owner's later Pages publication. Notes and workspaces use separate, origin-specific browser storage and portable backups; neither is sent to a server.
