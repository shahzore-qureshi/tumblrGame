import ui.View as View;

exports = Class(View, function (supr) {
	this.init = function (opts) {
		supr(this, 'init', [opts]);

		this._grid = null;
		this._adventureMapView = opts.adventureMapView;
		this._editMode = opts.editMode;
		this._gridSettings = opts.gridSettings;
		this._nodeSettings = opts.nodeSettings;
		this._tileSettings = opts.tileSettings;
		this._pathSettings = opts.pathSettings;
		this._map = opts.map;
		this._views = [];
		this._needsPopulate = true;

		this.style.visible = false;
	};

	this.refreshAll = function () {
		var views = this._views;
		var grid = this._grid;
		var width = this._gridSettings.width;
		var height = this._gridSettings.height;

		for (var y = 0; y < height; y++) {
			var line = views[y];
			for (var x = 0; x < width; x++) {
				var view = line[x];
				view && view.update && view.update(grid, x, y);
			}
		}
	};

	this.onUpdate = function (data) {
		this._needsPopulate && this.populateView(data);
	};

	this.refreshTile = function (tileX, tileY) {
		var view = this._views[tileY][tileX];
		view && view.update(this._grid, tileX, tileY);
	};
});