# kartomat

A collaborative playing table for board games.

Largely based on Spielunke with original idea by Julia Portl and
initial implementation by Julia Portl, Ole Johannson, and Bartosz Bogacz.

# Licenses

BSD-3-Clause

Modified [svg-cards](http://svg-cards.sourceforge.net/),
originally by [David Bellot](http://david.bellot.free.fr/)
licensed as [LGPL 2.1](https://opensource.org/licenses/LGPL-2.1)

# Issues

- There can only be one view per player, since sockets has an index on player.

- Touch movement does not work across all devices and browsers

- Concurrent addition and removal from cards of a deck, especially of
  the card leading of a deck, is still buggy.

Allieviate the issue by ensuring that cards are restted to the
playing area and that cards do hide within decks having wrong zIndices.

# Immediate TODOs

- Allow simply copying of URL for other players to join the game

- Global player UUID that remembers the playerAvatar.text so that
  if a player joins his name is set automatically

# Nive to have

- Player Avatars that can be dragged

- Ability to remove elements from the editor

- A Wizard game board
