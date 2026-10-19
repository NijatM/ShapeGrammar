# Group theory: symmetry and composition

Use the local 2025 edition of Judson’s *Abstract Algebra: Theory and Applications* as the introductory backbone. Milne is a later, more advanced reference; the MIT courses provide independent study material. [Catalogue](../CATALOGUE.md#group-theory).

A group consists of a set with a binary operation satisfying associativity, an identity and inverses for all elements. Closure is built into saying the operation maps `G×G` to `G`. Commutativity is an additional property, not a group axiom. A table alone needs more checking than a Latin-square pattern. [Judson, §3.2](https://judsonbooks.org/aata-files/aata-20250801.pdf).

Here **D₄ has order 8**, the four rotations and four reflections of a square. This agrees with Judson’s `D_n` convention: order `2n`, §§5.2, pp. 93–94. Other sources may use `D_8` for this same group, so translate conventions explicitly. Group elements are the symmetry transformations; square vertices are the set on which they act.

## Original square example

Take column vectors. Let `r(x,y)=(-y,x)` and `s(x,y)=(x,-y)`. Compose right to left, so `rs` means apply `s`, then `r`.

\[
r^4=e,\qquad s^2=e,\qquad srs=r^{-1}.
\]

For `(1,0)`, `rs(1,0)=(0,1)` but `sr(1,0)=(0,-1)`. This explicitly exhibits noncommutativity. These coordinates are a project-authored realization of the dihedral relations; the reference is [Judson, Theorems 5.2.2–5.2.3](https://judsonbooks.org/aata-files/aata-20250801.pdf).

## Learning landmarks

- A subgroup must itself satisfy the group conditions under the inherited operation: §3.3.
- A cyclic subgroup consists of powers of one element; its order and the ambient group’s order are different notions: §4.1.
- A homomorphism preserves the operation. Its kernel is the preimage of the target identity: §11.1.
- A normal subgroup permits a well-defined group operation on cosets; a quotient group is more than an arbitrary partition: §10.1.
- An action obeys `e·x=x` and `(gh)·x=g·(h·x)`. Orbits are equivalence classes for reachability under the group, and stabilizers collect elements fixing a point: §14.1.

These locators refer to the pinned local PDF. The contents and the dihedral/action passages were inspected; full lesson proofs and distractors still require an authoring review.

## Why the proposed matching domain is generally not a group

This is an original deduction from the group axioms and the project’s proposed domain. If translation vectors lie in a bounded grid, composing two allowed translations can leave the grid. If the scale menu is `{1/2,1,2}`, composing scale `2` with itself gives scale `4`, outside the menu. Thus the full allowed match domain need not be closed under composition. D₄ itself is a group. This distinction prevents a finite search configuration from being mistaken for an algebraic theorem.
