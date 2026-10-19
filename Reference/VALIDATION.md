# Reference collection validation

Checked on **18 October 2026, America/New_York**. Link report timestamps are UTC and therefore show 19 October for this evening session. This report describes the research collection, not a mathematical application release.

| Check | Observed result |
| --- | --- |
| Canonical metadata | 43 source JSON records; stable IDs and required fields validated |
| Topic distribution | Shape grammar 24; sets 5; groups 4; Monster/moonshine 7; bridges 3 |
| Newly saved originals | 15 unmodified PDFs; 23,040,931 bytes total (about 23 MB) |
| Original integrity | All 15 SHA-256 hashes and byte counts match metadata; PDF signatures and parsing checked |
| PDF parsing | All saved originals opened with pypdf; 2,239 PDF pages in total |
| Existing user PDF | Preserved at original path; checksum unchanged; separate record marks it ineligible for proposed public staging |
| Critical Stiny notation | Printed pp. 344 and 347 rendered and visually inspected; non-strict parthood and shared rule transformation confirmed |
| Bibliography evidence | Publisher/author/institutional pages, arXiv version histories and selected Crossref metadata checked; individual scope recorded per source |
| Curriculum mapping | 16 shape grammar, 8 set theory and 10 group theory entries, plus 8 research strands; all mapped source IDs exist |
| HTTP link check | 50 distinct canonical/reading URLs requested: 33 HTTP 200 and 17 HTTP 403; details in `LINK_CHECK_REPORT.json` |
| Rights | Original-file license/front-matter notices inspected; attribution ledger records NC/ND/SA/GFDL conditions and separate cover rights |
| Exclusions | Pre-existing 1980 PDF, MIT lecture slides with explicit third-party exclusions and unlicensed-to-mirror reading copies omitted from public manifest |
| Public candidate list | Explicit `PUBLIC_FILES.txt`, generated from curated text files and registered permitted originals; user review required before staging |
| Local Markdown links | Checked after report creation; local targets exist |
| Git/GitHub boundary | No Git/gh commands, Git internals, repository/account APIs, remote mutations, commits or publication actions performed |
| Public documentation | Reference catalogue, topic notes, rights, research gaps and validation documentation are included; local prompts and assistant instructions are excluded |

The two Open Logic PDFs produce pypdf warnings about repeated internal dictionary keys. They opened and their page counts/text were readable; originals were not repaired or rewritten. These warnings are documented, not treated as corrupt-file failures or silently removed.

## Interpretation and limits

- HTTP 200 does not verify the correctness of a paper or its license. HTTP 403 does not establish a missing citation; many affected publisher pages were accessible through separate web research. Failed direct checks remain failed in the report.
- Bibliography inclusion does not mean every proof, figure, formula or exercise has been checked. Metadata distinguishes full-text, selected-passage, front-matter, contents and bibliography checks.
- Rights inspection includes text-layer notices; it is not an exhaustive image-by-image rights audit. No separately marked excluded content was found in the ten saved OCW manuscripts. The lecture slides did contain explicit exclusions and were kept as a link.
- Exact U₁₂ source locking, full-book page locators, complete course authoring, engine verification, accessibility tests, application builds and live deployment checks remain later work. The reference task does not claim those milestones.
- No repository state was inspected. The file manifest and ignore rule are preparation, not proof that an existing repository has no previously tracked sensitive or restricted files. The guide has the user inspect this before staging.

Reproduce the offline checks from the project root:

```bash
python3 Reference/tools/library.py validate
```

The library’s generated catalogue and proposed public paths can be rebuilt without Git:

```bash
python3 Reference/tools/library.py rebuild
```
