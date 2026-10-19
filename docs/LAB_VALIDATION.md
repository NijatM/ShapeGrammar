# Browser laboratory verification

Updated 19 October 2026. The production application uses local HTML, CSS and JavaScript modules, with an optional Google Fonts stylesheet and no installed package dependencies. [Release validation](RELEASE_VALIDATION.md) covers the complete learning site.

## Observed Safari interactions

- The emergence preset completed all 56 declared transformations and reported 20 witnesses, five distinct parts and 10 distinct results.
- Applying its selected rule advanced step 0/0 with one maximal line to step 1/1 with two maximal lines.
- Undo restored step 0/1 and enabled redo. Editing B to `[]`, searching and applying deletion produced a new step 1/1 and removed the old redo future.
- The deletion rule reported 20 witnesses, five distinct parts and five distinct results in that preset.
- The history list displayed the initial shape and exact selected orientation, scale and translation.
- The rule draft form accepted `1/2` coordinates, displayed an exact vertical right-side segment and activated it through Use this rule.
- The shared dark layout, grid and rule previews were visually inspected on desktop. The laboratory's stacked layout and native controls were inspected at 390×844 CSS pixels through Safari Responsive Design Mode.
- Earlier local save/restore testing saved a workspace with a redo branch, started a new drawing, and restored one maximal line at step 0/1 with redo enabled.

Pointer drawing, manual alignment, pan/zoom and Fit view are implemented. They have code/model checks and inspected controls, but not every pointer sequence and coordinate extreme has been manually exercised. The native file-picker import path and persistence across a full browser restart are not claimed as manual evidence. Exact interchange, replay, input budgets, cancellation and storage-failure behavior have automated tests.

## Search behavior

Search uses a module worker where supported. The UI explicitly caps work at 50,000 candidates, 2,000 retained witnesses and eight seconds. Cancellation terminates the worker and discards intermediate witnesses. If worker setup fails, a yielding asynchronous fallback uses the same core. Every protective limit yields incomplete results, never a false exhaustion claim. Time is checked between candidates; it is not a hard real-time guarantee for one unusually expensive operation.

The visible canvas does not determine the domain. Changing the domain starts a new derivation from the current shape. Rule application clears stale matches. Rule draft changes require activation before searching or checking manual alignment, so the visible draft cannot silently be searched as the previous rule. Query-string presets also select the corresponding example control.

## Workspace format and privacy

Version-1 `ShapeGrammar.lab` includes the core derivation and selected rule. Older `ShapeGrammar.derivation` files remain accepted; when an old file has no rule history, the current editor rule is retained and the interface explains this.

Browser limits are 1 MiB per file, 200 steps, 256 segments per shape, 128 characters per rational coordinate and 32 scales. A replacement is parsed, bounded and replayed before the current workspace changes. Exact geometry remains independent of display rounding; very large or closely spaced coordinates may exceed screen precision. Grid rendering uses bounded loops.

One saved workspace is stored under `ShapeGrammar.lab.v1` on the current origin. Nothing is automatically restored on startup. Explicit Save replaces that copy; editing and examples do not. Download backups for portability. Applied rules/domain, steps and undo cursor are retained; unsubmitted rule drafts, match lists and viewport are not. Failed storage produces a visible error and leaves download available.

The interface matches the personal HTMAA website's dark palette, IBM Plex Mono stack, 300px sidebar and compact typography. The original website was read without modification. No Git operations or publication were performed.
