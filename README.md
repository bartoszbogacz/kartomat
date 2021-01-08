# kartomat

A collaborative playing table for board games.

Largely based on Spielunke with original idea by Julia Portl and
initial implementation by Julia Portl, Ole Johannson, and Bartosz Bogacz.

# Getting started

Unless you already did, enter the directory at top level

> cd kartomat

Compile client Typescript into Javascript. Build output is
put into ´dist/´.

> tsc.cmd

Run the server which currently is still written
in Javascript.

> node src/server.js

# Licenses

BSD-3-Clause

Modified [svg-cards](http://svg-cards.sourceforge.net/)
licensed as [LGPL 2.1](https://opensource.org/licenses/LGPL-2.1),
originally by [David Bellot](http://david.bellot.free.fr/)
licensed as [LGPL 2.1](https://opensource.org/licenses/LGPL-2.1)

# Issues

- There can only be one view per player, since sockets has an index on player.

- Touch movement does not work across all devices and browsers

- Concurrent addition and removal from cards of a deck, especially of
  the card leading of a deck, is still buggy.

Allieviate the issue by ensuring that cards are restted to the
playing area and that cards do hide within decks having wrong zIndices.

# External

- tsc will not start without modifying PowerShell execution policy

See: [NPM Issue 470](https://github.com/npm/cli/issues/470)

Or invoke with ´tsc.cmd´

- VSCode complains about duplicated functions

Make sure a tsconfig.json is present that does not include build outputs,
then restart VSCode

# Immediate TODOs

- Multiple views sharing the same player.

# Nive to have

- Show player.text instead of playerID when dragging

- Player Avatars that can be dragged

- Players having (persistent) colors and elements
  getting a short highlight of the player color.
  Instead of the current playerID tag.

- Ability to remove elements from the editor

- A Wizard game board

- A Tichu game board

- Send only deltas of game state from server.

- Transform only necessary changes

- Transform DOM elements using transform

- Record player.text in localStorage and set it automatically
  on joining a game

# Bibliography

Adventures in data oriented design: Part 2
[Hierarchical Data](https://blog.molecular-matters.com/2013/02/22/adventures-in-data-oriented-design-part-2-hierarchical-data/)

Building a Data-oriented Entity System: Part 3
[The Transform Component](http://bitsquid.blogspot.com/2014/10/building-data-oriented-entity-system.html)

Practical Examples in Data Oriented Design
[Niklas](https://docs.google.com/present/view?id=0AYqySQy4JUK1ZGNzNnZmNWpfMzJkaG5yM3pjZA&hl=en)

[Lamport timestamps](https://en.wikipedia.org/wiki/Lamport_timestamp)

Conflict-free replicated data type [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)

Fractional indexes [FIGMA](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/)
