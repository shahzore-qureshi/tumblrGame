Back to [adventure map documentation](./readme.md).

### AdventureModel class

The `AdventureModel` class is constructed by the `AdventureMap`, you don't have
to instantiate it yourself. 

There are a number of public functions which are mainly for internal use,
the functions listed here are useful to extend the functionality of the map.

#### Tile data structure

 + `node {number}` ---The node image, 0 is no image.
 + `right {number}` ---The right path image, 0 is no image.
 + `bottom {number}` ---The bottom path image, 0 is no image.
 + `rightTop {number}` ---The right top path image, 0 is no image.
 + `rightBottom {number}` ---The right bottom path image, 0 is no image.
 + `x {number}` ---The position within the tile in the range of 0..1.
 + `y {number}` ---The position within the tile in the range of 0..1.
 + `title {string}` ---Optional, can be used for labels.
 + `text {string}` ---Optional, can be used for labels.
 + `tags {object}` ---The tags attached to this node.

If the `node` is set then the image information in the `nodeSettings.nodes` list is used,
the index is the `node` value minus one.

If `right`, `bottom`, `rightBottom` or `rightTop` is set then the image information in the 
`pathSettings.paths` list is used, the index is the given value minus one.

#### Methods

__getGrid(tileX, tileY)__

If the `tileX` and `tileY` values are undefined then this function returns the
grid else it returns a tile on the grid.

Returns
 {array|object} ---The entire grid or a tile.

__getNodesByTag()__

Get an object, each key has a list of one or more nodes.
You can use this function to divide you map into zones.

Returns
 {object} ---Each key has a list of one or more nodes.

__getNodesById()__

Get all nodes indexed by id.

Returns
 {object} ---A list of nodes.

__getMaxNodeId()__

Get the maximum node id, only numeric ids are checked.
You can use the minimum and maximum values to iterate over the nodes.

Returns
 {number} ---The highest numeric id.

__getMinNodeId()__

Get the minimum node id, only numeric ids are checked.
You can use the minimum and maximum values to iterate over the nodes.

Returns
 {number} ---The lowest numeric id.

__addTagById(id, tag)__

Add a tag to the node with the given id.
When the tag is added and the node is visible then the update function
is called, if there's a view attached to the tag then that view shows up
immediately.

Parameters
 + `id {string}` ---The id of the node.
 + `tag {string}` ---The tag to add to the node.

Also see: [Grid settings documentation](./settings.md).

__removeTagById(id, tag)__

Remove a tag from the node with the given id.
When the tag is remove and the node is visible then the update function
is called, if there's a view attached to the tag then that view is hidden
immediately.

Parameters
 + `id {string}` ---The id of the node.
 + `tag {string}` ---The tag to add to the node.

Also see: [Grid settings documentation](./settings.md).

__removeTag(tag)__

Check all nodes and remove the given tag or tags.

Parameters
 + `tag {string|object}` ---If string then remove matching tags, if an object then remove the tags which match the keys of the object.