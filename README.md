# ShapeGrammar

A reference library and an exact geometric core for studying shape grammars, set theory and symmetry. George Stiny’s foundations and Terry Knight’s work on design languages, emergence, color grammars and computational making provide complementary reading paths.

Start with the [reference catalogue](Reference/CATALOGUE.md), [Terry Knight index](Reference/authors/terry-knight/README.md), or [mathematical model](docs/MATHEMATICAL_MODEL.md).

## Current implementation

The dependency-free JavaScript module in [src/engine/core.mjs](src/engine/core.mjs) supports rational planar line shapes, maximal-line normalization, geometric parthood, shape arithmetic, finite-domain matching, rule application and replayable derivation history. It can recognize a subsegment spanning several original strokes. Search reports whether it completed the declared domain and retains distinct transformation witnesses even when their matched regions coincide.

Run the engine checks with Node.js 20 or newer:

```bash
npm test
```

No package installation is needed. The [verification report](docs/ENGINE_VALIDATION.md) describes the independent exhaustive oracle and the limits of the tests.

Validate the research records and original-file checksums with Python 3.9 or newer:

```bash
python3 Reference/tools/library.py validate
```

## Development status

This is a research and engine milestone. The learning website, interactive drawing interface, authored lessons, browser storage and deployment are still to be built. See the [milestones](docs/MILESTONES.md).

Third-party publications retain their own rights. The [attribution ledger](Reference/RIGHTS_AND_ATTRIBUTION.md) identifies permitted originals and their conditions; a reading link alone does not grant permission to republish a work.
