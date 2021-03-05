# Refactor Component Dependencies

Components must not be allowed to modify state. Otherwise their order of
invokation is relevant and effects cannot be exactly assigned whether they
are displayed on this tick or on the next tick. Compare for example, the
notice in client.ts/render

    // This order is important. It should be
    // loc1, strat, stack, loc2. Computes
    // in-between are fine.
    // FIXME: locatablesCompute2 needs to be called twice,
    // since stackingsCreateNew may add new ones on button
    // presses and these need to be available by stratifersCompute
    // and than again, based on the dividers again for button
    // presses

Rendering depends on order. Since some elements want to create their
own elements instead of relying on Locatable. But then, they do not want
to be responsible for actual placement logic. Compare for example,
Avatar, Writeable, and Stacking.

Also:

    // Both Locatable and Avatar want to create an element for their
    // entitiy. We schedule avatarsRender to be called earlier than
    // locatablesRender so that Avatar gets priority to create a
    // textarea instead of a div element in locatablesRender. After
    // an element was create the explicit check prevents it from being
    // re-created. The same is the case for Writeables and Stackings.
    // This is admittably less than elegant and implements an unspecified
    // ad-hoc inheritance structure. For now, it does afford a way of
    // specialization, however.

## Goals

Remove any `throw new Error("Locations not yet computed.");`.
Enfore inter-component dependencies using the type system.

## Approach

To enable dependencies _between_ components we use a multi-phase invokation.

    function componentCompute(game: SynchronizedGame): DiffToComputedState

    function componentRender(computed: ComputedState)

So that the data flow can be illustrated as follows:

    computed_t <- mergeLWW(computed_t-1, receive())

    deltaA <- computeComponent(readonly game)
    deltaB <- computeComponent(readonly game)
    deltaC <- computeComponent(readonly game)

    computed_t+1 <- join(computed_t, deltaA, deltaB, deltaC)

    renderComponent(readonly computed_t+1)
    renderComponent(readonly computed_t+1)
    renderComponent(readonly computed_t+1)

    send(computed_t+1)

Unsolved questions / cases. There is a difference in changed state
and necessary modification between

    - Re-rendering of a frame where no computed state has changed

    - Movement of a single element that does not interact with any other

    - Remote change of the game state
