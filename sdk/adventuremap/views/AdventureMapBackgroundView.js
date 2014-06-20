import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import .tiles.TileView as TileView;
import .AdventureMapLayerView;

exports = Class(AdventureMapLayerView, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._tiles = opts.tileSettings.tiles ? this._loadTiles(opts.tileSettings.tiles) : [];
	};

	this._loadTiles = function (tiles) {
		var i = tiles.length;
		while (i) {
			if (typeof tiles[--i] === 'string') {
				tiles[i] = new Image({url: tiles[i]});
			}
		}

		return tiles;
	};

	this.populateView = function (data) {
		var grid = data.grid;
		var width = this._gridSettings.width;
		var height = this._gridSettings.height;
		var tileWidth = this._tileSettings.tileWidth;
		var tileHeight = this._tileSettings.tileHeight
		var margin = this._editMode ? 8 : 0;

		for (var y = 0; y < height; y++) {
			var line = [];
			for (var x = 0; x < width; x++) {
				var view = new TileView({
						superview: this,
						x: x * tileWidth,
						y: y * tileHeight,
						width: tileWidth - margin,
						height: tileHeight - margin,
						map: this._map,
						tileSettings: this._tileSettings
					});

				view.update(grid, x, y);

				line.push(view);
			}

			this._views.push(line);
		}

		this._grid = grid;
		this._needsPopulate = false;
	};

	this.getMap = function () {
		return this._map;
	};

	this.refreshTile = function (tileX, tileY) {
		this._views[tileY][tileX].setImage(this._tiles[this._map[tileY][tileX]]);
	};
});