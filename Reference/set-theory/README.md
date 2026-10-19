# Set theory: reading and foundational notes

Start with Richard Hammack’s *Book of Proof*, Chapter 1. Continue with Chapter 11 for relations, Chapter 12 for functions and Chapter 14 for cardinality. All four downloaded books live in `originals/`; they have different licenses. See [catalogue](../CATALOGUE.md#set-theory) and [rights](../RIGHTS_AND_ATTRIBUTION.md).

## Concepts to keep distinct

Membership `x ∈ A` says that `x` is an element of `A`. Inclusion `A ⊆ B` says every element of `A` belongs to `B`. Equality of sets is mutual inclusion. For example, with `A={1,2}`, `1∈A` and `{1}⊆A`, while `{1}∈A` is false. The empty set is a subset of every set; it need not be an element of a given set. A power set contains subsets as its elements. [Hammack, Chapter 1](https://richardhammack.github.io/BookOfProof/).

For sets, union selects elements in either set, intersection selects elements in both, and difference selects those in the first but not the second. These should not be substituted uncritically for shape operations on maximal lines. An ordered pair records order, and `A×B` contains all pairs with first entry in `A` and second entry in `B`. [Zach, Fall 2025, §§1.4–1.5](https://slc.openlogicproject.org/archives/f25/slc-screen.pdf).

A function has a domain and codomain and assigns exactly one output to each domain element. Its image can be smaller than its codomain. The preimage of a subset of the codomain is the collection of inputs landing there; taking preimages does not require an inverse function. Composition requires compatible types. Injective means no two distinct inputs share an output, surjective means every codomain element is reached, and bijective means both. [Hammack, §§12.1–12.6](https://richardhammack.github.io/BookOfProof/).

A relation on `X` is a subset of `X×X`. An equivalence relation is reflexive, symmetric and transitive. Its classes partition `X`; the quotient set collects those classes. Do not confuse a representative with its entire class. [Zach, Fall 2025, §§2.1–2.3](https://slc.openlogicproject.org/archives/f25/slc-screen.pdf).

## Original examples and proof prompts

- `f:{−2,−1,0,1,2}→{0,1,4}`, `f(x)=x²`, is surjective and not injective. The preimage of `{1}` is `{−1,1}`.
- On integers, declare `a~b` when `a−b` is divisible by 3. Prove all three equivalence conditions and describe the three classes.
- Refute “every function has an inverse function” with the squaring example. Explain how a different domain/codomain can change the conclusion.

These are project-authored exercises. Their eventual automated assessments need explicit domain/codomain and equality criteria; an unrestricted proof should receive an authored rubric rather than a claim of automatic proof verification.

Use Hammack’s proof chapters for direct proof, contradiction, contraposition and induction. Cardinality compares sets using bijections, not physical size or drawing area. Countability and uncountability need separate arguments; see Hammack Chapter 14 and Zach Chapter 4. Button’s later axiomatic material is optional, after the introductory path, not a prerequisite to seeing a shape rule.
