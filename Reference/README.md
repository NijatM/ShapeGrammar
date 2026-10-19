# ShapeGrammar reference library

Curated on **18 October 2026** for Nijat Mahamaliyev. This collection provides research references and study notes. It does not implement the application or certify release readiness.

Start with [the catalogue](CATALOGUE.md), then [lesson coverage](COVERAGE.md). The library contains **98 canonical sources** and **20 downloaded, unmodified PDFs**. Browse the parallel [George Stiny](authors/george-stiny/README.md) and [Terry Knight](authors/terry-knight/README.md) indexes. Knight has 55 associated records across research, editorial roles and teaching; the [coverage audit](authors/terry-knight/COVERAGE_AUDIT.md) records unresolved versions and limits to completeness. Bibliographic verification, reading a selected passage, and reviewing a complete mathematical argument are different activities; each record states which occurred.

| Topic folder | Canonical sources | New original PDFs | Main use |
| --- | ---: | ---: | --- |
| [shape-grammar](shape-grammar/README.md) | 79 | 15 | Stiny and Knight; emergence, rules, arithmetic, design languages, color, symmetry, making and implementation |
| [set-theory](set-theory/README.md) | 5 | 4 | Sets, functions, relations, proofs and infinity |
| [group-theory](group-theory/README.md) | 4 | 1 | Groups, symmetries, homomorphisms, quotients and actions |
| [monster-moonshine](monster-moonshine/README.md) | 7 | 0 | Expert introductions, primary papers and research history |
| [bridges](bridges/README.md) | 3 | 0 | Linear algebra, representation theory and crystallographic symmetry |

Each folder has `metadata/` for canonical source records, `notes/` for public editorial annotations, and `originals/` for permitted copies. Cross-topic tags avoid duplicating books. The Monster and bridges originals folders contain a README explaining why reading links are used.

`catalogue.json`, `catalogue.csv`, `CATALOGUE.md` and `references.bib` are generated views. Edit the individual metadata records, then rebuild. `PUBLIC_FILES.txt` is the explicit proposed public reference file list, relative to the project root. It is also suitable for user-controlled Git staging after review.

The pre-existing `1980-Stiny_Introduction to shape and shape grammars.pdf` remains at its original path. Its checksum is recorded, but its redistribution rights and exact download provenance are unknown. It is excluded from `PUBLIC_FILES.txt` and ignored by the supplied `.gitignore`. Ignoring a file does not remove an already tracked or previously published copy: the user must inspect repository state before staging.

## Reading route

1. Read Stiny’s OCW Q1 in `shape-grammar/originals/stiny-ocw-qa1.pdf`, then inspect the original teaching example in the shape grammar topic guide.
2. Use Hammack Chapters 1, 11 and 12 for the notation needed along the way.
3. Read Judson §§3.1–3.3 and §5.2 for symmetry and groups. Locally use **D₄ for the order-eight symmetry group of a square**; compare each source’s notation.
4. Read Borcherds’s *What Is the Monster?* through the catalogue, then *What Is Moonshine?* when linear algebra and group actions are comfortable.

## Verification and maintenance

From `/Users/nijat/Desktop/MIT/ShapeGrammar`:

```bash
python3 Reference/tools/library.py validate
```

```bash
python3 Reference/tools/library.py rebuild
```

The offline tool needs Python 3.9 or later and uses the standard library. It validates required fields, stable IDs, duplicate DOIs, file boundaries, declared redistribution status, PDF signatures, sizes, SHA-256 checksums, coverage IDs and the preserved user-file checksum. Rebuild writes only generated library indexes and the public manifest. It performs no Git/GitHub operations.

Optional network check, which updates `LINK_CHECK_REPORT.json`:

```bash
python3 Reference/tools/library.py check-links
```

HTTP success indicates reachability, not mathematical accuracy or permission to redistribute. See [validation](VALIDATION.md), [rights](RIGHTS_AND_ATTRIBUTION.md), [research gaps](RESEARCH_LOG_AND_GAPS.md), and [record conventions](METADATA_GUIDE.md).
