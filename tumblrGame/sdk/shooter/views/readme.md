### EntitySpriteView Class

extends `SpriteView`, see: [ui.SpriteView](http://doc.gameclosure.com/api/ui-spriteview.html)

The `EntitySpriteView` class can be used as a view for the `EntityModel` class. It has methods
for positioning and updating the view based on information from the model.

Parameters
 + `showCollision {boolean}` ---Show the collision area, works only in the browser.

#### Methods

__setSize(width, height)__

Sets the size of the view and updates the offsets. When the view is displayed the position denotes the
center of the view.

Parameters
 + `width {number}` ---The width of the view.
 + `height {number}` ---The height of the view.

__onUpdate(opts)__

When the model emits an `Update` signal this function should be subscribed to apply the 
model's data to the view.

Paramaters
 + `opts {object}` ---The opts from the view, including the position.

__getCurrentAnimationName()__

Get the name of the current animation.

Returns
 {string} ---The name of the animation.

__play(animationName, opts)__

Play an animation. This doesn't do anything if the given animation is already playing.

Parameters
 + `animationName {string}` ---The name of the animation
 + `opts {object}` ---The settings (like `loop`), see: [SpriteView]()

### InputView Class

If you use an `InputView` then you can set the `blockEvents` property of all other views
in the game to `false` which increases the performance.

The `InputView` class does not have any relevant public functions but does emit useful events.

#### Events

__Click__

Emitted when the user clicks the view.

Parameters
 + `x {number}` ---The horizontal position scaled to the app view.
 + `y {number}` ---The vertical position scaled to the app view.

__Start__

Emitted when the user clicks the view.

__Move__

Emitted when the user drags on the screen.

Parameters
 + `pt {object}` ---The new drag position: x, y.

__Drag__

Parameters
 + `angle {number}` ---The direction of the drag in radians.

__DragUp__

Emitted when the user drags up.

__DragDown__

Emitted when the user drags down.

### WorldView Class

The `WorldView` class is the superview that contains all views in the game.
It provides utility functions for managing views, particles and layers.

This view blocks all input events so you need to use it in combination with an `InputView`.

#### Methods

__reset()__

Reset all particle systems.

__obtainView(opts)__

Obtain a view from a view pool. The `opts` object should contain a `type` field indicating from which
view pool the view should be obtained.

This function is used by the `Game` class to connect a model to a view. The call is made from `Game.onItemSpawned`.

The `opts` parameter contains the model properties. A `releaseView` callback is attached to this object 
which is called when the model is released from the model pool.

Parameters
 + `opts {object}` ---Properties from the model.

__addViewPool(type, viewPoolOpts)__

Add a view pool. The type is the same type as described in `obtainView` and should match a model pool
in the `Game` instance.
The `viewPoolOpts` are constructor parameters used for creating a new `ViewPool` instance.

Parameters
 + `type {number}` ---The identifier for this view pool, should match the id of a `ModelPool` instance in `Game`.
 + `viewPoolOpts {object}` ---The constructor options of a view pool, see: [ViewPool](http://doc.gameclosure.com/api/ui-viewpool.html).

__getViewPools()__

Get a list of all view pools.

Returns
 {array} ---A list of view pools.

__addParticleSystem(type, particleSystemOpts)__

You can create multiple particle systems which allows you to add particle systems to different -depth- layers of your game.
The `update` function in this class updates all particle systems.

Parameters
 + `type {number|string}` ---The id for this particle system.
 + `particleSystemOpts {object}` ---Constructor options for a new particle system, see: [ParticleSystem](https://github.com/gameclosure/shooter/tree/master/particle).

__getParticleSystem(type)__

Get a particle system.

Parameters
 + `type {number|string}` ---An id matching an existing particle system.

Returns
 {ParticleSystem} ---A particle system.

__createParticles(type, particleType, pos, velocity, count)__

Create particles.

Parameters
 + `type {number|string}` ---The id for the particle system to create particles in.
 + `particleType {string}` ---The type of particles to create.
 + `pos {object}` ---The position, `x` and `y`.
 + `velocity {object}` ---Optional, velocity if the particles should all move.
 + `count {number}` ---The number of particles to create.

__update(dt)__

Update all particle systems.

Parameters
 + `dt {number}` ---The number of milliseconds elapsed since the last frame.

__createLayer(tag, superview, blockEvents)__

Create a new layer with the size of the given superview.

Parameters
 + `tag {string}` ---The name of the layer which shows up in the inspector in the simulator screen.
 + `superview {View}` ---The parent view of the layer.
 + `blockEvents {boolean} = true` ---Should input events be blocked?