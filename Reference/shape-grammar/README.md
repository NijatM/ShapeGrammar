# Shape grammar: reading and mathematical notes

Begin with the [catalogue](../CATALOGUE.md#shape-grammar), Stiny’s OCW Q1 and Q4, then the 1980 introduction. Later read *Shape*, *Shapes of Imagination*, the algebras and weights papers, and the computational references. The ten local course manuscripts are one versioned source bundle, not ten separate publications.

## Verified starting definitions

The 1980 introduction represents straight-line shapes by maximal nonzero line segments. Touching or overlapping collinear pieces can fuse; the original pen strokes do not fix all possible parts. Shape parthood is non-strict `≤`, distinct from membership `∈` and set inclusion `⊆`. Its operations concern line shapes, so two transverse lines meeting only at a point have no common one-dimensional segment. [Stiny 1980, pp. 343–344](https://journals.sagepub.com/doi/10.1068/b070343).

Use local unlabelled notation

\[
A\to B,\quad t(A)\leq S,\quad S'=(S-t(A))+t(B).
\]

Here `S` is the current shape, `A` and `B` are rule sides, and the same transformation `t` acts on both. This translates Stiny’s labelled `α`, `β`, `γ`, `τ` presentation; omitting labels is a teaching restriction. His empty-shape symbol is `s_φ`; the app may choose a separately defined `0_shape`. [Stiny 1980, pp. 343 and 347](https://journals.sagepub.com/doi/10.1068/b070343). Printed pp. 344 and 347 were visually checked against the preserved local PDF.

## Original teaching fixtures

These examples are authored for this project rather than copied diagrams.

- **Emergence:** draw `(0,0)–(3,0)` and `(3,0)–(6,0)`. The query `(2,0)–(4,0)` spans a stroke boundary but lies inside the fused line. Replacing the two strokes by `(0,0)–(6,0)` must not change matches.
- **Crossing:** horizontal `(−1,0)–(1,0)` and vertical `(0,−1)–(0,1)` intersect at a point. The shared one-dimensional shape is empty. Do not convert the crossing into a line element.
- **Ambiguity:** let `A` be `(0,0)–(2,0)` and let `B` add `(1,0)–(1,1)`. Identity and reflection across the horizontal axis place `A` identically but put the new stem on opposite sides. Keep both transformation witnesses.

## Implementation boundary and research boundary

The agreed prompt proposes a finite translation grid, D₄ orientations and a rational scale menu. Those are project restrictions; they do not define all shape grammars. The [Georgia Tech tutorial](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html), “Formal Definition” and “Single Line Case,” gives an implementation comparison and explains indeterminate cases. Its registration points are software aids, not intrinsic shape parts.

Identity rules can matter for recognizing parts even when geometry stays fixed; see [Stiny 1996](https://journals.sagepub.com/doi/10.1068/b230235) and [Stiny 2024, equations (1)–(3)](https://journals.sagepub.com/doi/10.1177/23998083241246668). Retrospective continuity is a deeper research subject; use [Haridis–Stiny, v3, opening sections](https://arxiv.org/abs/2012.10949v3) rather than equating it with smooth motion of a drawing.

**U₁₂ remains a source-lock task.** The intended reading is one-dimensional elements in a two-dimensional containing space. The bibliography supplies the relevant algebra sources, but the exact defining passage has not been checked. Do not silently present it as a completed formal engine specification. See [research gaps](../RESEARCH_LOG_AND_GAPS.md).
