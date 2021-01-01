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

- Touch movement does not work across all devices and browsers

- Concurrent addition and removal from cards of a deck, especially of
  the card leading of a deck, is still buggy.

Allieviate the issue by ensuring that cards are restted to the
playing area and that cards do hide within decks having wrong zIndices.

# Immediate TODOs

- Allow simply copying of URL for other players to join the game

The playerId could be stored in localStorage?

- A Wizard game board

# Nive to have

- Player Avatars that can be dragged

- A board editor that saves the current state

Saved state should be sanitized, by resetting all upToTick,
ownedBy, PlayerAvatar.represents and PlayerAvatar.text to
their defaults.
