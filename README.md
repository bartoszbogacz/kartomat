# kartomat

A collaborative playing table for board games.

Largely based on Spielunke with original idea by Julia Portl and
initial implementation by Julia Portl, Ole Johannson, and Bartosz Bogacz.

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

- Allow simply copying of URL for other players to join the game

- Global player UUID that remembers the playerAvatar.text so that
  if a player joins his name is set automatically

- Multiple views sharing the same player. Change map of sockets
  from player->socket to socket->player

# Nive to have

- Player Avatars that can be dragged

- Ability to remove elements from the editor

- A Wizard game board

# Bibliography

Adventures in data oriented design: Part 2
[Hierarchical Data](https://blog.molecular-matters.com/2013/02/22/adventures-in-data-oriented-design-part-2-hierarchical-data/)

Building a Data-oriented Entity System: Part 3
[The Transform Component](http://bitsquid.blogspot.com/2014/10/building-data-oriented-entity-system.html)

Practical Examples in Data Oriented Design
[Niklas](https://docs.google.com/present/view?id=0AYqySQy4JUK1ZGNzNnZmNWpfMzJkaG5yM3pjZA&hl=en)
