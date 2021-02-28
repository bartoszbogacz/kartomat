# Fix Card Turning

Grabbing a card to turn it also moves it left on stack since
there is left bias implemented. Also moving a card only one
or two slots in either direction turns it since it was never
outside its turning radius. Only turn cards not on stacks?
