# Initial browser laboratory verification

Checked on 18 October 2026. The implementation uses local HTML, CSS and JavaScript modules with no installed package dependencies or external asset requests. Start with `npm run dev` and open `http://127.0.0.1:8765/`. Stop the server with Control-C.

Observed checks:

- Local HTTP entry point returned 200.
- JavaScript syntax check passed; all 13 existing engine tests passed.
- Safari loaded the laboratory and completed the emergence example’s 56-transform domain: 20 witnesses, five distinct parts and 10 distinct results.
- Applying the selected rule changed step 0 / 0 with one maximal line to step 1 / 1 with two maximal lines.
- Undo restored step 0 / 1 with one maximal line and enabled redo.
- Desktop layout was inspected in Safari; the drawing and rule previews rendered.

The interface also implements line drawing, exact coordinate entry, rule editing, domain settings, manual alignment, fit view, cancellation, witness selection and JSON download. These additional paths have not all received browser interaction checks in this pass. Mobile layouts, comprehensive keyboard/screen-reader use, other browsers and a browser-console audit remain unverified. Core search cancellation, ambiguity, finite limits, arithmetic and history have separate [engine test evidence](ENGINE_VALIDATION.md).

Browser search explicitly limits work to 50,000 candidates and 2,000 retained witnesses, with incomplete-result messages when either cap or cancellation interrupts enumeration. These limits are narrower than the core defaults. Geometry is retained outside the view; Fit view includes the selected result. Search-domain changes begin a new derivation from the current shape. Rule application clears old search results so they cannot be applied to a changed host.

## Save/restore update — 19 October 2026

Explicit local save/restore and workspace import/export are implemented. The complete test suite now passes **18 tests**: the original 13 engine checks and five workspace checks covering exact round trips, selected orientation preservation, undo/redo branches, legacy files, tampered replay, malformed/future formats, input budgets and storage failures.

Safari verification: saved a test workspace with a redo branch, started a new empty drawing, then restored one maximal line at step 0 / 1 with redo enabled. The browser displayed successful save and restore messages. The file-picker import path and persistence across a browser restart have not received manual browser checks; decoding/replay and storage boundaries have unit-test evidence.

The version-1 `ShapeGrammar.lab` envelope includes the core derivation and selected rule. Older `ShapeGrammar.derivation` files remain accepted; when an old file has no rule history, the current editor rule is retained and the interface says so. Import budgets are 1 MiB, 200 steps, 256 segments per shape, 128 characters per rational coordinate and 32 scales. These are browser interchange limits, separate from the core's larger history limit. Live work exceeding these limits stays open but cannot be saved/exported through this bounded format until reduced. Very large or closely spaced coordinates can exceed display precision even though engine arithmetic remains exact; grid rendering uses a bounded loop.

One saved copy is stored under `ShapeGrammar.lab.v1` in localStorage for the current origin. Nothing is automatically restored or overwritten on startup. Explicit Save replaces the previous saved copy; editing or loading an example does not. Use the same host/port to access the same local copy, and download a file for portability. Applied rules/domain are retained; unsubmitted editor changes, matches and viewport are not saved. Unavailable browser storage produces a visible error, and download remains an alternative.

Nothing has been published or deployed, and no Git operations were performed.
