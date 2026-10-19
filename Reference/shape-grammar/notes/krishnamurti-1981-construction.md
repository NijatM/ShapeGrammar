# The Construction of Shapes

Ramesh Krishnamurti · 1981

Review basis: selected-sections. Author-hosted paper: introduction, transformation and registration algorithms, and finite/infinite matching discussion.

Selected primary sections reviewed, including pp. 18–21. No implementation benchmark or independent proof verification is claimed.

## In brief

This companion to The Arithmetic of Shapes tackles the harder step in applying a rule: finding transformations that embed its left-hand shape in a drawing. It turns geometric recognition into registration and checking procedures. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## The question

Given shapes A and S, which translations, rotations, reflections and changes of scale make t(A) a part of S? One suitable transformation must subsequently govern both sides of a rule. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## Main idea or claim

Distinguishable geometric features can constrain a transformation. Candidate registrations can then be checked with the arithmetic and part relation developed in the earlier paper. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) [3](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## How the work approaches it

The paper represents shapes with maximal straight elements and labelled points, derives useful registration features from their geometry, and separates configurations by how much freedom remains. Matching corresponding features determines candidate transformations; containment tests reject invalid ones. [1](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) [3](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## Evidence and examples

The support is mathematical case analysis, worked geometric configurations and detailed algorithmic procedures. The discussion explicitly considers configurations admitting finitely many matches and those admitting infinitely many. [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) [3](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## What comes out of it

The algorithm covers finite cases under its stated conditions. For infinite families, additional provisos choose representative placements, for example by aligning endpoints. These conventions make computation manageable without enumerating every continuous placement. [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## Limits to keep in mind

Its soundness discussion must not be read as a finite enumeration of all transformations in every case. The provisos matter. This is an algorithmic treatment of specified shape representations, without a reported modern performance benchmark. [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) [3](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## What to take from it

Separate candidate generation from exact containment checking. Always ask whether a matching configuration determines finitely many transformations or leaves a continuous freedom that needs an explicit convention. [2](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) [3](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf)

## Where to read

- [pp. 5–8: formulation and shape representation](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) — The recognition problem and relationship to shape arithmetic.
- [pp. 18–21: provisos and soundness discussion](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) — Distinguishes finite solutions from representative choices in infinite cases.
- [pp. 21–39: transformation and registration procedures](https://www.andrew.cmu.edu/user/ramesh/pub/distribution/journal/epb080005-constructionOfShapes.pdf) — Algorithmic construction using correspondences and admissible transformations.

## Rights

No public redistribution permission verified; citation and lawful reading link only.
