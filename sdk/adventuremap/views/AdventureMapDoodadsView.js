import .tiles.DoodadView as DoodadView;
import .AdventureMapLayerView;

exports = Class(AdventureMapLayerView, function (supr) {
	this.populateView = function (data) {
		var grid = data.grid;
		var width = this._gridSettings.width;
		var height = this._gridSettings.height;
		var tileWidth = this._tileSettings.tileWidth;
		var tileHeight = this._tileSettings.tileHeight

		for (var y = 0; y < height; y++) {
			var line = [];
			for (var x = 0; x < width; x++) {
				var view = null;
				var tile = grid[y][x];
				if (this._editMode || tile.doodad || tile.node) {
					view = new DoodadView({
						superview: this,
						x: x * tileWidth,
						y: y * tileHeight,
						width: tileWidth,
						height: tileHeight,
						map: this._map,
						tileSettings: this._tileSettings,
						nodeSettings: this._nodeSettings,
						adventureMapView: this._adventureMapView
					});

					view.update(grid, x, y);
				}

				line.push(view);
			}

			this._views.push(line);
		}

		this._grid = grid;
		this._needsPopulate = false;

		this.canHandleEvents(false);
	};

	this.removeItemViews = function () {
		var views = this._views;
		var width = this._gridSettings.width;
		var height = this._gridSettings.height;

		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var view = views[y][x];
				view && view.removeItemViews();
			}
		}
	};
});