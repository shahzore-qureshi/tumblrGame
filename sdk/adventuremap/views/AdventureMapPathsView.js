import ui.View as View;
import ui.resource.Image as Image;

import .tiles.PathView as PathView;
import .AdventureMapLayerView;

exports = Class(AdventureMapLayerView, function (supr) {
	this.populateView = function (data) {
		var grid = data.grid;
		var width = this._gridSettings.width;
		var height = this._gridSettings.height;
		var tileWidth = this._tileSettings.tileWidth;
		var tileHeight = this._tileSettings.tileHeight;

		for (var y = 0; y < height; y++) {
			var line = [];
			for (var x = 0; x < width; x++) {
				var tile = grid[y][x];
				var view = null;
				if (this._editMode || tile.right || tile.bottom || tile.rightTop || tile.rightBottom) {
					view = new PathView({
						superview: this,
						x: x * tileWidth,
						y: y * tileHeight,
						width: tileWidth,
						height: tileHeight,
						adventureMap: this._adventureMap,
						tileSettings: this._tileSettings,
						pathSettings: this._pathSettings
					});

					view.update(grid, x, y);
				}
				line[x] = view;
			}

			this._views.push(line);
		}

		this._grid = grid;
		this._needsPopulate = false;
	};
});