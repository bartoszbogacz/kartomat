# kartomat

A collaborative playing table for board games.

Largely based on Spielunke with original idea by Julia Portl and
initial implementation by Julia Portl, Ole Johannson, and Bartosz Bogacz.

# Getting started

Unless you already did, enter the directory at top level

> cd kartomat

Compile client Typescript into Javascript. Build output is
put into ´dist/´.

> npx tsc

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

- Clients are identified by playerId which two clients may share.
  In that case the provisions for the lock-out do not work and
  textarea are not updated. Basic aynchronization should not be
  affected though.

- Grabbing a card to turn it also moves it left on stack since
  there is left bias implemented. Also moving a card only one
  or two slots in either direction turns it since it was never
  outside its turning radius. Only turn cards not on stacks?

# External

- tsc will not start without modifying PowerShell execution policy

See: [NPM Issue 470](https://github.com/npm/cli/issues/470)

Or invoke with ´tsc.cmd´ or with ´npx tsc´

- VSCode complains about duplicated functions

Make sure a tsconfig.json is present that does not include build outputs,
then restart VSCode

# Do as next item

- Create a card when choosing the card item in context menu

# Getting-acquainted Tasks

- Show number of cards on a deck as a number below the control elements

- Show actual running games in the index.html instead of the hard-coded ones

- Admin dashboard with log of boards being loaded, games being opened,
  players joining, and performance metrics such as time to broadcast
  all changes for each game

# Tasks

- An game editor

- Move remaining TODOs from Spielunke over here

- Show player.text instead of playerID when dragging

- Player Avatars that can be dragged

- Players having (persistent) colors and elements
  getting a short highlight of the player color.
  Instead of the current playerID tag.

- A Wizard game board

- A Tichu game board

- Send only deltas of game state from server

- Re-compute game state only for changed CRDT items

- Transform DOM elements using transform3D in CSS
  This significantly faster as no DOM re-layout is triggered

- Record player.text in localStorage and set it automatically
  on joining a game

- Ability to remove elements from the editor
  Requires tombstones in CRDT.

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
