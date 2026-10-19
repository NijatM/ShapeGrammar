# Source metadata conventions

Canonical records live at `<topic>/metadata/<source-id>.json`; each has a matching public note. IDs stay stable when a citation is corrected. A work shared by several subjects has one record with several `tags`, not duplicate PDFs. A substantially different edition can receive a new ID if both editions must be used independently.

- `title`, `authors`, `year`, `edition_version`, `venue`, `pages`, `doi`: bibliographic description. Null year/DOI means not established, not a fabricated default. Preserve differences between preprint, revision, copyright and publication dates.
- `stable_url`: authoritative verification/landing page. `reading_url`: lawful access path, which can have access restrictions. `download_url`: verified direct file URL for a single local original; for bundles use each file’s URL.
- `topic`, `tags`, `relevance`, `prerequisite_level`, `prerequisites`: teaching and search information. Relevance is an editorial recommendation, not a claim that every section has been reviewed.
- `access_date`: user-local calendar date of this research pass, 2026-10-18.
- `license_redistribution`: decision, license, evidence URL and conditions. `link-only` is the conservative default. `licensed-link-only` does not assert a file was downloaded. Only `downloaded-with-conditions` can accompany new files under `originals/`.
- `local_files`: path relative to `Reference/`, bytes, SHA-256, PDF page count, original and resolved download URLs, access date and whether unmodified.
- `existing_local_files`: previously supplied files, separately described; explicitly excluded from the public candidate list when rights are unknown.
- `locators`: printed page, PDF page, section or heading and verification status. A table-of-contents check establishes location, not correctness of all definitions or exercises. Distinguish printed and PDF page numbers.
- `verification`: what was actually inspected and which URLs support it. Do not silently promote `bibliography-only` to full review.

## Adding or updating a source

1. Locate the author, publisher, university or institutional record. Verify the exact work and edition; use current primary documentation when relevant.
2. Search existing IDs/DOIs to prevent duplication. Add one JSON record with the fields above and a short attributed annotation.
3. Inspect rights for the exact file. If unclear, retain citation and reading link. Never substitute “free to read” for permission to redistribute.
4. If redistribution is permitted, download the unmodified original, preserve notices, record URL, byte count, SHA-256, version and rights evidence. Document separately licensed covers or illustrations.
5. Read the passages used by the lesson. Add honest exact locators, then update `coverage.json` and `COVERAGE.md`. Original teaching examples should be marked as such.
6. Run `python3 Reference/tools/library.py validate`, then `rebuild`. Run optional `check-links` and review HTTP failures separately. Rebuild again after adding a report so the manifest includes it.
7. Review the public file manifest and rights ledger before using the user-controlled Git instructions. Do not add personal notes or protected drafts to this public collection.

For a future application, use generated `catalogue.json` as input after validation; do not use prose scraping as a source of truth. Full lesson authoring and source locking remain distinct tasks.
