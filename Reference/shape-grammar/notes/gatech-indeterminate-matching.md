# Indeterminate Matching

Source ID: `gatech-indeterminate-matching`. Year: undated. Contributors as recorded: Georgia Tech Shape Computation Lab.

[Canonical metadata](../metadata/gatech-indeterminate-matching.json) · [Structured reading guide](../../reading-guides/gatech-indeterminate-matching.json) · [Original source](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## Material inspected

The complete public tutorial, parameter table and exercises were read.

Review level: **full-text**. The exercises were not executed in Shape Machine. Parameter and registration-point claims describe that implementation, not universal properties of every shape formalism.

## What it is about

This tutorial explains how Shape Machine handles rules whose matching transformation is not completely determined by the query geometry. A continuum of valid transformations may remain unless the user or software supplies further choices.

[Part 1: Anatomy of a Replacement Rule → Formal Definition](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html) · [Part 2: Scale, Angle and Single Line Case; parameter summary table](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## The underlying problem

Finding a part and choosing a placement are related but different tasks. A single line can fit inside another line at multiple positions and scales; a circle can leave rotational freedom even when its size and centre are fixed.

[Part 2: Scale, Angle and Single Line Case; parameter summary table](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## The rule application to keep clear

For u → v in a design w, choose one transformation f with f(u) ≤ w, then compute w′ = w − f(u) + f(v). The same f transforms both sides. Independently placing the replacement is not the rule application described here.

[Part 1: Anatomy of a Replacement Rule → Formal Definition](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## How the tutorial teaches it

Examples match a K-shaped query within a double square, add a diameter to a circle, delete a line and offset lines. Exercises vary transformation modes and parameters to expose which geometric freedoms remain.

[Part 2: Scale, Angle and Single Line Case; parameter summary table](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## What the software parameters do

The tutorial describes scale and angle choices, and a max setting that selects a largest fitting scale rather than a user-specified one. Under affinity, degree distinguishes directional stretching from uniform scaling. Registration points are explicitly an internal speed-up device, not part of the abstract definition of shape.

[Part 2: Scale, Angle and Single Line Case; parameter summary table](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## What follows

A matching result depends on the permitted transformation family and on how free parameters are resolved. The examples show why software needs explicit conventions when the mathematically possible family is not finite.

[Part 1: Anatomy of a Replacement Rule → Formal Definition](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html) · [Part 2: Scale, Angle and Single Line Case; parameter summary table](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## What was not demonstrated here

This review reads documentation; it does not benchmark or independently validate the software. The tutorial’s broad wording about normal finite matching and single-line cases needs its stated transformation context. Finite sampling in this project does not enumerate every continuously variable match.

[Part 2: Scale, Angle and Single Line Case; parameter summary table](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## How to use it in your experiments

State the transformation family before counting matches. Change one parameter at a time, and distinguish the transformations allowed in principle from those searched by a particular implementation. Use the source tutorial to compare conventions with this project’s deliberately bounded search.

[Part 1: Anatomy of a Replacement Rule → Formal Definition](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html) · [Part 2: Scale, Angle and Single Line Case; parameter summary table](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html)

## Originals and rights

No public redistribution permission verified; citation and lawful reading link only.

[Rights evidence](https://shapemachine.gatech.edu/tutorials/tutorials/2_indeterminate_matching_and_rule_sequences.html).
