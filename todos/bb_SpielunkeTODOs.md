# Create TODOs for Spielunke TODOs

# Open Tasks and tasks in progress

|  No | task                                                                       | assigned |
| --: | -------------------------------------------------------------------------- | -------- |
|   1 | design considerations for ~~private areas~~ everything (layout design.odp) | Olo      |
|   2 | dice cup: put dice in cup. "Shake" cup to trow all dice in it              | Julia    |
|   3 | show mouse cursors of all players                                          |
|   4 | support images for tokens                                                  |
|   5 | Keyboard shortcuts                                                         |
|   6 | export/import status                                                       |
|   7 | mini-view of others private-areas (difficult)                              |
|   8 | mini-view elements, style and postions (no logic)                          | Julia    |
|   9 | cards: send updates only once every 500ms                                  | Bartosz  |
|  10 | set fixed (e.g. 0) zIndex of private area                                  | Bartosz  |
|  11 | player names on cards                                                      | Bartosz  |
|  12 | card teller/collect machine                                                | Bartosz  |
|  13 | admin page                                                                 | Julia    |
|  14 | show count of cards on deck                                                | Bartosz  |
|  15 | remove unused deck control element divs                                    | Bartosz  |
|  18 | card release preview                                                       | Bartosz  |
|  19 | reverse deck when turned around                                            | Bartosz  |
|  20 | fix touchmove for cards (ontouch\* is experimental)                        | Bartosz  |

## Bugs

- Bartosz: onTouch cards: shuffle and turn over are performed twice
- Bartosz: onTouch cards: can't move cards, only decks
- Bartosz: card "disappears" when dragged from deck (fire relayout on mousedown already)
- Julia: notepad on f5 inconsistent ownership

## advanced

| task                                                                             | assigned |
| -------------------------------------------------------------------------------- | -------- |
| mobile app: for taking images and uploading in Cloud in correct folder hierarchy |
| Add voice chat to spielunke                                                      |

# Done

| task                                                                                                                                                   | assigned      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| multiroom support                                                                                                                                      | Ole           |
| extract from spec.json: default.json, predefined.json.                                                                                                 | Julia         |
| read default values from default.json                                                                                                                  | Julia         |
| documentation of spec.json (Dice, tokens, cards, boards)                                                                                               | Julia         |
| split game.html into: html, css, js                                                                                                                    | Julia         |
| connect and integrate carddecks into config and status                                                                                                 | Bartosz/Julia |
| add card stack module                                                                                                                                  | Bartosz       |
| game url should immediately redirect to user specific urls.</br>Allows players to reload their page with maintaining their ids (keyword: private area) | Julia         |
| implementation of private areas                                                                                                                        | Bartosz       |
| customize player names (textinput in game.html, show at cursors and in log)                                                                            | Julia         |
| log (e.g. player X moved, player Y threw the dice, player Z edited notes ...)                                                                          | Julia         |
| Tokens: todo incremental updates: i.e. multiusresupport. shall one user lock a certain stone for others?                                               | Julia         |
| import gameconfig.json from textarea in index.html                                                                                                     | Julia         |
| add "invite players"-link                                                                                                                              | Julia         |
| add module for editfield for game notes (as writable board)                                                                                            | Julia         |
| add support for different propabilities for dice sides (is already implicitely possible by repetition of side)                                         |
| making touch sensitive to work on touch screens                                                                                                        | Julia         |
| ~~one-finger-move/left-click to move tokens or cards,<br/> two-finger-move/right-click to move boards, dice or card decks~~                            |
| shuffle animation for card deck                                                                                                                        | Julia         |
| add list of current players (above log)                                                                                                                | Julia         |
| carddeck actions: shuffle, move, unfold (make to hand cards), turn around                                                                              | Bartosz       |
| add cards-for-players (hand cards) module ~~(support pushing cards up)~~                                                                               | Bartosz       |
| incremental card updates                                                                                                                               | Bartosz       |
| make dice movable                                                                                                                                      | Julia         |
| make sure cards are behind tokens                                                                                                                      | Bartosz       |
| update docu                                                                                                                                            | Julia         |
| add current owner display to block                                                                                                                     | Julia         |
| cards: run prediction on client                                                                                                                        | Bartosz       |
| reload status on reconnect                                                                                                                             | Julia         |
| show "last updated"                                                                                                                                    | Julia         |
| fix F5                                                                                                                                                 | Julia         |
| more shapes for tokens                                                                                                                                 | Julia         |
