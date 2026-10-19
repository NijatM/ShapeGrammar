# Research log, exclusions and remaining work

Initial research date: 18 October 2026; source-reading update: 19 October 2026. Scope: research references and evidence supporting the mathematical model. A separate local engine milestone is documented in [the project verification report](../docs/ENGINE_VALIDATION.md). The subsequent [source review report](../docs/SOURCE_REVIEW.md) records the new reading guides and their exact review boundaries.

## Strategy and checks actually performed

Started with MIT OCW 4.540 primary texts, supplemental bibliography and source links. Followed Stiny’s foundations, shape algebras, weights, rules, emergence, architectural examples and computational recognition literature. Used publisher pages and selected Crossref records to check titles, authors, years, DOI and page ranges. Crossref returned HTTP 429 for some requests; those were not called successful checks. No unbounded or automated recurring literature searches were created.

For sets and groups, prioritized author-maintained open textbooks, archived builds and MIT course materials. For Monster/moonshine, used Borcherds’s author-hosted papers, the Conway–Norton publisher record, Gannon’s arXiv revision and ATLAS. For later connections, used representation theory, linear algebra and IUCr symmetry materials. Search-engine snippets were discovery aids; technical claims were tied to primary or institutional pages.

Downloaded five textbooks and ten Stiny OCW manuscripts into the requested topic folders. Kept downloaded bytes unmodified and recorded SHA-256 hashes. Read front matter and license notices, selected tables of contents and relevant passages. Inspected the pre-existing Stiny 1980 PDF; rendered printed pp. 344 and 347 and visually confirmed parthood and rule-application notation. Other PDF figures and proofs have not all been visually or mathematically reviewed.

Expanded Terry Knight’s bibliography using the author-hosted historical list, MIT Computational Making, publisher/DOI records, public ORCID and targeted title searches. Added 54 associated records beyond the existing Six Types entry and five openly licensed originals. The index includes authored work, editorial roles, a named contribution and teaching resources; it does not turn every associated item into a research paper. See the [author audit](authors/terry-knight/COVERAGE_AUDIT.md) for unresolved reports, versions and excluded same-name authors. Full texts without verified redistribution permission remain linked. No private course pages were accessed.

Stouffs 2016, printed p. 331, was rendered and visually checked to verify the Uᵢⱼ dimension convention. Its institutional redistribution restriction was respected: the reading/rendering copy stayed outside the public collection. This resolves the selected implementation’s dimensional convention, while leaving the original Stiny 1991 passage as further research.

The separate link report records actual HTTP results. A 403 or 406 can reflect filtering; it is not evidence that a paper does not exist. No login, subscription bypass or alternative account access was used. Git and GitHub operations were not performed, including read-only inspection.

## Corrections and version distinctions

- *Shape*: hardcover first published 2006, linked paperback 2008; they are not separate works padded into the catalogue.
- The foundational Stiny–Gips paper is cited as 1972 proceedings of IFIP Congress 71. Conference year and publication year differ.
- Krishnamurti’s *The Arithmetic of Shapes* begins at p. 463, as confirmed by Crossref, despite a secondary citation beginning at 464.
- Haridis–Stiny: first arXiv submission 2020; selected version v3 is March 2022. Journal DOI is separately identified, without invented final issue pagination.
- Open Logic Set Theory says Fall 2021 but the file contains July 2026 build identifiers. Both are recorded. Sets, Logic, Computation uses an archived Fall 2025 build.
- Judson’s author page lists a newer 2026 file with an inconsistent “2025 edition” link label. The unambiguous 1 August 2025 PDF is deliberately pinned here.
- Milne’s PDF title date and internal revision-history date differ by one day; preserve both rather than invent precision.
- Open Logic text is CC BY, but the complete PDFs have separately credited CC BY-NC cover illustrations. The collection’s rights ledger records both.

## Gaps and next research tasks

1. **Algebra and implementation scope:** selected primary passages of Stiny 1991 and Krishnamurti–Stouffs 1997 have now been reviewed alongside Stouffs 2016. The rational-coordinate and finite-menu restrictions in the implemented engine remain project choices, not claims of unrestricted shape-grammar support or independent proof verification.
2. **Full-book locators remain pending** for *Shape* and *Shapes of Imagination*. Their bibliographic/edition and access records are verified, not every interior claim. The MIT OA link for the latter did not yield a full download in this pass.
3. **Foundational and computational reading:** new guides identify reviewed portions of the 1972 author-uploaded reprint, weights, construction, rule schemas, six types and tractability. The 1975 book remains limited to available publisher material. Detailed algorithm adoption still requires checking all relevant assumptions and proofs. The 1978 institutional handle remains an access gap, described through a clearly labelled later-author citation rather than an invented book summary.
4. **IUCr pamphlet year** remains unverified. Author L. S. Dent Glasser and the introductory teaching aims were verified on the official page; the publication year is not guessed.
5. **Current Monster research:** ATLAS contains old resource and maximal-subgroup status statements; do not treat them as current. Gannon’s survey and Borcherds’s problem list are historical. Verify modern problem status before proposing research. Vertex operator algebras, complex analysis, modular forms and finite simple groups need additional module-specific primary sources later.
6. **No established Stiny–Monster derivation** is claimed. Shape grammar → sets → groups → Monster is a learning path. Any proposed structural bridge needs its own explicit construction and evidence.
7. **Future modules:** frieze/wallpaper groups, reflection groups, representation theory, group extensions and finite simple groups need additional focused curation. The bridge folder is a prerequisite route, not a finished course in each topic.
8. **Permissions:** exact provenance and redistribution rights of the existing 1980 PDF are unresolved. Preserve it, but exclude it from public staging. Lecturer slides with explicit third-party exclusions and papers without verified mirroring permission remain links.

The application now has separate [release validation](../docs/RELEASE_VALIDATION.md), including lesson, build and browser checks. This reference library still does not claim exhaustive coverage or expert certification. Knight’s lifetime bibliography is a continuing reconciliation task; identified uncertainties are recorded rather than represented as verified publications.

## Future literature updates

Check the existing canonical IDs before adding sources. Investigate a specific question using primary works, pin versions, record rights and exact locators, then update coverage and validation. Preserve originals and keep private notes outside the public collection. Review proposed changes before publication.
