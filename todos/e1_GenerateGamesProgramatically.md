# Generate Games Programatically

For now, as long as the Editor is not ready, it make sense generate some
games programatically. Do this on server side. The presets can later move
to client side. There should be no manually generated JSON boards. All boards
are either programatically generated or saved from the editor.

## Hydration and de-hydration

Saved games should not contain `tick` and `ownedBy`.
In `server.js`, implement a `function dehydrateGame` that removes
such properties when a game is saved.

Running games must contain `tick` and `ownedBy`.
In `server.js`, implement a method `function hydrateGame` that adds
these properties to a game when it is loaded.

As this task only creates games, instead of saving them, hydration is
used here only for automatically generated games.

## Dog for 6 people

For now, all the following will be in `server.js`.

Implement `deckOfRummy(x, y, fold, side)` that creates a deck of Rummy
located at `x, y` being in the folding state `fold` and all showing the
side `side`.

Implement `gameDogFor6()` that uses `deckOfRummy` and places a board,
six player avatars, 24 marbles and a deck of Rummy cards.

Marbles will be `Draggable` and `Locatable` and will all have the same
`cssClass` `MarbleItem`. Colors and size will be set by the `color` and
`size` properties of `Locatable`.

The size of the marbles are `20px` times `20px`.

The positions for the marbles are:

    {y: 62, x: 418}
    {y: 56, x: 387}
    {y: 56, x: 358}
    {y: 56, x: 326}
    {y: 170, x: 609}
    {y: 195, x: 625}
    {y: 219, x: 642}
    {y: 247, x: 654}
    {y: 473, x: 660}
    {y: 503, x: 645}
    {y: 532, x: 633}
    {y: 555, x: 615}
    {y: 676, x: 425}
    {y: 680, x: 394}
    {y: 680, x: 360}
    {y: 681, x: 332}
    {y: 566, x: 127}
    {y: 540, x: 109}
    {y: 512, x: 93}
    {y: 484, x: 79}
    {y: 254, x: 79}
    {y: 221, x: 95}
    {y: 194, x: 108}
    {y: 172, x: 126}

The colors for the marbles are as ordered above are:

    "DodgerblueMarble"
    "DodgerblueMarble"
    "DodgerblueMarble"
    "DodgerblueMarble"
    "ForestgreenMarble"
    "ForestgreenMarble"
    "ForestgreenMarble"
    "ForestgreenMarble"
    "DimgrayMarble"
    "DimgrayMarble"
    "DimgrayMarble"
    "DimgrayMarble"
    "GoldMarble"
    "GoldMarble"
    "GoldMarble"
    "GoldMarble"
    "CrimsonMarble"
    "CrimsonMarble"
    "CrimsonMarble"
    "CrimsonMarble"
    "SnowMarble"
    "SnowMarble"
    "SnowMarble"
    "SnowMarble"

The dog board is `"boards/dog.png"`.

## Dog for 8 people

The positions of marbles are:

    {y: 200, x: 701}
    {y: 482, x: 726}
    {y: 515, x: 715}
    {y: 548, x: 700}
    {y: 234, x: 715}
    {y: 700, x: 545}
    {y: 714, x: 512}
    {y: 729, x: 480}
    {y: 20, x: 484}
    {y: 46, x: 551}
    {y: 265, x: 730}
    {y: 33, x: 517}
    {y: 725, x: 262}
    {y: 196, x: 47}
    {y: 228, x: 33}
    {y: 262, x: 19}
    {y: 713, x: 231}
    {y: 19, x: 266}
    {y: 45, x: 200}
    {y: 32, x: 234}
    {y: 480, x: 17}
    {y: 513, x: 32}
    {y: 544, x: 46}
    {y: 699, x: 198}

The colors of marbles are:

    "MediumorchidMarble"
    "DodgerblueMarble"
    "DodgerblueMarble"
    "DodgerblueMarble"
    "MediumorchidMarble"
    "ForestgreenMarble"
    "ForestgreenMarble"
    "ForestgreenMarble"
    "DimgrayMarble"
    "DimgrayMarble"
    "MediumorchidMarble"
    "DimgrayMarble"
    "OrangeMarble"
    "GoldMarble"
    "GoldMarble"
    "GoldMarble"
    "OrangeMarble"
    "CrimsonMarble"
    "CrimsonMarble"
    "CrimsonMarble"
    "DarkturquoiseMarble"
    "DarkturquoiseMarble"
    "DarkturquoiseMarble"
    "OrangeMarble"

