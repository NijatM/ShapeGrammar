# The Arithmetic of Shapes

Ramesh Krishnamurti · 1980

Review basis: selected-sections. Author-hosted original inspected for rational coordinates, line representation, Boolean algorithms and data structures; printed pp. 470–471 also checked as page images.

The pseudocode was read for its structure, not independently implemented or formally verified. Operation-count bounds are not modern machine benchmarks.

## In brief

Krishnamurti turns shape arithmetic into algorithms: combine line content, remove it, keep common intervals, test parthood and compare shapes. The emphasis is choosing a representation that makes geometric coverage computable. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=1) [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=6)

## The question

How can a program manipulate shapes geometrically, including parts that were never separate drawing objects, without relying on approximate coordinate equality? [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=1)

## Main idea or claim

Exact rational coordinates and maximal-line organization support systematic Boolean operations on shapes and labelled shapes. Drawing order is replaced by geometric ordering. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=1)

## How the work approaches it

Group collinear maximal segments by their supporting-line descriptor, then order their endpoints. Compare compatible lists with advancing scans; handle labelled points through corresponding set operations. Later routines organize updates with linked lists and balanced trees. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=1) [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=6) [3](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=12)

## Evidence and examples

The paper supplies pseudocode, correctness arguments and interval-case diagrams. Figure 5 distinguishes shortening, splitting and deleting a line during subtraction; Figure 6 gives the corresponding intersections. [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=6)

## What comes out of it

For already ordered, same-carrier lists, union, difference and intersection have linear operation-count bounds in the combined list lengths. These local bounds should not be read as a universal bound for unrestricted rule matching. [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=6)

## Limits to keep in mind

This is analytical algorithm development, not a user experiment or timing study. Rational line shapes and labelled points are the stated setting; finding the transformations for rule application is pursued in the 1981 companion paper. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=1) [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=6)

## What to take from it

Think coverage and maximal segments rather than original strokes. Read representation first, then trace subtraction on two overlapping intervals before tackling the implementation data structures. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=1) [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=6) [3](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=12)

## Where to read

- [pp. 463–467: rational shapes and representation](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=1) — Defines exact rational coordinates and ordered maximal-line lists.
- [pp. 468–473: algorithms and their bounds](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=6) — Derives union, difference, intersection, parthood and equality procedures.
- [pp. 474–484: decomposition and data structures](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb070463-arithmeticOfShapes.pdf#page=12) — Explains ordered-list/tree organization and implementation routines.

## Rights

No public redistribution permission verified; citation and lawful reading link only.
