# Reference collection validation

Collection checks updated **19 October 2026, America/New_York**. Link report timestamps are UTC. Application evidence is recorded separately in the [release report](../docs/RELEASE_VALIDATION.md).

| Check | Observed result |
| --- | --- |
| Canonical metadata | 98 source JSON records; stable IDs and required fields validated |
| Topic distribution | Shape grammar 79; sets 5; groups 4; Monster/moonshine 7; bridges 3 |
| Saved originals | 20 unmodified PDFs; 29,234,889 bytes total (about 29 MB) |
| Original integrity | All 20 SHA-256 hashes and byte counts match metadata; PDF signatures and parsing checked |
| PDF parsing | All saved originals opened with pypdf; 2,351 PDF pages in total |
| Knight author coverage | 55 associated canonical records; five open-license originals; edited containers and named contributions distinguished from byline authorship; unresolved leads in author coverage audit |
| Existing user PDF | Preserved at original path; checksum unchanged; separate record marks it ineligible for proposed public staging |
| Critical Stiny notation | Printed pp. 344 and 347 rendered and visually inspected; non-strict parthood and shared rule transformation confirmed |
| Bibliography evidence | Publisher/author/institutional pages, arXiv version histories and selected Crossref metadata checked; individual scope recorded per source |
| Dimensional convention | Stouffs 2016 printed p. 331 rendered/visually checked for Uᵢⱼ and U₁₂; implementation restrictions documented separately |
| Curriculum mapping | 16 shape grammar, 8 set theory and 10 group theory entries, plus 10 research strands; all mapped source IDs exist |
| HTTP link check | All 110 unique stable/reading URLs across 98 records checked: 71 HTTP 200, 38 HTTP 403, 1 HTTP 429; see `LINK_CHECK_REPORT.json` |
| Rights | Original-file license/front-matter notices inspected; attribution ledger records NC/ND/SA/GFDL conditions and separate cover rights |
| Exclusions | Pre-existing 1980 PDF, MIT lecture slides with explicit third-party exclusions and unlicensed-to-mirror reading copies omitted from public manifest |
| Public candidate list | 240 explicit reference paths in `PUBLIC_FILES.txt`; local-only/configuration exclusions and unknown-rights user PDF exclusion checked |
| Local Markdown links | Local link checker covers public reference and project documentation; see the release report for the current count |
| Git/GitHub boundary | No Git/gh commands, Git internals, repository/account APIs, remote mutations, commits or publication actions performed |
| Public documentation | Reference catalogue, topic notes, rights, research gaps and validation documentation are included; local prompts and assistant instructions are excluded |

The two Open Logic PDFs produce pypdf warnings about repeated internal dictionary keys. Joelho’s supplied PDF produces wrong-pointing-object warnings in pypdf and font-weight warnings when rendered with Poppler. These files opened and their page counts/text were readable; originals were not repaired or rewritten. Joelho’s first spread was visually checked after rendering. These warnings are documented, not treated as corrupt-file failures or silently removed.

## Interpretation and limits

- HTTP 200 does not verify the correctness of a paper or its license. HTTP 403 does not establish a missing citation; many affected publisher pages were accessible through separate web research. Failed direct checks remain failed in the report.
- Bibliography inclusion does not mean every proof, figure, formula or exercise has been checked. Metadata distinguishes full-text, selected-passage, front-matter, contents and bibliography checks.
- Rights inspection includes text-layer notices; it is not an exhaustive image-by-image rights audit. No separately marked excluded content was found in the ten saved OCW manuscripts. The lecture slides did contain explicit exclusions and were kept as a link.
- The U₁₂ dimensional convention is verified through Stouffs 2016. Full-book locators and the original Stiny 1991 passage still require review. The authored introductory lessons use reviewed definitions and original examples. [Content review](../docs/CONTENT_REVIEW.md) and [release validation](../docs/RELEASE_VALIDATION.md) state the application evidence; full original-paper proof review and live deployment remain outside these checks.
- No repository state was inspected. The file manifest and ignore rule are preparation, not proof that an existing repository has no previously tracked sensitive or restricted files. The deployment guide asks the owner to inspect the staged file list.

Reproduce the offline checks from the project root:

```bash
python3 Reference/tools/library.py validate
```

The library’s generated catalogue and proposed public paths can be rebuilt without Git:

```bash
python3 Reference/tools/library.py rebuild
```
