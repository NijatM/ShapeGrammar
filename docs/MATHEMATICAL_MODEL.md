# Mathematical model — engine 0.1.0

This contract describes [the implemented core](../src/engine/core.mjs). Mathematical source conventions and engineering restrictions are stated separately below.

## Sources and dimensional convention

Stiny’s 1980 introduction, printed pp. 343–344, supplies maximal line segments, shape parthood and shape arithmetic; p. 347 supplies rule application with one transformation on both rule sides. Printed pp. 344 and 347 were rendered and visually checked. [Publication record](https://journals.sagepub.com/doi/10.1068/b070343), [local source annotation](../Reference/shape-grammar/notes/stiny-1980-introduction.md).

Stouffs 2016, printed p. 331, defines the indices of Uᵢⱼ by the dimensions of the elements and containing space. Thus U₁₂ concerns line elements in two-dimensional space. That page was rendered and visually checked; pp. 332–334 were read for the algebra interface. [Institutional original](https://pure.tudelft.nl/ws/portalfiles/portal/12909097/Stouffs_eCAADe2016_volume2.pdf), [annotation](../Reference/shape-grammar/notes/stouffs-2016-interpreter.md).

The implementation uses **finite unlabelled straight-line shapes with rational endpoints**. This is a restricted implementation of the planar line-shape setting; it does not represent every real-coordinate element of U₁₂. The original 1991 algebra paper remains a further reading task.

## Representation and operations

- Coordinates are reduced fractions backed by `BigInt`; denominators are positive. Accept safe integer numbers, big integers, integer strings or fraction strings such as `"1/3"`. Decimal strings and floating-point fractions are rejected. Conversion to a JavaScript number is reserved for future display.
- A shape is an array of segments `[[x0,y0],[x1,y1]]`. Zero-length segments are invalid. The empty shape is `[]`, denoted `0_shape` in project prose.
- Normalization groups segments by exact carrier line and merges overlapping or touching intervals into maximal segments. Direction, duplication, original stroke order and collinear subdivision do not change shape equality.
- `isPart(A,S)` means every line interval of A is covered by S. It is non-strict parthood, written A ≤ S. It is different from membership and from comparing arrays of original strokes.
- `sum` combines line content and normalizes; `common` keeps positive-length common intervals. A transverse crossing or endpoint contact alone contributes no one-dimensional common shape.
- `difference` removes shared line intervals and keeps closed residual segments. For example, removing [2,4] from [0,6] yields [0,2] and [4,6]. Isolated residual points are absent. This shape operation is not literal point-set subtraction with open endpoints.

All operations use exact rational comparisons. Arbitrary rational slopes are permitted; only the orientation menu below is discrete. Geometry is independent of any future viewport.

## Transformations and rule application

Project coordinates have x to the right and y upwards. For column vector p,

`t(p) = s M p + v`.

Here s is a positive rational scale, M is one of eight D₄ matrices and v is a rational translation. D₄ denotes the order-eight symmetry group of a square. `r90` is a counterclockwise quarter turn; `f0` reflects across the x axis; `f90`, `f180` and `f270` mean RᵏF, with the reflection applied first. See [Judson’s source record](../Reference/group-theory/notes/judson-abstract-algebra.md) for the dihedral convention.

A rule A → B applies when `t(A) ≤ S`, and its result is

`S′ = (S − t(A)) + t(B)`.

The **same t** acts on A and B. These unlabelled letters translate the labelled presentation in Stiny 1980; labels are not implemented. The engine rejects an empty A as an explicit implementation restriction. An empty B is allowed. Rules apply sequentially, one witness at a time.

## Finite matching domain

The declared domain is the Cartesian product of selected scales, selected orientations and an exact translation grid. For x, grid values are `xMin + k·step ≤ xMax` for integers k ≥ 0; y is analogous. Both bounds are inclusive when the bound is on the grid. The step is positive. Duplicate scale/orientation parameters are removed.

Defaults are x,y from −10 to 10 with step 1, scales {1/2,1,2} and all eight orientations: **10,584 transformations**. This finite set is a search menu; it is generally not a group and is not the set of all similarities. A viewport must not redefine or clip it.

`findMatches` enumerates every declared transformation unless cancelled or limited. It returns all retained witnesses with their matched regions and resulting shapes, plus separate counts for witnesses, distinct regions and distinct results. Coincident regions do not justify deleting witnesses: a symmetric A can match in two ways while the asymmetric B produces different outcomes.

The result includes `checked`, a decimal-string `total`, `complete` and a `reason`. `complete` is true only after exhausting the domain. Defaults cap checked candidates at 250,000 and retained matches at 20,000. Cancellation and either cap return explicitly incomplete results. The loop yields every 128 candidates by default; there is no elapsed-time cap and one expensive candidate can still delay yielding. This is exhaustive finite enumeration, not an optimized continuous matcher.

`validateAlignment` and automatic matching use the same admissibility and geometric coverage predicates. A finite menu restriction is reported separately from failed geometric embedding.

## History and serialization

`Derivation` stores immutable geometric snapshots and supports undo, redo and branching after undo. Export format `ShapeGrammar.derivation`, version 1, engine version 0.1.0, stores exact rational strings, the initial shape, domain, cursor and every rule/transformation/result. Import constructs a new history, replays every step and rejects a mismatched expected result or unsupported version. It limits history length to 10,000 steps. This is a core interchange format, not a completed browser import or persistence interface; byte-size and resource limits for untrusted browser uploads remain to be designed.

Color/weight algebras, labels, curved or higher-dimensional elements, free-angle rotations, parametric rule solving and simultaneous applications are outside this engine version. Knight’s broader work remains a research and teaching foundation, not a claim that these features have been implemented.
