import event.Emitter as Emitter;

var DEFAULT_TILE_VALUES = {
		x: 0.5,
		y: 0.5,
		node: 0,
		right: 0,
		bottom: 0,
		rightTop: 0,
		rightBottom: 0,		
		doodad: 0,
		doodadX: 0.5,
		doodadY: 0.5,
		tags: 'anything',
		text: '',
		title: '',
		id: ''
	};

exports = Class(Emitter, function (supr) {
	this.init = function (opts) {
		var data = {
				width: opts.width,
				height: opts.height,
				tileWidth: opts.tileWidth,
				tileHeight: opts.tileHeight,
				tileX: 0,
				tileY: 0
			};
		var grid = [];

		this._defaultTile = opts.defaultTile;
		this._map = this.createEmptyMap(opts.width, opts.height, opts.defaultTile);

		for (var y = 0; y < data.height; y++) {
			var gridLine = [];
			for (var x = 0; x < data.width; x++) {
				gridLine.push({
					node: 0,
					right: 0,
					bottom: 0,
					x: 0.5,
					y: 0.5
				});
			}
			grid.push(gridLine);
		}

		data.grid = grid;

		this._data = data;

		this._maxNodeId = 0;
		this._minNodeId = 999999;

		this._nodesByTag = {};
		this._nodesById = {};

		this._needsPopulate = false;

		try {
			var savedData = localStorage.getItem('MAP_DATA');
			if (savedData !== null) {
				this.load(JSON.parse(savedData));
			}
		} catch (error) {
		}
	};

	this.createEmptyMap = function (width, height, value) {
		var result = [];
		for (var y = 0; y < height; y++) {
			result[y] = [];
			for (var x = 0; x < width; x++) {
				result[y][x] = (height - y - 1) * width + x;
			}
		}
		return result;
	};

	this.tick = function (dt) {
		if (this._needsPopulate) {
			this._needsPopulate = false;
			this.emit('NeedsPopulate');
		}

		this.emit('Update', this._data);
	};

	this.update = function () {
		var data = this._data;
		var grid = data.grid;
		var width = data.width;
		var height = data.height;

		this._nodesByTag = {};

		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var tile = grid[y][x];
				if ('tags' in tile) {
					var tags = tile.tags;
					tile.tileX = x;
					tile.tileY = y;
					for (var tag in tags) {
						if (this._nodesByTag[tag]) {
							this._nodesByTag[tag].push(tile);
						} else {
							this._nodesByTag[tag] = [tile];
						}
					}
				}
			}
		}
	};

	this.getMap = function () {
		return this._map;
	};

	this.getTileWidth = function () {
		return this._data.tileWidth;
	};

	this.getTileHeight = function () {
		return this._data.tileHeight;
	};

	this.getTileX = function () {
		return this._data.tileX;
	};

	this.getTileY = function () {
		return this._data.tileY;
	};

	this.getData = function (tileX, tileY) {
		return this._data;
	};

	this.getGrid = function (tileX, tileY) {
		if (tileY === undefined) {
			return this._grid;
		}
		return this._data.grid[tileY][tileX];
	};

	this.getNodesByTag = function (tag) {
		return this._nodesByTag[tag] || [];
	};

	this.getNodesById = function () {
		return this._nodesById;
	};

	this.getMaxNodeId = function () {
		return this._maxNodeId;
	};

	this.getMinNodeId = function () {
		return this._minNodeId;
	};

	this.addTagById = function (id, tag) {
		var tile = this._nodesById[id];
		if (tile) {
			if (!tile.tags) {
				tile.tags = {};
			}
			tile.tags[tag] = true;
			this.emit('UpdateTile', tile.tileX, tile.tileY);
		}
	};

	this.removeTagById = function (id, tag) {
		var tile = this._nodesById[id];
		if (tile) {
			if (tile.tags) {
				delete tile.tags[tag];
			}
			this.emit('UpdateTile', tile.tileX, tile.tileY);
		}
	};

	this.removeTag = function (tag) {
		if (typeof tag === 'Object') {
			var tags = tag;
			for (var id in this._nodesById) {
				var tile = this._nodesById[id];
				if (tile.tags) {
					var found = false;
					for (tag in tile.tags) {
						if (tags[tag]) {
							delete tile.tags[tag];
							found = true;
						}
					}
					found && this.emit('UpdateTile', tile.tileX, tile.tileY);
				}
			}
		} else {
			for (var id in this._nodesById) {
				var tile = this._nodesById[id];
				if (tile.tags && tile.tags[tag]) {
					delete tile.tags[tag];
					this.emit('UpdateTile', tile.tileX, tile.tileY);
				}
			}
		}
	};

	this.onSize = function (sizeX, sizeY) {
		this._maxX = this._data.width - sizeX;
		this._maxY = this._data.height - sizeY;
	};

	this.toJSON = function () {
		var map = this._map;
		var data = this._data;
		var grid = data.grid;
		var result = {
				tileWidth: this._data.tileWidth,
				tileHeight: this._data.tileHeight,
				width: data.width,
				height: data.height,
				grid: []
			};

		for (var y = 0; y < data.height; y++) {
			var gridLine = grid[y];
			var lastValue = null;
			var same = true;

			result.grid[y] = [];
			for (var x = 0; x < data.width; x++) {
				var tile = gridLine[x];
				var saveTile = {};

				for (var i in tile) {
					if ((i in DEFAULT_TILE_VALUES) && 
						((DEFAULT_TILE_VALUES[i] === 'anything') || (tile[i] !== DEFAULT_TILE_VALUES[i]))) {
						saveTile[i] = tile[i];
					}
				}

				var mapValue = map[y][x];

				// If there's anything interesting then save the object...
				if (Object.keys(saveTile).length) {
					same = false; // If it's an object then save all values in this row...
					saveTile.map = mapValue;
					result.grid[y][x] = saveTile;
				} else { // If there's nothing interesting then save the background...
					result.grid[y][x] = mapValue;
					if (lastValue === null) {
						lastValue = mapValue;
					} else if (lastValue !== mapValue) {
						same = false;
					}
				}
			}

			// If all the items are numeric and the same then store a single value...
			if (same) {
				result.grid[y] = [lastValue];
			}
		}

		return result;
	};

	this.clear = function () {
		var data = this._data;
		var grid = data.grid;
		var map = this._map;

		for (var y = 0; y < data.height; y++) {
			var gridLine = grid[y];
			var mapLine = map[y];

			for (var x = 0; x < data.width; x++) {
				var tile = gridLine[x];
				tile.node = 0;
				tile.right = 0;
				tile.bottom = 0;
				tile.rightTop = 0;
				tile.rightBottom = 0;
				tile.x = 0.5;
				tile.y = 0.5;
				tile.title = '';
				tile.text = '';
				tile.tags = {};

				mapLine[x] = this._defaultTile;
			}
		}
	};

	this.load = function (data) {
		var map = this._map;
		var grid = data.grid;
		var width = data.width;
		var height = data.height;

		this._data.width = width;
		this._data.height = height;
		this._data.tileWidth = data.tileWidth;
		this._data.tileHeight = data.tileHeight;

		this._nodesByTag = {};
		this._nodesById = {};

		this._maxNodeId = 0;
		this._minNodeId = 999999;

		for (var y = 0; y < height; y++) {
			var gridLine = grid[y];

			for (var x = 0; x < width; x++) {
				var tile = gridLine[Math.min(x, gridLine.length - 1)];
				if (typeof tile === 'number') { // If it's only a background then set the background and make a new tile...
					map[y][x] = tile;
					tile = {};
				} else {
					map[y][x] = tile.map;
				}
				for (var i in DEFAULT_TILE_VALUES) {
					// If there's no value and the value can't be "anything" then set the default:
					if (!(i in tile) && (DEFAULT_TILE_VALUES[i] !== 'anything')) {
						tile[i] = DEFAULT_TILE_VALUES[i];
					}
				}
				delete tile.map;

				tile.tileX = x;
				tile.tileY = y;
				if (tile.tags) {
					var tags = tile.tags;
					for (var tag in tags) {
						if (this._nodesByTag[tag]) {
							this._nodesByTag[tag].push(tile);
						} else {
							this._nodesByTag[tag] = [tile];
						}
					}
				}

				if (('id' in tile) && ('x' in tile)) {
					var nodeId = parseInt(tile.id, 10);
					if (!isNaN(nodeId)) {
						this._minNodeId = Math.min(this._minNodeId, nodeId);
						this._maxNodeId = Math.max(this._maxNodeId, nodeId);
					}
					this._nodesById[tile.id] = tile;
				}

				this._data.grid[y][x] = tile;
			}

			// If the map was larger the remove the remaining part:
			while (this._data.grid[y].length > width) {
				this._data.grid[y].pop();
			}
			while (map[y].length > width) {
				map[y].pop();
			}
		}

		// If the map was larger the remove the remaining part:
		while (this._data.grid.length > height) {
			this._data.grid.pop();
		}
		while (map.length > height) {
			map.pop();
		}
	};
});