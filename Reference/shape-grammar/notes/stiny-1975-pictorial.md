# Pictorial and Formal Aspects of Shape and Shape Grammars

Source ID: `stiny-1975-pictorial`. Year: 1975. Contributors as recorded: George Stiny.

[Canonical metadata](../metadata/stiny-1975-pictorial.json) · [Structured reading guide](../../reading-guides/stiny-1975-pictorial.json) · [Original source](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf)

## Material inspected

Read 36 selected printed pages in the publisher book PDF: pp.1–2, 4–9, 117–122, 133–136, 144–146, 170–177 and 282–288, plus contents. Printed page p corresponds to PDF page p+18. Visually checked Fig.2-8 (p.134) and the special matching condition on p.175.

Review level: **selected-sections**. Reviewed 2026-10-20. This is a reading of selected foundational passages, not the entire 403-page book. The reduction/intersection/difference algorithms, other proofs, painting specifications and Part II aesthetic-system developments were not reviewed in full. The early grammar definition is distinguished from later formulations.

## Short overview

Stiny develops shape grammars through a visual account followed by a formal treatment of two-dimensional rectilinear shapes. The selected passages explain why a finite drawing specification can contain geometric parts that are not among its stored lines, define an early grammar with coordinated marker components, and outline how it can simulate a Turing machine. Later parts of the book connect grammars to paintings and aesthetic systems; those parts are outside this detailed reading.

[pp.1–2 and 4–9: introduction and pictorial foundations](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=19) · [pp.117–122: §2.1, formal shapes and rational representation](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=135) · [pp.133–136 and 144–146: §2.3, occurrence, equivalence and subshape](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=151) · [pp.170–177: §§2.5.3–2.6.1, set analogy and early grammar definition](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=188) · [pp.282–288: §2.10, shape grammars and Turing machines](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=300)

## Question and premise

How can a shape formalism remain responsive to what people see while supporting explicit mathematical definitions? A single picture may have several finite line specifications. The framework therefore distinguishes the stored specification, the visible shape content, geometric containment and generation by rules.

[pp.1–2 and 4–9: introduction and pictorial foundations](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=19) · [pp.117–122: §2.1, formal shapes and rational representation](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=135) · [pp.133–136 and 144–146: §2.3, occurrence, equivalence and subshape](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=151)

## The central distinction: content versus specification

In the formal model a shape is specified by a finite collection of nonzero straight segments and their endpoints. Two specifications can differ yet be pictorially equivalent because adjacent or overlapping collinear segments draw the same content. Likewise, a line may occur within a shape without belonging to its stored segment list. Subshape is defined through that occurrence relation, so containment need not mean subset inclusion between the stored endpoint or segment sets.

[pp.117–122: §2.1, formal shapes and rational representation](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=135) · [pp.133–136 and 144–146: §2.3, occurrence, equivalence and subshape](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=151)

## How the selected formal passages work

The pictorial account introduces union and transformations. Chapter 2 then gives definitions and propositions for line occurrence, pictorial equivalence and subshape. The 1975 grammar is an indexed system: a rule changes a visible component together with one or more marker-shape components under a shared transformation. It includes an additional representation-based matching restriction when the combined rule geometry has fewer than two intersection points, expressly to avoid uncountably many applications in that case.

[pp.1–2 and 4–9: introduction and pictorial foundations](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=19) · [pp.117–122: §2.1, formal shapes and rational representation](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=135) · [pp.133–136 and 144–146: §2.3, occurrence, equivalence and subshape](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=151) · [pp.170–177: §§2.5.3–2.6.1, set analogy and early grammar definition](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=188)

## Examples and constructive argument

Fig.2-8 shows lines occurring within and across the original collinear segments. Fig.2-9 shows unequal specifications with identical pictures. The special matching case is motivated by the continuously many placements of a smaller segment inside a larger one. In §2.10, triangles encode machine states and tape symbols; arranged copies represent a tape, and shape rules represent left or right transitions. The text gives the basic construction and leaves completion details to the reader.

[pp.133–136 and 144–146: §2.3, occurrence, equivalence and subshape](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=151) · [pp.170–177: §§2.5.3–2.6.1, set analogy and early grammar definition](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=188) · [pp.282–288: §2.10, shape grammars and Turing machines](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=300)

## What the reviewed passages establish

The part relation and pictorial equivalence provide a formal account of geometric content beyond the stored list. The book draws analogies with set relations and operations, while noting that a shape complement is not generally another shape in this system. Its Turing-machine discussion concerns the particular formal grammar and effective representation assumptions developed here. It does not establish that every later form of unrestricted visual computation has the same behavior.

[pp.117–122: §2.1, formal shapes and rational representation](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=135) · [pp.133–136 and 144–146: §2.3, occurrence, equivalence and subshape](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=151) · [pp.170–177: §§2.5.3–2.6.1, set analogy and early grammar definition](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=188) · [pp.282–288: §2.10, shape grammars and Turing machines](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=300)

## Historical and reading limits

Do not silently replace this early indexed grammar with a later unlabelled rule definition: its marker components and special matching case matter. The formal algorithms adopt rational-coordinate representations; the text’s discussion of irrational coordinates should not be read as a claim about all possible exact number encodings. The simulation is a constructive outline, not a proof independently completed in this review. No detailed claim about the unread aesthetic-system chapters is inferred from their headings.

[pp.1–2 and 4–9: introduction and pictorial foundations](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=19) · [pp.117–122: §2.1, formal shapes and rational representation](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=135) · [pp.170–177: §§2.5.3–2.6.1, set analogy and early grammar definition](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=188) · [pp.282–288: §2.10, shape grammars and Turing machines](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=300)

## What to carry into an experiment

Draw a long line in two joined strokes, then select a shorter line that crosses their join. Compare the list of strokes with the line content you can recognize. Next ask whether moving that selected part is allowed by the exact grammar under discussion. This separates representation, containment and matching assumptions instead of treating every shape-grammar definition as identical.

[pp.133–136 and 144–146: §2.3, occurrence, equivalence and subshape](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=151) · [pp.170–177: §§2.5.3–2.6.1, set analogy and early grammar definition](https://link.springer.com/content/pdf/10.1007/978-3-0348-6879-2.pdf#page=188)

## Useful terms

- **Pictorial equivalence:** Two finite specifications display the same line content even if their stored segment lists differ.
- **Line occurrence:** A line is covered by a shape’s geometric content, potentially across adjacent or overlapping collinear stored lines.
- **Indexed marker components:** Separate marker shapes coordinated with the visible component in this book’s early grammar definition.

## Originals and rights

No public redistribution permission verified; citation and lawful reading link only.

[Rights evidence](https://link.springer.com/book/10.1007/978-3-0348-6879-2).
