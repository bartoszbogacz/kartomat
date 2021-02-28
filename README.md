# kartomat

A collaborative playing table for board games.

Largely based on Spielunke with original idea by Julia Portl and
initial implementation by Julia Portl, Ole Johannson, and Bartosz Bogacz.

# License

[BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause) for source code
and [CC0](https://creativecommons.org/publicdomain/zero/1.0/) for assets.

Modified [svg-cards](http://svg-cards.sourceforge.net/)
originally by [David Bellot](http://david.bellot.free.fr/)
licensed as [LGPL 2.1](https://opensource.org/licenses/LGPL-2.1).

# Getting started

Unless you already did, enter the directory at top level

> cd kartomat

Compile client Typescript into Javascript. Build output is
put into ´dist/´.

Typescript compiler `tsc` will refurse to start without modifying PowerShell execution policy

See: [NPM Issue 470](https://github.com/npm/cli/issues/470)

Invoke with ´tsc.cmd´ or with ´npx tsc´

> npx tsc

Run the server which currently is still written
in Javascript.

> node src/server.js

If VSCode complains about duplicated functions make sure a tsconfig.json
is present that does not include build outputs, then restart VSCode

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
