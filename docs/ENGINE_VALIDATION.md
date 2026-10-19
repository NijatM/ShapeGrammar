# Engine verification

Updated locally on 19 October 2026 with Node.js v26.11.1. The supported runtime declaration is Node.js ≥20; other runtime versions have not been tested in this pass.

Command: `npm test` (equivalently `node --test test/*.test.mjs`). The core contributes **13 tests** to the complete **32 passing tests**. The remaining tests cover curriculum/explorers, study state, worker transport and workspace interchange.

| Area | Evidence |
| --- | --- |
| Exact arithmetic | Reduced signs/fractions, division, integers above 2¹⁰⁰; rejection of unsafe or inexact inputs |
| Shape representation | Reversal, duplication, overlap, touching collinear pieces, stroke reordering and subdivision yield equal canonical shapes |
| Geometry | Proper subsegments, spanning multiple strokes, gaps, horizontal/vertical/diagonal carriers, empty shapes and point-only crossings |
| Shape arithmetic | Intersection, splitting deletion, full deletion, unaffected transverse crossings and fusion on addition |
| Rule application | Shared transformation, rational results preserved, geometry beyond any prospective visible canvas retained |
| Domain | Exact finite counts, duplicate removal, off-grid rejection and malformed-domain rejection |
| Ambiguity | Two witnesses, one highlighted region and two different results in the symmetric-left/asymmetric-right fixture |
| Matching consistency | Manual validation agrees with automatic membership for each transformation in a small domain |
| Emergence | Complete witness sets agree for several stroke representations of the same maximal line |
| Search controls | Cancellation before and during search; candidate and match limits explicitly mark results incomplete |
| History | Undo/redo, branching, exact JSON round trip, replay mismatch and unsupported/malformed import rejection |
| Independent oracle | 192 host/query pairs, 144 transformations each: 27,648 candidates; every complete witness set agrees |

The independent oracle uses doubled integer coordinates for half-grid fixtures, cross products for collinearity, dot-product interval projection and a separately implemented reflection/rotation procedure. It does not call production transformations or geometric predicates. The fixture family exhausts all 64 subsets of six horizontal, vertical and diagonal segments and three query shapes.

This evidence concerns the tested finite domains and fixtures. It is not a proof of correctness on every rational input or a performance guarantee. This report covers the engine milestone. Initial browser checks are now recorded separately in [laboratory validation](LAB_VALIDATION.md). Bounded import, persistence, lessons and worker tests now have separate evidence in the [release report](RELEASE_VALIDATION.md). Comprehensive assistive-technology review and deployed behavior remain outside the local evidence. The source convention and engineering restrictions are documented in the [mathematical model](MATHEMATICAL_MODEL.md).
