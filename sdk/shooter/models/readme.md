### EntityModel Class

extends `Emitter`, see: [event.Emitter](http://docs.gameclosure.com/api/event.html#class-event.emitter)

The `EntityModel` contains properties about the position and shape of an item. Is has a number of 
methods which are used to create and destroy it.

Parameters
 + `shape {math.geom.Rect|math.geom.Circle} = Circle(0,0,10)` ---Optional, set the size and shape of the item see: [Circle](http://docs.gameclosure.com/api/math.html#class-math.geom.circle) or [Rect](http://docs.gameclosure.com/api/math.html#class-math.geom.rect).
 + `width {number}` ---Optional, if not provided then the width of the shape is used.
 + `height {number}` ---Optional, if not provided then the height of the shape is used.
 + `game {Game}` ---An instance the the `Game` class used to interact with other items in the game.

#### Methods

__refreshOpts()__

This function is called after the model is obtained from a model pool. The `_opts` values are up to date at the
time this function is called.

__updatePos(pos)__

Update the position.

Parameters
 + `pos {math.geom.Point}` ---The new position, see: [Point](http://docs.gameclosure.com/api/math.html#class-math.geom.point).

__destroy()__

This function is called when the `ModelPool` in which this item is contained removes the model. It also
releases the view from the `ViewPool` associated with this model.

__isOffscreen()__

The tick function calls this function. If it returns true then the model will be removed.

__tick(dt)__

This function is called each frame by the `ModelPool`. If this function returns `true` then this model
will be removed from the pool and the `destroy` function is called. The tick function emits an `Update`
event with the `_opts` parameter which is used by the associated view to display the item.

Paramters
 + `dt {number}` ---The number of milliseconds elapsed since the last frame.
Returns
 {boolean} ---If true then the model pool will remove this item.

__getShape()__

Get the shape of the item, which is not a unique instance. This function is used for collision detection.

__getPosition()__

Get the position of the item.

Returns
 {math.geom.Point} ---The (x, y) position.

__getOpts()__

Get the options.

Returns
 {object} ---The options.

__collidesWith(item)__

Check if this item collides with another item.

Parameters
 + `item {EntityModel}` ---The item to check the collision against.
Returns
 {boolean} ---True if it collides.

__collidesWithModelPool(modelPool)__

Check if this item collides with any of the active items in the given model pool.

Parameters
 + `modelPool {ModelPool}` ---The model pool to check against.
Returns
 + {array} ---A list of items with which this item collides, empty if no collisions.

### ActorModel Class

extends `EntityModel`

This class exposes `health` related functions which can be used to count the number of times
an item has been hit by a projectile.

#### Methods

__tick(dt)__

This function returns `true` if the health is less than zero or if the `isOffscreen` function returns `true`.

Paramters
 + `dt {number}` ---The number of milliseconds elapsed since the last frame.
Returns
 {boolean} ---If true then the model pool will remove this item.

__setHealth(health)__

Set the health of the item.

Parameters
 + `health {number}` ---The new health value.

__getHealth()__

Get the health of the item.

Returns
 {number} ---The health value

__subHealth(health)__

Remove health from the item.

Returns
 {boolean} ---True if the health is less than zero.

### ModelPool Class

The `ModelPool` class contains a list of models. The tick function of all active models in this list 
is called. If a tick function of a model returns `true` then the model is removed from the active 
part of the list.

This class is meant to be subclassed.

Paramters
 + `defaultOpts {object}` ---The default options which are passed to the constructor of a new model allocated in the pool.

#### properties

__length__

The number of active items in the pool.

#### methods

<b>_allocItem(ctor, type)</b>

Allocate a new item. This function should be called from a subclass of this class.
If there's a free item with the same type then that item will be returned. If an existing item of the given type can't be found then a new item will be created and
added to the list.

Why not use `instanceof ctor` to figure out which type to allocate?
Because subclasses will be mixed up...

Parameters
 + `ctor {Class}` ---The constructor for the item to allocate.
 + `type {number}` ---The type of item to allocate.
Returns
 {Class} ---An instance of the given type.

__clear()__

Remove all active items from the list.
The destroy function of all items in the list is invoked which results in the associated views being released as well.

__reset()__

See `clear`.

__tick(dt)__

The tick function calls all active models in the pool. If the tick function of a model returns `true`
then that model is removed from the active part of the list.

Parameters
 + `dt {number}` ---The number of milliseconds elapsed since the last frame.

__getItems()__

Get the items contained in the pool. These are all items, both active and inactive!

Returns
 {Array} ---A list of models.