The dog board is `"boards/dog8.png"`.

## Wizard

The face images of cards are:

    ["rummy/club_1.png", "rummy/back_blue.png"]
    ["rummy/club_2.png", "rummy/back_blue.png"]
    ["rummy/club_3.png", "rummy/back_blue.png"]
    ["rummy/club_4.png", "rummy/back_blue.png"]
    ["rummy/club_5.png", "rummy/back_blue.png"]
    ["rummy/club_6.png", "rummy/back_blue.png"]
    ["rummy/club_7.png", "rummy/back_blue.png"]
    ["rummy/club_8.png", "rummy/back_blue.png"]
    ["rummy/club_9.png", "rummy/back_blue.png"]
    ["rummy/club_10.png", "rummy/back_blue.png"]
    ["rummy/club_jack.png", "rummy/back_blue.png"]
    ["rummy/club_queen.png", "rummy/back_blue.png"]
    ["rummy/club_king.png", "rummy/back_blue.png"]
    ["rummy/diamond_1.png", "rummy/back_blue.png"]
    ["rummy/diamond_2.png", "rummy/back_blue.png"]
    ["rummy/diamond_3.png", "rummy/back_blue.png"]
    ["rummy/diamond_4.png", "rummy/back_blue.png"]
    ["rummy/diamond_5.png", "rummy/back_blue.png"]
    ["rummy/diamond_6.png", "rummy/back_blue.png"]
    ["rummy/diamond_7.png", "rummy/back_blue.png"]
    ["rummy/diamond_8.png", "rummy/back_blue.png"]
    ["rummy/diamond_9.png", "rummy/back_blue.png"]
    ["rummy/diamond_10.png", "rummy/back_blue.png"]
    ["rummy/diamond_jack.png", "rummy/back_blue.png"]
    ["rummy/diamond_queen.png", "rummy/back_blue.png"]
    ["rummy/diamond_king.png", "rummy/back_blue.png"]
    ["rummy/heart_1.png", "rummy/back_blue.png"]
    ["rummy/heart_2.png", "rummy/back_blue.png"]
    ["rummy/heart_3.png", "rummy/back_blue.png"]
    ["rummy/heart_4.png", "rummy/back_blue.png"]
    ["rummy/heart_5.png", "rummy/back_blue.png"]
    ["rummy/heart_6.png", "rummy/back_blue.png"]
    ["rummy/heart_7.png", "rummy/back_blue.png"]
    ["rummy/heart_8.png", "rummy/back_blue.png"]
    ["rummy/heart_9.png", "rummy/back_blue.png"]
    ["rummy/heart_10.png", "rummy/back_blue.png"]
    ["rummy/heart_jack.png", "rummy/back_blue.png"]
    ["rummy/heart_queen.png", "rummy/back_blue.png"]
    ["rummy/heart_king.png", "rummy/back_blue.png"]
    ["rummy/spade_1.png", "rummy/back_blue.png"]
    ["rummy/spade_2.png", "rummy/back_blue.png"]
    ["rummy/spade_3.png", "rummy/back_blue.png"]
    ["rummy/spade_4.png", "rummy/back_blue.png"]
    ["rummy/spade_5.png", "rummy/back_blue.png"]
    ["rummy/spade_6.png", "rummy/back_blue.png"]
    ["rummy/spade_7.png", "rummy/back_blue.png"]
    ["rummy/spade_8.png", "rummy/back_blue.png"]
    ["rummy/spade_9.png", "rummy/back_blue.png"]
    ["rummy/spade_10.png", "rummy/back_blue.png"]
    ["rummy/spade_jack.png", "rummy/back_blue.png"]
    ["rummy/spade_queen.png", "rummy/back_blue.png"]
    ["rummy/spade_king.png", "rummy/back_blue.png"]
    ["rummy/joker_red.png", "rummy/back_blue.png"]
    ["rummy/joker_red.png", "rummy/back_blue.png"]
    ["rummy/joker_red.png", "rummy/back_blue.png"]

## Tichu

## Ligretto
