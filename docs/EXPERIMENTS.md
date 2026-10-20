# Source-linked experiments

Implemented locally on 19 October 2026. The site now has **14 interactive experiments**, connected to **23 source guides** through specific reviewed passages. Eight experiments concern shape grammar, three concern sets/functions/relations, and three concern square symmetries.

These are original small examples for understanding an idea. They do not reproduce entire publications, historical architectural case studies, controlled experiments or the full expressive power of the cited formalisms. Incomplete scholarly readings remain a separate research task.

## How to find them

Choose **Experiments** in the sidebar or the home-page action. On a connected source page, **Try linked experiments** moves to its experiment cards. Opening a card retains a link back to that reading. Every experiment also includes the related source guides, passage locators and original URLs.

Each page offers a question, two concrete things to try, native controls or toggle buttons, immediate diagrams and textual observations, a reset control, an explanation of what to notice, and an explicit scope. Diagram meaning is also conveyed by text, labels and patterns; it does not depend on color or animation. Controls remain in place when results update. Experiment choices are temporary and start fresh on reopening; existing private notes and saved laboratory workspaces are separate.

## Models and accuracy boundaries

| Experiment | Core observation | Deliberate boundary |
| --- | --- | --- |
| [A part can cross an old join](../index.html#/experiment/parts-across-strokes) | Exact interval coverage spans a former stroke boundary, while a real gap changes matching | Two input strokes, a length-two query and half-unit positions |
| [Add, erase, keep the overlap](../index.html#/experiment/shape-arithmetic) | Difference can split a line; a crossing point contributes no one-dimensional intersection | Unlabelled line elements; no independent point-shape component |
| [One rule, one transformation](../index.html#/experiment/shared-transformation) | Both rule sides use the same orientation, scale and shift | D₄ orientations, three scales, bounded half-unit shifts; failed matching has no result |
| [Same part, different consequences](../index.html#/experiment/witnesses-and-results) | Two transformations can give one part and two results; identities make the results coincide | Exactly eight orientations, scale 1 and shift (0,0) |
| [Look again without moving a line](../index.html#/experiment/seeing-with-identities) | Three part selections preserve identical geometry under A → A | Supplied readings are not all parts; highlighting is not a psychological measurement |
| [Same square, different possibilities](../index.html#/experiment/growing-with-rules) | Changing choices in a grammar differs from changing its available rules | Marked-square selection, planar line arithmetic and an eight-step cap |
| [Thickness has rules too](../index.html#/experiment/weights-on-overlap) | Maximum/minimum/clipped subtraction determine overlap weights | Positive integer weights on collinear intervals; no physical blending |
| [Who wins in the overlap?](../index.html#/experiment/qualities-on-overlap) | Ranking changes the overlap’s quality while geometry stays fixed | A two-field priority toy, not Knight’s complete color-grammar algebra |
| [Build sets and compare them](../index.html#/experiment/finite-set-operations) | Elements, ordered pairs and subsets are different kinds of result objects | Four available element tokens; P(∅) = {∅} is explicit |
| [Choose what counts as the same](../index.html#/experiment/equivalence-classes) | Same remainder defines disjoint classes covering the selected universe | Integers 0–5, modulus 2–4; no quotient-group multiplication is constructed |
| [One arrow from every input](../index.html#/experiment/functions-and-bijections) | Collisions and unused outputs distinguish bijections | Self-maps of a three-element set; injectivity and surjectivity coincide only in this finite equal-size setting |
| [Try the other order](../index.html#/experiment/composition-order) | Corner numbers reveal AB ≠ BA even when square outlines coincide | Rigid D₄ motions; AB applies B first; turns are counterclockwise |
| [What moves, what stays fixed?](../index.html#/experiment/orbits-and-stabilizers) | Distinct point images and fixing operations satisfy 8 = orbit × stabilizer | The planar D₄ action; not a simulation of an advanced sporadic group |
| [Can your selection be a group?](../index.html#/experiment/subgroup-builder) | Missing products and inverses explain why a selection fails | Subsets of known D₄; associativity is inherited, not independently inferred for a new operation |

Exact line operations and rule applications use the existing rational geometry engine. Only conversion for diagram projection and label placement uses floating-point screen coordinates. Numerical weights and priority fields are separate bounded models; the general line laboratory remains an unlabelled straight-line interpreter.

## Source connections

The curated connections are in [data/experiments.json](../data/experiments.json). Each identifies the canonical source ID, an evidence index, the exact locator/URL from its reading guide, and an explanation of the relationship. Validation rejects missing records, mismatched passages and detailed concept claims attached to unread publication records.

Stiny’s identity-rule note and Knight’s emergence article are connected as **reading prompts**, based on their reviewed abstracts. Their full formalisms or diagrams are not claimed to have been reconstructed. Other connections use reviewed full texts or selected passages. A source can support more than one experiment; no generic experiment has been attached indiscriminately to all 98 records.

## Verification performed

- **56 application tests pass**, including 21 new experiment model/view/control tests.
- Interval coverage was checked at every supplied query position, with and without the gap. Rule tests distinguish reflected replacements, failed matches, witness/part/result counts and unchanged identity results.
- Growth tests verify actual rule application, changed menus, different traces and the step limit. Weight tests verify equal-weight fusion, clipped subtraction and removal of zero-weight overlap.
- Set tests cover all 256 A/B selections in the four-element universe. Relation tests check all three equivalence laws in the finite examples. All 27 three-element functions yield exactly six bijections.
- All 256 square-symmetry selections yield exactly the ten D₄ subgroups. Four point choices have the expected orbit/stabilizer counts.
- Generated controls and observations were checked for every model. An additional diagnostic checked **48 default/preset states**, **77 well-formed accessible SVG diagrams**, labelled fields and non-submitting buttons. This caught and corrected a display-coordinate conversion error in the numbered-square diagrams.
- Three bounded DOM-adapter tests execute the actual event handlers for all supplied presets, reset, range/checkbox/select changes, set/group toggles and disabled growth controls. They verify observations update while the control objects remain in place. The adapter is not a browser emulator and does not establish native event delivery, focus or layout.
- The catalogue/source validator checks all 14 model IDs and their 23 source connections in both source and production folders. Route/private-file and original-PDF integrity checks remain part of the release validation.

**Browser verification limit:** the in-app browser was unavailable. Safari could be observed, but attempts to open a separate preview window/tab timed out in the computer-use tool. A new desktop/mobile interaction pass was therefore not completed. Model, generated-view, SVG and HTTP checks do not certify browser layout, keyboard event delivery or touch behavior. Earlier Safari observations in the release report concern the prior source-reading/laboratory version.

## Performance and reproduction

The experiment catalogue loads on demand, and the interactive view/model modules load when an individual experiment opens. The models have fixed finite bounds; there is no unbounded search in these controls and no new package dependency.

A local Node.js diagnostic ran 1,440 model-plus-markup generations across the 48 states: median **0.025 ms**, 95th percentile **0.40 ms**, maximum **46.91 ms**. These numbers exclude DOM insertion, browser layout, painting, network time and physical-device effects. They do not establish Web Vitals or an input-latency guarantee. See [performance measurements](PERFORMANCE.md) for payload sizes and the existing laboratory benchmarks.

```bash
npm run check
npm run build
node tools/check-site.mjs --dist
npm run dev
```

Open `http://127.0.0.1:8765/#/experiments`. For a project-style path check, open `/dist/#/experiments`. Start with Arithmetic of Shapes → Try linked experiments → Add, erase, keep the overlap; compare the three operations and the crossing preset. Then compare the identity-rule result counts, priority fields, empty-set power set and square-composition order.

Publication remains owner-controlled. This work did not commit, push or deploy the project.
