# Refactor Turnable and Visual

Merge Turnable and Visual into one Component that provides rendering for all
entities. It contains for each side, the backgroundColor, the backgroundShape,
the backgroundImage, and the size of the HTML element, and a customCSS for overriding
properties. It also contains a probability transition matrix for turning things around.

A game board is a turnable with one side. A marble is a turnable with one side.
