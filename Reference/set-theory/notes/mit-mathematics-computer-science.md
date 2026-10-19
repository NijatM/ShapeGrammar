# Mathematics for Computer Science

## Reading guide

Review: **selected-sections**, 2026-10-19. MIT OCW May 18, 2015 PDF: introductory proof discussion, Chapter 4 selected sets/functions/relations definitions (pp.81–89), and §5.4 opening robot invariant example (pp.130–132) read.

The 920-page text and its later proofs, counting and probability chapters were not reviewed. Textbook examples illustrate mathematical reasoning; no new empirical test is reported.

## What the selected text explains

How sets, functions, relations and proofs describe computational processes precisely. The useful connection here is between a sequence of rule applications and a mathematical transition system. [1](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf) [2](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf)

## The essential distinction

Many successful examples do not prove a universal statement. The text’s initially promising polynomial n²+n+41 fails to be prime at n=40. A preserved invariant instead supports an argument covering every permitted step. [1](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf) [2](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf)

## Method and worked example

Model a robot’s position as an integer pair and its moves as transitions to diagonal neighbors. The coordinate sum starts even and each move changes it by −2, 0 or 2. Consequently the robot cannot reach (1,0). [2](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf)

## What this gives you

Invariants can rule out entire families of outcomes without enumerating every path. The claim concerns the stated transition model; changing the allowed moves changes the argument. [2](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf)

## A convention to notice

This text allows partial functions and calls a function total when defined throughout its domain. Other introductory sources here use “function” for total functions. Check that convention before comparing definitions. [1](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf)

## Key terms

- **Invariant**: A property preserved by every allowed transition.
- **Partial function**: A single-valued rule that may be undefined at some inputs.

## Read next

- [Proof versus examples; mathematical data types](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf): Introduction and §1.1, printed pp.3–6; Chapter 4 pp.81–89
- [State transitions and a parity invariant](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/mit6_042js15_textbook.pdf): §5.4, printed pp.130–132, Lemma 5.4.1

## Access and preservation

2015 textbook title page states Creative Commons Attribution-NonCommercial-ShareAlike 3.0. Preserve attribution and notice; noncommercial and ShareAlike conditions apply. This record remains link-only; no new public PDF mirror was added.

This annotation is an original reading aid. Consult the linked text for complete arguments, notation and qualifications.
